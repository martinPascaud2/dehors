"use client";
import { useEffect, useState } from "react";
import { Html5QrcodeScanType, Html5Qrcode } from "html5-qrcode";

import "./Html5QrcodePlugin.css";

import Spinner from "./spinners/Spinner";

const createConfig = (props) => {
  let config = {};

  if (props.fps) {
    config.fps = props.fps;
  }
  // if (props.qrbox) {
  //   config.qrbox = props.qrbox;
  // }
  config.qrbox = { width: 1000, height: 1000 };
  if (props.aspectRatio) {
    config.aspectRatio = props.aspectRatio;
  }
  if (props.disableFlip !== undefined) {
    config.disableFlip = props.disableFlip;
  }
  config.supportedScanTypes = [Html5QrcodeScanType.SCAN_TYPE_CAMERA];
  config.rememberLastUsedCamera = true;
  config.videoConstraints = {
    facingMode: "environment",
    advanced: [{ zoom: 3.0 }],
  };

  return config;
};

export default function Html5QrcodePlugin(props) {
  const [reader, setReader] = useState();
  const [scan, setScan] = useState();

  useEffect(() => {
    if (!props.scanning) return;
    const rea = document.getElementById("reader");
    rea && setReader(rea);
  }, [props]);

  useEffect(() => {
    if (!props.scanning) return;
    if (reader) {
      const html5QrCode = new Html5Qrcode("reader");
      const config = createConfig(props);

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          props.qrCodeSuccessCallback(decodedText);
          html5QrCode.stop();
        }
      );

      setScan(html5QrCode);
    }
  }, [props, reader]);

  useEffect(() => {
    const stop = () => scan?.stop();
    stop && props.setStopScan && props.setStopScan(() => stop);
  }, [scan, props]);

  return (
    <div
      id="reader"
      className="border border-black aspect-square absolute left-1/2 translate-x-[-50%] top-1/2 translate-y-[-50%]"
    />
  );
}
