"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function usePendingState(delay = 2000) {
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef(null);

  const startPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsPending(true);

    timeoutRef.current = setTimeout(() => {
      setIsPending(false);
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isPending, startPending };
}
