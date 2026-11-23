import os
import time
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query
from pydantic import BaseModel
import httpx

router = APIRouter(prefix="/weather", tags=["Weather Forecasts & Agro-Advisories"])

# In-memory weather cache (3-hour TTL)
_weather_cache: Dict[str, Any] = {}
CACHE_TTL = 3 * 3600

# Chhattisgarh Default coordinates (Patan, Durg)
DEFAULT_LAT = 21.03
DEFAULT_LON = 81.53

def interpret_wmo_code(code: int) -> Dict[str, str]:
    """Interprets WMO Weather interpretation codes (WW)."""
    mapping = {
        0: ("Clear sky", "साफ आसमान"),
        1: ("Mainly clear", "मुख्य रूप से साफ"),
        2: ("Partly cloudy", "आंशिक रूप से बादल"),
        3: ("Overcast", "घने बादल"),
        45: ("Fog", "कोहरा"),
        48: ("Depositing rime fog", "घना कोहरा"),
        51: ("Light drizzle", "हल्की बूंदाबांदी"),
        53: ("Moderate drizzle", "मध्यम बूंदाबांदी"),
        55: ("Dense drizzle", "तेज बूंदाबांदी"),
        61: ("Slight rain", "हल्की बारिश"),
        63: ("Moderate rain", "मध्यम बारिश"),
        65: ("Heavy rain", "भारी बारिश"),
        71: ("Slight snow", "हल्की बर्फबारी"),
        73: ("Moderate snow", "बर्फबारी"),
        75: ("Heavy snow", "भारी बर्फबारी"),
        80: ("Slight rain showers", "हल्की बौछारें"),
        81: ("Moderate rain showers", "मध्यम बौछारें"),
        82: ("Violent rain showers", "मूसलाधार बारिश"),
        95: ("Thunderstorm", "गरज-चमक के साथ आंधी"),
        96: ("Thunderstorm with slight hail", "आंधी-तूफान व ओलावृष्टि"),
        99: ("Thunderstorm with heavy hail", "भारी ओलावृष्टि"),
    }
    en, hi = mapping.get(code, ("Partly cloudy", "आंशिक रूप से बादल"))
    return {"condition_en": en, "condition_hi": hi}

