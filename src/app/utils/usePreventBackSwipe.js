"use client";

import { useEffect } from "react";

export default function usePreventBackSwipe() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const blockNavigation = () => {
      window.history.pushState(null, "", window.location.href);
    };

    blockNavigation();

    const handlePopState = (event) => {
      blockNavigation();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const preventBackSwipe = (e) => {
      if (e.touches && e.touches.length === 1) {
        const touch = e.touches[0];
        if (touch.clientX < 30) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("touchstart", preventBackSwipe, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchstart", preventBackSwipe);
    };
  }, []);
}
