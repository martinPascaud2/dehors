"use client";

import { UAParser } from "ua-parser-js";
import { useEffect, useState } from "react";

export const useDeviceDetector = () => {
  const [deviceInfo, setDeviceInfo] = useState();

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    setDeviceInfo(result);
  }, []);

  return deviceInfo;
};

export default function useGetBarsSizes() {
  const deviceInfo = useDeviceDetector();
  let topSize = 8;
  let bottomSize = 8;

  if (deviceInfo?.device.model === "iPhone") {
    topSize = 20;
    bottomSize = 20;
  }

  const barsSizes = { ...deviceInfo, top: topSize, bottom: bottomSize };
  if (!deviceInfo) return null;

  return barsSizes;
}