def generate_agricultural_advisories(
    current_temp: float,
    max_temp: float,
    min_temp: float,
    precipitation_sum: float,
    max_rain_prob: int,
    max_wind: float,
    humidity: int
) -> List[Dict[str, Any]]:
    """
    Deterministic rule engine that produces agricultural advisories with severity levels:
    Levels: 'Warning' (critical action needed), 'Watch' (prepare/monitor), 'Info' (optimal/general).
    """
    advisories: List[Dict[str, Any]] = []

    # Rule 1: Heavy Rain / Spraying Advisory
    if precipitation_sum >= 25.0 or max_rain_prob >= 75:
        advisories.append({
            "id": "adv-rain-heavy",
            "level": "Warning",
            "category": "Spraying & Drainage",
            "title": "Heavy Rain Alert: Halt all pesticide & fertilizer spraying",
            "title_hi": "भारी वर्षा चेतावनी: कीटनाशक व उर्वरक छिड़काव तुरंत रोकें",
            "description": f"Forecast indicates {precipitation_sum:.1f} mm rain with {max_rain_prob}% probability. High precipitation will wash away chemical inputs and risk waterlogging.",
            "description_hi": f"{precipitation_sum:.1f} मिमी बारिश व {max_rain_prob}% संभावना का अनुमान है। कीटनाशक बह जाएंगे और खेत में जलभराव हो सकता है।",
            "action": "Ensure field drainage channels are cleared and transfer harvested paddy/produce under waterproof tarpaulins.",
            "action_hi": "खेतों में जल निकासी नालियां साफ रखें और कटी फसल/अनाज को तिरपाल से ढकें।",
        })
    elif precipitation_sum >= 6.0 or max_rain_prob >= 40:
        advisories.append({
            "id": "adv-rain-moderate",
            "level": "Watch",
            "category": "Field Spraying",
            "title": "Moderate Rain Watch: Postpone chemical spraying",
            "title_hi": "मध्यम वर्षा संभावना: छिड़काव स्थगित करें",
            "description": f"Chances of rain ({max_rain_prob}%) over the next 48 hours. Foliar sprays may lose efficacy.",
            "description_hi": f"अगले 48 घंटों में बारिश ({max_rain_prob}%) की संभावना है। छिड़काव का प्रभाव कम हो सकता है।",
            "action": "Delay urea top-dressing and chemical sprays until weather clears.",
            "action_hi": "मौसम साफ होने तक यूरिया टॉप-ड्रेसिंग और कीटनाशक छिड़काव टालें।",
        })

    # Rule 2: Heatwave / Temperature Advisory
    if max_temp >= 40.0:
        advisories.append({
            "id": "adv-heat-severe",
            "level": "Warning",
            "category": "Irrigation Management",
            "title": "Heat Wave Warning: Irrigate crops during evening hours",
            "title_hi": "तीव्र लू (हीटवेव) चेतावनी: शाम या सुबह में ही हल्की सिंचाई करें",
            "description": f"Maximum temperature will hit {max_temp:.1f}°C. Daytime watering causes root scald and high evaporation loss.",
            "description_hi": f"अधिकतम तापमान {max_temp:.1f}°C तक पहुंचने की आशंका है। दोपहर में सिंचाई से जड़ों को नुकसान हो सकता है।",
            "action": "Schedule light, frequent irrigation between 5 PM and 8 AM. Apply straw or dry grass mulching to retain soil moisture.",
            "action_hi": "शाम 5 बजे से सुबह 8 बजे के बीच हल्की सिंचाई करें। नमी रोकने के लिए पुआल की मल्चिंग करें।",
        })
    elif max_temp >= 36.5:
        advisories.append({
            "id": "adv-heat-moderate",
            "level": "Watch",
            "category": "Moisture Management",
            "title": "High Temperature Watch: Monitor soil moisture",
            "title_hi": "उच्च तापमान सलाह: मिट्टी की नमी की निगरानी रखें",
            "description": f"Day temperature hovering around {max_temp:.1f}°C increases transpiration rate in standing crops.",
            "description_hi": f"दिन का तापमान {max_temp:.1f}°C रहने से खड़ी फसलों में वाष्पीकरण बढ़ जाता है।",
            "action": "Ensure standing crops do not experience moisture stress; irrigate before visual wilting occurs.",
            "action_hi": "फसलों को जल तनाव से बचाएं, आवश्यकतानुसार समय पर सिंचाई करें।",
        })

    # Rule 3: High Wind Alert
    if max_wind >= 30.0:
        advisories.append({
            "id": "adv-wind-strong",
            "level": "Warning",
            "category": "Crop Protection",
            "title": "Strong Wind Alert: Support tall crops and secure nursery sheds",
            "title_hi": "तेज हवा चेतावनी: लंबी फसलों को सहारा दें और नर्सरी शेड सुरक्षित करें",
            "description": f"Wind gusts up to {max_wind:.1f} km/h expected. High risk of lodging in mature crops and damage to polyhouses.",
            "description_hi": f"{max_wind:.1f} किमी/घंटा की गति से तेज हवाएं चलने का अनुमान है। फसलों के गिरने का खतरा है।",
            "action": "Provide bamboo staking to banana, papaya, and tall vegetable trellises. Secure greenhouse plastic films.",
            "action_hi": "केले, पपीते और सब्जियों की लताओं को डंडों से सहारा दें। ग्रीनहाउस की पॉलीथिन सुरक्षित करें।",
        })

    # Rule 4: Frost Risk (Winter)
    if min_temp <= 5.0:
        advisories.append({
            "id": "adv-frost",
            "level": "Warning",
            "category": "Cold / Frost",
            "title": "Frost Risk Alert: Irrigate lightly in evening to raise microclimate temperature",
            "title_hi": "पाला (शीत लहर) चेतावनी: शाम को हल्की सिंचाई करें",
            "description": f"Night temperatures dipping to {min_temp:.1f}°C can cause cellular freezing in tender vegetables and mustard.",
            "description_hi": f"रात का तापमान {min_temp:.1f}°C तक गिरने से सब्जियों और सरसों में पाला लगने का जोखिम है।",
            "action": "Light evening irrigation and smoke generation on field boundaries protects flowers and pods.",
            "action_hi": "खेत के किनारों पर धुआं करें और शाम को हल्की सिंचाई करें।",
        })

    # Fallback Rule: Favorable Weather
    if not advisories:
        advisories.append({
            "id": "adv-favorable",
            "level": "Info",
            "category": "General Farming",
            "title": "Favorable Weather: Ideal conditions for agricultural operations",
            "title_hi": "अनुकूल मौसम: कृषि कार्यों और निराई-गुड़ाई के लिए सर्वोत्तम समय",
            "description": f"Moderate temperature ({current_temp:.1f}°C) and mild wind ({max_wind:.1f} km/h) are conducive for crop health.",
            "description_hi": f"अनुकूल तापमान ({current_temp:.1f}°C) और सामान्य हवा फसलों के समुचित विकास के लिए उपयुक्त है।",
            "action": "Proceed with intercultural operations, weeding, and normal fertilizer dosage as planned.",
            "action_hi": "योजनानुसार निराई, गुड़ाई और उर्वरक प्रयोग सामान्य रूप से जारी रखें।",
        })

    return advisories

