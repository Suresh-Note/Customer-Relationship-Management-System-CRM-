import { useCallback, useEffect, useRef, useState } from "react";

const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "click"];

/**
 * useIdleTimeout
 *
 * Tracks user inactivity.  After `idleMinutes` of no activity:
 *  1. Calls `onWarn` with the number of seconds until logout (if provided)
 *  2. After a further `warnSeconds` seconds of inactivity, calls `onTimeout`
 *
 * @param {Function} onTimeout  - Called when the session should be terminated
 * @param {number}   idleMinutes  - Minutes of inactivity before warning (default 25)
 * @param {number}   warnSeconds  - Seconds of warning before actual logout (default 60)
 * @param {Function} onWarn       - Optional: called with secondsLeft when warning starts
 */
export function useIdleTimeout({
  onTimeout,
  idleMinutes  = 25,
  warnSeconds  = 60,
  onWarn       = null,
}) {
  const idleTimer   = useRef(null);
  const warnTimer   = useRef(null);
  const [isWarning, setIsWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  const clearAll = useCallback(() => {
    clearTimeout(idleTimer.current);
    clearTimeout(warnTimer.current);
    clearInterval(countdownRef.current);
  }, []);

  const startCountdown = useCallback(() => {
    setIsWarning(true);
    setCountdown(warnSeconds);
    if (onWarn) onWarn(warnSeconds);

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    warnTimer.current = setTimeout(() => {
      setIsWarning(false);
      onTimeout();
    }, warnSeconds * 1000);
  }, [onTimeout, onWarn, warnSeconds]);

  const reset = useCallback(() => {
    clearAll();
    setIsWarning(false);
    setCountdown(0);

    idleTimer.current = setTimeout(startCountdown, idleMinutes * 60 * 1000);
  }, [clearAll, idleMinutes, startCountdown]);

  // Dismiss the warning and reset if user acts during the warning window
  const dismissWarning = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset(); // start the first timer

    return () => {
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, reset));
      clearAll();
    };
  }, [reset, clearAll]);

  return { isWarning, countdown, dismissWarning };
}
