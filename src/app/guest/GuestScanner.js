"use client";
import { useEffect } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

const qrcodeRegionId = "html5qr-code-full-region";

const createConfig = (props, isMobile) => {
  let config = {};
  if (props.fps) {
    config.fps = props.fps;
  }
  if (props.qrbox) {
    config.qrbox = props.qrbox;
  }
  if (props.aspectRatio) {
    config.aspectRatio = props.aspectRatio;
  }
  if (props.disableFlip !== undefined) {
    config.disableFlip = props.disableFlip;
  }
  config.supportedScanTypes = [Html5QrcodeScanType.SCAN_TYPE_CAMERA];
  config.videoConstraints = {
    facingMode: { ideal: isMobile ? "environment" : "user" },
  };

  return config;
};

export default function GuestScanner(props) {
  useEffect(() => {
    if (!props.scanning) return;

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    const config = createConfig(props, isMobile);
    const verbose = props.verbose === true;
    if (!props.qrCodeSuccessCallback) {
      throw "qrCodeSuccessCallback is required callback.";
    }

    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      config,
      verbose
    );
    html5QrcodeScanner.render(
      props.qrCodeSuccessCallback,
      props.qrCodeErrorCallback
    );
    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [props]);
  return <div id={qrcodeRegionId} />;
}
