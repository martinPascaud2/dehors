"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { throttle } from "lodash";

import getLocation from "@/utils/getLocation";

import GuestScanner from "./GuestScanner";

export default function GuestConnector({ setCookieToken }) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [qrData, setQrData] = useState("");
  const [toggleInput, setToggleInput] = useState(false);
  const inputRef = useRef();
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    setScanning(true);
  }, []);

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef, toggleInput]);

  // check
  const onNewScanResult = useCallback(
    throttle(async (decodedText) => {
      if (scanLocked) return;
      try {
        setQrData(decodedText);
        setScanLocked(true);
        setToggleInput(true);
      } catch (error) {
        setServerMessage(error.message);
      }
    }, 1000),
    []
  );

  const joinGame = async () => {
    try {
      await getLocation();
      if (guestName.length < 3) {
        setServerMessage("Nom trop court");
      } else {
        await setCookieToken("Guest", "guest");
        const data = qrData.split("?")[1];
        const [categoriePath, gameNamePath, tokenPath] = data.split("&");
        const categorie = categoriePath.split("=")[1];
        const gameName = gameNamePath.split("=")[1];
        const guestUrl = `/categories/${categorie}/${gameName}/?${tokenPath}&guestName=${guestName}`;
        router.push(guestUrl);
      }
    } catch (error) {
      setServerMessage(error.message);
      return;
    }
  };

  return (
    <div>
      {!scanLocked && (
        <>
          <div className="text-center">Scanne le QrCode d&apos;une partie</div>
          <GuestScanner
            scanning={scanning}
            fps={10}
            aspectRatio="1.0"
            qrbox={500}
            qrCodeSuccessCallback={onNewScanResult}
          />
        </>
      )}

      {toggleInput && (
        <form action={joinGame} className="flex flex-col justify-center">
          <label className="text-center">Choisis ton pseudonyme Guest</label>
          <input
            ref={inputRef}
            onChange={(event) => setGuestName(event.currentTarget.value)}
            className="outline m-4"
          />
          <button
            onClick={() => joinGame()}
            className="self-center border border-blue-300 bg-blue-100 w-1/2"
          >
            Rejoindre la partie
          </button>
        </form>
      )}

      <div>{serverMessage}</div>
    </div>
  );
}
