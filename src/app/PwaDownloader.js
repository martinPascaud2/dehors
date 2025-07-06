"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import ShareIcon from "./ShareIcon.png";
import Plus from "./Plus.png";
import Triangle from "./components/Triangle";

const isBrowser = () => typeof window !== "undefined";

export default function PwaDownloader() {
  const [deferredPrompt, setDeferredPrompt] = useState();
  const [showInstallMessage, setShowInstallMessage] = useState(false);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isBrowser()) {
      window.addEventListener("beforeinstallprompt", (e) => {
        setDeferredPrompt(e);
      });
    }

    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    const isInStandaloneMode = () =>
      "standalone" in window.navigator && window.navigator.standalone;
    if (isIos() && !isInStandaloneMode()) {
      setShowInstallMessage(true);
    }
  }, []);

  if (showInstallMessage)
    return (
      <div className="absolute bottom-20 flex flex-col items-center">
        <div className="w-screen border border-blue-300 bg-blue-100 pt-2 flex flex-col items-center">
          <div>Installe Social Games sur ton iPhone !</div>
          <div>
            Clique sur
            <span className="inline-flex align-middle mb-2">
              <Image src={ShareIcon} alt="share-icon" className="h-7 w-8" />
            </span>
            puis sur{" "}
            <span className="inline-flex align-middle mb-2">
              <Image src={Plus} alt="add-icon" className="h-6 w-6" />
            </span>
          </div>
        </div>
        <Triangle w={150} h={20} direction="bottom" color="#93c5fd" />
      </div>
    );

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={async () => installApp()}
      className="border border-blue-300 bg-blue-100"
    >
      Télécharge l&apos;application !
    </button>
  );
}