def get_seeded_weather_fallback(lat: float, lon: float, district: str, state: str) -> Dict[str, Any]:
    """Generates realistic 7-day weather forecast for Chhattisgarh with agro-advisories."""
    current_temp = 32.5
    humidity = 62
    wind_speed = 14.5
    weather_code = 2  # partly cloudy

    # 7-day forecast
    days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today_ts = time.time()
    forecast = []

    for i in range(7):
        day_ts = today_ts + (i * 86400)
        day_name = time.strftime("%a", time.localtime(day_ts))
        date_str = time.strftime("%d %b", time.localtime(day_ts))
        
        # day 2 and 3 have moderate rain forecast to demonstrate active advisories
        if i in [1, 2]:
            rain_prob = 65
            precip = 18.0
            t_max = 30.0
            t_min = 23.0
            w_code = 63
        elif i == 5:
            rain_prob = 10
            precip = 0.0
            t_max = 38.0
            t_min = 25.0
            w_code = 0
        else:
            rain_prob = 20
            precip = 1.0
            t_max = 33.0 + i
            t_min = 24.0
            w_code = 2

        cond = interpret_wmo_code(w_code)
        forecast.append({
            "date": date_str,
            "day": day_name,
            "temp_max": t_max,
            "temp_min": t_min,
            "rain_prob": rain_prob,
            "precipitation_mm": precip,
            "weather_code": w_code,
            "condition": cond["condition_en"],
            "condition_hi": cond["condition_hi"],
        })

    advisories = generate_agricultural_advisories(
        current_temp=current_temp,
        max_temp=38.0,
        min_temp=23.0,
        precipitation_sum=18.0,
        max_rain_prob=65,
        max_wind=wind_speed,
        humidity=humidity,
    )

    cond_current = interpret_wmo_code(weather_code)

    return {
        "status": "success",
        "location": {
            "district": district,
            "state": state,
            "latitude": lat,
            "longitude": lon,
        },
        "current": {
            "temperature": current_temp,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "weather_code": weather_code,
            "condition": cond_current["condition_en"],
            "condition_hi": cond_current["condition_hi"],
            "rain_prob": 20,
        },
        "forecast": forecast,
        "advisories": advisories,
        "has_severe_warning": any(a["level"] == "Warning" for a in advisories),
        "is_demo_data": True,
        "source": "Open-Meteo & IMD Agromet Advisory Benchmark",
        "official_imd_url": "https://mausam.imd.gov.in",
        "last_updated": time.strftime("%d %b %Y, %I:%M %p"),
        "disclaimer": "KisanVerify agricultural advisories are deterministic decision-support suggestions for farmers. Always verify with India Meteorological Department (mausam.imd.gov.in) for statutory disaster alerts.",
    }

