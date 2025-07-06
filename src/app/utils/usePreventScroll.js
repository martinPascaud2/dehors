"use client";

import { useEffect } from "react";

export default function usePreventScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const preventDefault = (e) => e.preventDefault();

    const stayAtTop = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });
    window.addEventListener("scroll", stayAtTop);

    const disableScrollStyles = () => {
      document.body.style.overflow = "hidden";
      // document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
    };
    disableScrollStyles();

    const resetScrollStyles = () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };

    return () => {
      resetScrollStyles();
      window.removeEventListener("wheel", preventDefault);
      window.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("scroll", stayAtTop);
    };
  }, []);
}
