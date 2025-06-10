"use client";

import { useState, useEffect } from "react";
import { useWakeLock } from "react-screen-wake-lock";

export default function useWake() {
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { isSupported, released, request, release } = useWakeLock({
    onRequest: () => {},
    // onError: () => alert("WakeLock: error"), //check
    onRelease: () => {},
  });

  useEffect(() => {
    setIsClient(true);

    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("click", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (request && (released === undefined || released === true) && isVisible) {
      request();
    }
    // request && request();
    // return () => {
    //   if (release) release();
    // };
    // }, [request, released, isVisible]);
  }, [request, released, isVisible]);

  if (!isClient) {
    return { isSupported: false, isVisible, released, request, release };
  }

  return {
    isSupported,
    isVisible,
    released,
    request,
    release,
  };
}
