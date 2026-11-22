import React, { useState, useEffect } from 'react';
import { Loader2, Server, AlertTriangle, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';

interface ServerReadinessGateProps {
  children: React.ReactNode;
}

export const ServerReadinessGate: React.FC<ServerReadinessGateProps> = ({ children }) => {
  const [isReady, setIsReady] = useState<boolean | null>(null);
  const [secondsWaiting, setSecondsWaiting] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [bypassOffline, setBypassOffline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    const checkServer = async () => {
      try {
        // Probe /health via relative proxy or direct fallback
        const res = await fetch('/health', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setIsReady(true);
          }
          return true;
        }
      } catch {
        // Not ready yet
      }
      return false;
    };

    // First attempt immediately
    checkServer().then((ready) => {
      if (ready) return;

      if (isMounted) {
        setIsReady(false);
      }

      // Retry every 1000ms
      const interval = setInterval(async () => {
        if (!isMounted) return;
        setSecondsWaiting((prev) => {
          const next = prev + 1;
          if (next >= 30) {
            setTimedOut(true);
          }
          return next;
        });

        const readyNow = await checkServer();
        if (readyNow && isMounted) {
          clearInterval(interval);
        }
      }, 1000);

      timer = interval;
    });

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  // If server is healthy, or user clicked bypass, render the app immediately
  if (isReady === true || bypassOffline) {
    return <>{children}</>;
  }

  // If initial check is still in flight (first few ms), render children or empty to prevent flash
  if (isReady === null) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F4F8F3] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-sage-200 shadow-card space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3">
          <Logo size="lg" showTagline={false} />
          <div>
            <p className="text-xs text-sage-700 font-medium mt-0.5">Every rupee. Every benefit. Verified.</p>
          </div>
        </div>

        {/* Status Display */}
        {!timedOut ? (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-sage-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">Connecting to server...</h2>
              <p className="text-xs text-gray-500 mt-1">
                Checking backend health at <code className="bg-sage-50 text-sage-800 px-1.5 py-0.5 rounded text-[11px]">/health</code>
              </p>
            </div>

            <div className="w-full bg-sage-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-sage-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((secondsWaiting / 30) * 100, 100)}%` }}
              />
            </div>

            <span className="text-[11px] text-gray-400 font-medium">
              Elapsed: {secondsWaiting}s (retrying every second)
            </span>
          </div>
        ) : (
          <div className="space-y-4 py-2 text-left">
            <div className="flex items-center gap-2 text-amber-800 bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs font-medium">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Backend server is taking longer than usual to respond (30s elapsed).</span>
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-2xl text-xs font-mono space-y-2">
              <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                <Terminal className="w-3.5 h-3.5" />
                <span>Fix command (run in terminal):</span>
              </div>
              <div className="text-emerald-400 select-all font-semibold">
                npm start
              </div>
              <div className="text-gray-400 text-[11px] pt-1 border-t border-gray-800">
                Or start backend directly:
                <br />
                <span className="text-amber-300 select-all">python -m uvicorn app.main:app --port 8000 --app-dir backend</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => {
                  setTimedOut(false);
                  setSecondsWaiting(0);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-sage-700 hover:bg-sage-800 text-white text-xs font-semibold shadow-soft flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Connection
              </button>

              <button
                onClick={() => setBypassOffline(true)}
                className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors"
              >
                Continue in Demo Mode
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
