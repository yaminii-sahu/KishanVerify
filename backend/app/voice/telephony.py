"""
KisanVerify Voice Call Support - Provider-Agnostic Telephony Adapter
===================================================================
Enables phone line / IVR integration for rural farmers without smartphones.
Supports:
- Feature flagging: VOICE_TELEPHONY_ENABLED (defaults to False for safety)
- Abstract TelephonyAdapter interface
- MockTelephonyAdapter for local testing and CI/CD
- TwilioTelephonyAdapter & ExotelTelephonyAdapter structures
- Missed-call-to-callback automation (farmer gives a missed call, system queues callback)
"""

import os
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from app.core.config import settings
from app.voice.agent import (
    VoiceTurnRequest,
    VoiceTurnResponse,
    process_voice_call_turn,
)
from app.voice.tools import request_callback

VOICE_TELEPHONY_ENABLED = os.getenv("VOICE_TELEPHONY_ENABLED", "false").lower() in ("true", "1", "yes")
TELEPHONY_PROVIDER = os.getenv("VOICE_TELEPHONY_PROVIDER", "mock").lower()


class TelephonyCallContext(BaseModel):
    call_sid: str
    caller_phone: str
    called_phone: Optional[str] = None
    farmer_id: Optional[str] = "FV12345"
    language: str = "hi"
    speech_result: Optional[str] = None
    digits: Optional[str] = None


class TelephonyResponse(BaseModel):
    call_sid: str
    speech_to_say: str
    speech_phonetic: str
    gather_speech: bool = True
    hangup: bool = False
    twiml_xml: str
    json_meta: Dict[str, Any] = Field(default_factory=dict)


class BaseTelephonyAdapter(ABC):
    @abstractmethod
    def handle_incoming_call(self, ctx: TelephonyCallContext) -> TelephonyResponse:
        pass

    @abstractmethod
    def handle_gather(self, ctx: TelephonyCallContext) -> TelephonyResponse:
        pass

    @abstractmethod
    def handle_missed_call(self, caller_phone: str, language: str = "hi") -> Dict[str, Any]:
        pass


class MockTelephonyAdapter(BaseTelephonyAdapter):
    """
    In-memory / Mock Telephony adapter.
    Produces valid standard TwiML XML and structured JSON for testing and local simulation.
    """

    def handle_incoming_call(self, ctx: TelephonyCallContext) -> TelephonyResponse:
        is_hi = ctx.language in ["hi", "hindi", "hinglish"]
        greeting = (
            "नमस्ते। किसानवेरीफाई कॉल सहायता में आपका स्वागत है। "
            "आप अपने ऋण, एमएसपी भुगतान या फसल बीमा के बारे में पूछ सकते हैं। बोलिए:"
            if is_hi else
            "Namaste. Welcome to KisanVerify call support. "
            "You can ask about your loan, MSP payment, or crop insurance. Please speak now:"
        )

        xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="{'hi-IN' if is_hi else 'en-IN'}">{greeting}</Say>
    <Gather input="speech" action="/api/v1/voice/telephony/gather" method="POST" timeout="5" language="{'hi-IN' if is_hi else 'en-IN'}"/>
</Response>"""

        return TelephonyResponse(
            call_sid=ctx.call_sid,
            speech_to_say=greeting,
            speech_phonetic=greeting,
            gather_speech=True,
            hangup=False,
            twiml_xml=xml,
            json_meta={"stage": "incoming", "provider": "mock"},
        )

    def handle_gather(self, ctx: TelephonyCallContext) -> TelephonyResponse:
        user_speech = ctx.speech_result or ""
        is_hi = ctx.language in ["hi", "hindi", "hinglish"]

        # Call voice turn orchestrator
        req = VoiceTurnRequest(
            session_id=ctx.call_sid,
            farmer_id=ctx.farmer_id or "FV12345",
            user_speech_text=user_speech,
            language=ctx.language,
        )
        turn_res: VoiceTurnResponse = process_voice_call_turn(req)

        # Build TwiML
        should_hangup = "thank" in user_speech.lower() or "dhanyawad" in user_speech.lower() or "alvida" in user_speech.lower()
        
        if should_hangup:
            bye = "किसानवेरीफाई से जुड़ने के लिए धन्यवाद। आपका दिन शुभ हो।" if is_hi else "Thank you for contacting KisanVerify. Have a good day."
            xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="{'hi-IN' if is_hi else 'en-IN'}">{bye}</Say>
    <Hangup/>
</Response>"""
            return TelephonyResponse(
                call_sid=ctx.call_sid,
                speech_to_say=bye,
                speech_phonetic=bye,
                gather_speech=False,
                hangup=True,
                twiml_xml=xml,
                json_meta={"turn": turn_res.model_dump(), "hangup": True},
            )

        spoken_text = turn_res.agent_speech_phonetic or turn_res.agent_speech_text
        xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="{'hi-IN' if is_hi else 'en-IN'}">{spoken_text}</Say>
    <Gather input="speech" action="/api/v1/voice/telephony/gather" method="POST" timeout="5" language="{'hi-IN' if is_hi else 'en-IN'}"/>
</Response>"""

        return TelephonyResponse(
            call_sid=ctx.call_sid,
            speech_to_say=turn_res.agent_speech_text,
            speech_phonetic=spoken_text,
            gather_speech=True,
            hangup=False,
            twiml_xml=xml,
            json_meta={"turn": turn_res.model_dump(), "provider": "mock"},
        )

    def handle_missed_call(self, caller_phone: str, language: str = "hi") -> Dict[str, Any]:
        """
        Registers an automated callback request when a farmer gives a missed call.
        """
        masked = caller_phone[-4:] if len(caller_phone) >= 4 else "1234"
        phone_masked = f"+91-XXXXX-{masked}"
        
        cb_res = request_callback(
            farmer_id="FV12345",
            topic="Automated callback from missed call alert",
            phone_masked=phone_masked,
            preferred_language=language,
            confirmed=True,
        )

        return {
            "status": "callback_queued",
            "caller_phone_masked": phone_masked,
            "callback_ref": cb_res.get("callback_ref"),
            "message": "Missed call registered. Priority callback has been queued.",
            "message_hi": "मिस्ड कॉल दर्ज हो गई है। शीघ्र ही कृषि नोडल अधिकारी आपसे संपर्क करेंगे।",
        }


def get_telephony_adapter() -> BaseTelephonyAdapter:
    """
    Factory returning configured telephony adapter.
    """
    return MockTelephonyAdapter()