@router.get("")
@router.get("/")
def get_weather(
    lat: float = Query(DEFAULT_LAT, description="Latitude"),
    lon: float = Query(DEFAULT_LON, description="Longitude"),
    district: str = Query("Durg", description="District name"),
    state: str = Query("Chhattisgarh", description="State name"),
):
    """
    Returns live Open-Meteo forecast or cached seed fallback, coupled with deterministic agricultural advisories.
    """
    cache_key = f"{round(lat, 2)}_{round(lon, 2)}"
    now = time.time()

    if cache_key in _weather_cache and (now - _weather_cache[cache_key]["timestamp"] < CACHE_TTL):
        return _weather_cache[cache_key]["data"]

    # Try live Open-Meteo API (free, no API key required)
    open_meteo_url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",
        "timezone": "auto",
        "forecast_days": 7,
    }

    try:
        with httpx.Client(timeout=3.5) as client:
            res = client.get(open_meteo_url, params=params)
            if res.status_code == 200:
                data = res.json()
                current_data = data.get("current", {})
                daily_data = data.get("daily", {})

                cur_temp = current_data.get("temperature_2m", 32.0)
                cur_humidity = current_data.get("relative_humidity_2m", 60)
                cur_wind = current_data.get("wind_speed_10m", 12.0)
                cur_code = current_data.get("weather_code", 1)

                forecast = []
                dates = daily_data.get("time", [])
                max_temps = daily_data.get("temperature_2m_max", [])
                min_temps = daily_data.get("temperature_2m_min", [])
                precips = daily_data.get("precipitation_sum", [])
                probs = daily_data.get("precipitation_probability_max", [])
                codes = daily_data.get("weather_code", [])
                winds = daily_data.get("wind_speed_10m_max", [])

                for i in range(len(dates)):
                    d_str = dates[i]
                    w_code = codes[i] if i < len(codes) else 1
                    cond = interpret_wmo_code(w_code)
                    forecast.append({
                        "date": d_str,
                        "day": time.strftime("%a", time.strptime(d_str, "%Y-%m-%d")),
                        "temp_max": max_temps[i] if i < len(max_temps) else 34.0,
                        "temp_min": min_temps[i] if i < len(min_temps) else 24.0,
                        "rain_prob": probs[i] if i < len(probs) else 10,
                        "precipitation_mm": precips[i] if i < len(precips) else 0.0,
                        "weather_code": w_code,
                        "condition": cond["condition_en"],
                        "condition_hi": cond["condition_hi"],
                    })

                max_t = max(max_temps) if max_temps else 34.0
                min_t = min(min_temps) if min_temps else 24.0
                precip_sum = sum(precips) if precips else 0.0
                max_prob = max(probs) if probs else 10
                max_w = max(winds) if winds else cur_wind

                advisories = generate_agricultural_advisories(
                    current_temp=cur_temp,
                    max_temp=max_t,
                    min_temp=min_t,
                    precipitation_sum=precip_sum,
                    max_rain_prob=max_prob,
                    max_wind=max_w,
                    humidity=cur_humidity,
                )

                cond_cur = interpret_wmo_code(cur_code)
                result = {
                    "status": "success",
                    "location": {
                        "district": district,
                        "state": state,
                        "latitude": lat,
                        "longitude": lon,
                    },
                    "current": {
                        "temperature": cur_temp,
                        "humidity": cur_humidity,
                        "wind_speed": cur_wind,
                        "weather_code": cur_code,
                        "condition": cond_cur["condition_en"],
                        "condition_hi": cond_cur["condition_hi"],
                        "rain_prob": probs[0] if probs else 10,
                    },
                    "forecast": forecast,
                    "advisories": advisories,
                    "has_severe_warning": any(a["level"] == "Warning" for a in advisories),
                    "is_demo_data": False,
                    "source": "Open-Meteo Live API",
                    "official_imd_url": "https://mausam.imd.gov.in",
                    "last_updated": time.strftime("%d %b %Y, %I:%M %p"),
                    "disclaimer": "KisanVerify agricultural advisories are deterministic decision-support suggestions for farmers. Always verify with India Meteorological Department (mausam.imd.gov.in) for statutory disaster alerts.",
                }

                _weather_cache[cache_key] = {"data": result, "timestamp": now}
                return result
    except Exception as e:
        print(f"Open-Meteo live API notice: {e}, using seeded agro-advisory fallback")

    fallback_data = get_seeded_weather_fallback(lat, lon, district, state)
    _weather_cache[cache_key] = {"data": fallback_data, "timestamp": now}
    return fallback_data
