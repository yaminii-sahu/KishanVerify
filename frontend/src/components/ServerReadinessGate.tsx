import React, { useState, useEffect } from 'react';

interface ServerReadinessGateProps {
  children: React.ReactNode;
}

/**
 * ServerReadinessGate:
 * Ensures the application is accessible immediately.
 * In production or hosted environments (e.g. Vercel), it bypasses immediately so
 * farmers and reviewers are never blocked by backend readiness gates.
 * In local development, it probes /health with a fast timeout (2s) and smoothly
 * falls back to full client demo mode if the backend is not running.
 */
export const ServerReadinessGate: React.FC<ServerReadinessGateProps> = ({ children }) => {
  const [bypassOffline, setBypassOffline] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        // Always bypass on deployed domains (Vercel, Cloud Run, custom domain, etc.)
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocalhost || import.meta.env.PROD) {
          return true;
        }
        return localStorage.getItem('kisanverify_bypass_offline') === 'true';
      }
    } catch {
      return true;
    }
    return true;
  });

  useEffect(() => {
    // If already bypassed (production / remembered choice), do nothing
    if (bypassOffline) return;

    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    fetch('/health', { signal: controller.signal, cache: 'no-store' })
      .then((res) => {
        if (res.ok) {
          return res.json().catch(() => null);
        }
        return null;
      })
      .then(() => {
        if (isMounted) setBypassOffline(true);
      })
      .catch(() => {
        // If offline or timed out, auto-continue in client demo mode
        if (isMounted) setBypassOffline(true);
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [bypassOffline]);

  // Always render children smoothly
  return <>{children}</>;
};
