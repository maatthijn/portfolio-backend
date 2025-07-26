import { useEffect } from "react";

export default function useIdleTimer(timeout = 900000, onTimeout = () => {}) {
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log("User is idle");
        onTimeout();
      }, timeout);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    for (const event of events) {
      window.addEventListener(event, resetTimer);
    }

    // ✅ Start the timer initially (simulate first activity)
    resetTimer();

    return () => {
      clearTimeout(timer);
      for (const event of events) {
        window.removeEventListener(event, resetTimer);
      }
    };
  }, [timeout, onTimeout]);
}
