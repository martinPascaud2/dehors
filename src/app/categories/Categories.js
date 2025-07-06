"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { throttle } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";
import Pusher from "pusher-js";

import { CameraIcon } from "@heroicons/react/24/outline";

import Html5QrcodePlugin from "@/components/Html5QrcodePlugin";
import useWake from "@/utils/useWake";
import { useDeviceDetector } from "@/utils/useGetBarsSizes";
import usePreventBackSwipe from "@/utils/usePreventBackSwipe";
import getLocation from "@/utils/getLocation";
import getErrorInformations from "@/utils/getErrorInformations";
import { toolsList, postGamesList } from "@/assets/globals";

var pusher = new Pusher("61853af9f30abf9d5b3d", {
  cluster: "eu",
});

import "./test.css";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { ImExit } from "react-icons/im";
import { FaUserFriends, FaPlay } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { LiaQrcodeSolid } from "react-icons/lia";
import { MdOutlineVideogameAsset } from "react-icons/md";
import { IoIosRefresh } from "react-icons/io";
import FriendsSettingsIcon from "./FriendsSettingsIcon";
import { MdOutlineAccountTree } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import { FaKeyboard } from "react-icons/fa6";

import ReactDOM from "react-dom";

const OnlyShadows = () => {
  return (
    <>
      <div className="absolute z-30 w-full h-full">
        <div className="relative w-full h-full">
          {/* left top */}
          <div // square
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] left-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: "1vw 1vw 2vw -1vw #7e22ce, 2vw 2vw 2vw -1vw #7e22ce",
              backgroundColor: "transparent",
            }}
          />
          <div // border filler
            className="absolute h-[5vw] w-[24vw] top-[15.55vw] left-[7vw] z-30"
            style={{
              boxShadow: "0vw 2vw 2vw -1vw #7e22ce",
              backgroundColor: "transparent",
            }}
          />

          {/* left middle */}
          <div // skew top
            className="absolute h-[10vw] w-[5.7vw] top-[23.9vw] -skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
            }}
          />
          <div // middle top
            className="absolute h-[28.4vw] w-[14.8vw] top-[54.7%] translate-y-[-100%] left-[5.7vw] z-40"
            style={{
              backgroundColor: "transparent",
              boxShadow: "3.1vw -2vw 1vw -2vw #7e22ce",
            }}
          />
          <div // middle bottom
            className="absolute h-[28.4vw] w-[14.8vw] bottom-[54.7%] translate-y-[100%] left-[5.7vw] z-40"
            style={{
              backgroundColor: "transparent",
              boxShadow: "3.1vw 2vw 1vw -2vw #7e22ce",
            }}
          />
          <div // skew bottom
            className="absolute h-[10vw] w-[5.7vw] bottom-[23.9vw] skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
            }}
          />

          {/* left bottom */}
          <div // square
            className="absolute h-[20.2vw] w-[17vw] bottom-[0.4vw] left-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: "1vw -1vw 2vw -1vw #7e22ce, 2vw -2vw 2vw -1vw #7e22ce",
              backgroundColor: "transparent",
            }}
          />
          <div // border filler
            className="absolute h-[5vw] w-[24vw] bottom-[15.55vw] left-[7vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: "0vw -2vw 2vw -1vw #7e22ce",
            }}
          />

          {/* right top */}
          <div // square
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] right-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: "-1vw 1vw 2vw -1vw #7e22ce, -2vw 2vw 2vw -1vw #7e22ce",
            }}
          />
          <div // border filler
            className="absolute h-[5vw] w-[24vw] top-[15.55vw] right-[7vw] z-30"
            style={{
              boxShadow: "0vw 2vw 2vw -1vw #7e22ce",
              backgroundColor: "transparent",
            }}
          />

          {/* right middle */}
          <div // skew top
            className="absolute h-[10vw] w-[5.7vw] top-[23.9vw] skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
            }}
          />
          <div // middle top
            className="absolute h-[28.4vw] w-[14.8vw] top-[54.7%] translate-y-[-100%] right-[5.7vw] z-40"
            style={{
              backgroundColor: "transparent",
              boxShadow: "-3.1vw -2vw 1vw -2vw #7e22ce",
            }}
          />
          <div // middle bottom
            className="absolute h-[28.4vw] w-[14.8vw] bottom-[54.7%] translate-y-[100%] right-[5.7vw] z-40"
            style={{
              backgroundColor: "transparent",
              boxShadow: "-3.1vw 2vw 1vw -2vw #7e22ce",
            }}
          />
          <div // skew bottom
            className="absolute h-[10vw] w-[5.7vw] bottom-[23.9vw] -skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
            }}
          />

          {/* right bottom */}
          <div // square
            className="absolute h-[20.2vw] w-[17vw] bottom-[0.4vw] right-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow:
                "-1vw -1vw 2vw -1vw #7e22ce, -2vw -2vw 2vw -1vw #7e22ce",
              backgroundColor: "transparent",
            }}
          />
          <div // border filler
            className="absolute h-[5vw] w-[24vw] bottom-[15.55vw] right-[7vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: "0vw -2vw 2vw -1vw #7e22ce",
            }}
          />
        </div>
      </div>
    </>
  );
};

const SettingsButtons = ({
  setSetting,
  setLocation,
  updateLastCP,
  user,
  tmpToken,
  setServerMessage,
  resetPermissions,
  setScanning,
  setting,
  signOut,
}) => {
  const [locked, setLocked] = useState(true);
  const [isAccountPressed, setIsAccountPressed] = useState(false);
  const [isParamsPressed, setIsParamsPressed] = useState(false);
  const [isCameraPressed, setIsCameraPressed] = useState(false);
  const [isDiscoPressed, setIsDiscoPressed] = useState(false);
  const [isFriendsPressed, setIsFriendsPressed] = useState(false);
  const [isQrcodePressed, setIsQrcodePressed] = useState(false);

  const handleAccountPressed = useCallback(
    async (event) => {
      if (typeof window === "undefined") return;

      setIsAccountPressed(false);
      if (locked) return;
      // setSetting("password");
      setServerMessage("");
      // setScanning(false);
      resetPermissions();
      event.stopPropagation();
      updateLastCP({ userId: user.id }); // no await // check

      window.open(
        `${process.env.NEXT_PUBLIC_ACCOUNT_APP_URL}/?i=${user.id}&t=${tmpToken}`,
        "_blank",
        "noopener,noreferrer"
      );
    },
    [
      setIsAccountPressed,
      locked,
      // setSetting,
      setServerMessage,
      resetPermissions,
      updateLastCP,
      user.id,
      tmpToken,
    ]
  );

  const handleParamsPressed = useCallback(
    (event) => {
      setIsParamsPressed(false);
      if (locked || setting === "params") return;
      setSetting("params");
      setServerMessage("");
      // setScanning(false);
      resetPermissions();
      event.stopPropagation();
      updateLastCP({ userId: user.id }); // no await
    },
    [
      setIsParamsPressed,
      locked,
      setSetting,
      setServerMessage,
      resetPermissions,
      updateLastCP,
    ]
  );

  const handleCameraPressed = useCallback(
    (event) => {
      setIsCameraPressed(false);
      if (locked || setting === "camera") return;
      setSetting("camera");
      setServerMessage("");
      setScanning(true);
      // resetPermissions();
      event.stopPropagation();
      updateLastCP({ userId: user.id }); // no await
    },
    [
      setIsCameraPressed,
      locked,
      setSetting,
      setServerMessage,
      setScanning,
      updateLastCP,
    ]
  );

  const handleDiscoPressed = useCallback(
    async (event) => {
      if (typeof window === "undefined") return;

      setIsDiscoPressed(false);
      if (locked) return;
      event.stopPropagation();
      await updateLastCP({ userId: user.id, out: true });
      await signOut();
      window.location.reload();
    },
    [setIsDiscoPressed, locked, updateLastCP, signOut]
  );

  const handleFriendsPressed = useCallback(
    (event) => {
      setIsFriendsPressed(false);
      if (locked || setting === "friends") return;
      setSetting("friends");
      setServerMessage("");
      // setScanning(false);
      resetPermissions();
      event.stopPropagation();
      updateLastCP({ userId: user.id }); // no await
    },
    [
      setIsFriendsPressed,
      locked,
      setSetting,
      setServerMessage,
      resetPermissions,
      updateLastCP,
    ]
  );

  const handleQrcodePressed = useCallback(
    async (event) => {
      if (typeof window === "undefined") return;

      setIsQrcodePressed(false);
      if (locked || setting === "qrCode") return;
      setSetting("qrCode");
      // setScanning(false);
      resetPermissions();
      event.stopPropagation();
      updateLastCP({ userId: user.id }); // no await

      try {
        // setLocation(await getLocation());
        setLocation({ latitude: "", longitude: "" });
        setServerMessage("");
      } catch (error) {
        console.error(error.message);
        const errorInformations = getErrorInformations({
          window,
          fail: "location_permission",
        }).map((info, i) => (
          <div key={i} className={`${i === 0 && "font-bold"}`}>
            {i !== 0 && "=>"}
            {info}
          </div>
        ));
        setServerMessage(errorInformations);
        setLocation();
      }
    },
    [
      setIsQrcodePressed,
      locked,
      setSetting,
      resetPermissions,
      updateLastCP,
      setLocation,
      setServerMessage,
      getErrorInformations,
    ]
  );

  useEffect(() => {
    setLocked(false);
  }, []);

  if (setting !== "") {
    if (setting === "camera" || setting === "qrCode") return <OnlyShadows />;
    if (setting !== "params" && setting !== "friends") return null;
  }

  return (
    <>
      <div className="absolute z-30 w-full h-full">
        <div className="relative w-full h-full">
          {/* left top */}
          <div // square
            onTouchStart={() => setIsAccountPressed(true)}
            onTouchEnd={handleAccountPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] left-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: !isAccountPressed
                ? "1vw 1vw 2vw -1vw #7e22ce, 2vw 2vw 2vw -1vw #7e22ce"
                : "inset 0px 9px 5px -6px #581c87",
              borderBottom: isAccountPressed ? "1px solid #6b21a8" : "",
              borderRight: isAccountPressed ? "1px solid #6b21a8" : "",
              backgroundColor: isAccountPressed ? "#7e22ce" : "transparent",
            }}
          >
            <MdOutlineAccountTree
              className={`mr-2 w-10 h-10 ${
                setting !== "" && !isAccountPressed && "opacity-75"
              } text-purple-${!isAccountPressed ? "800" : "900"}`}
            />
          </div>
          <div // skew
            onTouchStart={() => setIsAccountPressed(true)}
            onTouchEnd={handleAccountPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] -skew-x-[45deg] bg-transparent left-[16.5vw] z-30"
            style={{
              backgroundColor: isAccountPressed ? "#7e22ce" : "transparent",
              boxShadow: !isAccountPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsAccountPressed(true)}
            onTouchEnd={handleAccountPressed}
            className="absolute h-[5vw] w-[24vw] top-[15.55vw] left-[7vw] z-30"
            style={{
              boxShadow: !isAccountPressed ? "0vw 2vw 2vw -1vw #7e22ce" : "",
              borderBottom: isAccountPressed ? "1px solid #6b21a8" : "",
            }}
          />
          <div // small BF
            onTouchStart={() => setIsAccountPressed(true)}
            onTouchEnd={handleAccountPressed}
            className="absolute h-[5vw] w-[17vw] top-[15.5vw] left-[16.5vw] z-30"
            style={{
              backgroundColor: isAccountPressed ? "#7e22ce" : "transparent",
              borderBottom: isAccountPressed ? "1px solid #6b21a8" : "",
            }}
          />

          {/* left middle */}
          <div // skew top
            onTouchStart={() => setIsParamsPressed(true)}
            onTouchEnd={handleParamsPressed}
            className="absolute h-[10vw] w-[5.7vw] top-[23.9vw] -skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor:
                isParamsPressed || setting === "params"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isParamsPressed && setting !== "params"
                  ? ""
                  : "inset 9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // middle right
            onTouchStart={() => setIsParamsPressed(true)}
            onTouchEnd={handleParamsPressed}
            className="absolute h-[37vw] w-[20.5vw] top-[50%] translate-y-[-50%] left-[0vw] z-50 bg-transparent flex justify-center items-center"
            style={{
              backgroundColor:
                isParamsPressed || setting === "params"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isParamsPressed && setting !== "params"
                  ? ""
                  : "inset 9px 0px 5px -6px #581c87",
              borderRight:
                isParamsPressed || setting === "params"
                  ? "1px solid #6b21a8"
                  : "",
            }}
          >
            <IoIosSettings
              className={`w-11 h-11 ${
                setting !== "" &&
                setting !== "params" &&
                !isParamsPressed &&
                "opacity-75"
              } text-purple-${
                setting !== "params" && !isParamsPressed ? "800" : "900"
              }`}
            />
          </div>
          <div // middle
            onTouchStart={() => setIsParamsPressed(true)}
            onTouchEnd={handleParamsPressed}
            className="absolute h-[47.6vw] w-[14.8vw] top-[50%] translate-y-[-50%] left-[5.7vw] z-40"
            style={{
              backgroundColor:
                isParamsPressed || setting === "params"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isParamsPressed &&
                setting !== "params" &&
                setting !== "friends"
                  ? "3vw -2vw 1vw -2vw #7e22ce, 3vw 2vw 1vw -2vw #7e22ce"
                  : "",
              borderTop:
                isParamsPressed || setting === "params"
                  ? "1px solid #6b21a8"
                  : "",
              borderRight:
                isParamsPressed || setting === "params"
                  ? "1px solid #6b21a8"
                  : setting === "friends"
                  ? "1px solid #7e22ce"
                  : "",
              borderBottom:
                isParamsPressed || setting === "params"
                  ? "1px solid #6b21a8"
                  : "",
            }}
          />
          <div // skew bottom
            onTouchStart={() => setIsParamsPressed(true)}
            onTouchEnd={handleParamsPressed}
            className="absolute h-[10vw] w-[5.7vw] bottom-[23.9vw] skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor:
                isParamsPressed || setting === "params"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isParamsPressed && setting !== "params"
                  ? ""
                  : "inset 9px 0px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
            }}
          />

          {/* left bottom */}
          <div // square
            onTouchStart={() => setIsCameraPressed(true)}
            onTouchEnd={handleCameraPressed}
            className="absolute h-[20.2vw] w-[17vw] bottom-[0.4vw] left-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: !isCameraPressed
                ? "1vw -1vw 2vw -1vw #7e22ce, 2vw -2vw 2vw -1vw #7e22ce"
                : "inset 0px -9px 5px -6px #581c87",
              borderTop: isCameraPressed ? "1px solid #6b21a8" : "",
              borderRight: isCameraPressed ? "1px solid #6b21a8" : "",
              backgroundColor: isCameraPressed ? "#7e22ce" : "transparent",
            }}
          >
            <CameraIcon
              className={`w-10 h-10 mb-1 mr-1.5 ${
                setting !== "" && !isCameraPressed && "opacity-75"
              } text-purple-${
                setting !== "camera" && !isCameraPressed ? "800" : "900"
              }`}
            />
          </div>
          <div // skew
            onTouchStart={() => setIsCameraPressed(true)}
            onTouchEnd={handleCameraPressed}
            className="absolute h-[20.2vw] w-[17vw] bottom-[0.4vw] skew-x-[45deg] bg-transparent left-[16.5vw] z-30"
            style={{
              backgroundColor: isCameraPressed ? "#7e22ce" : "transparent",
              boxShadow: !isCameraPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsCameraPressed(true)}
            onTouchEnd={handleCameraPressed}
            className="absolute h-[5vw] w-[24vw] bottom-[15.55vw] left-[7vw] z-30"
            style={{
              boxShadow: !isCameraPressed ? "0vw -2vw 2vw -1vw #7e22ce" : "",
              borderTop: isCameraPressed ? "1px solid #6b21a8" : "",
            }}
          />
          <div // small BF
            onTouchStart={() => setIsCameraPressed(true)}
            onTouchEnd={handleCameraPressed}
            className="absolute h-[5vw] w-[17vw] bottom-[15.6vw] left-[16.5vw] z-30"
            style={{
              backgroundColor: isCameraPressed ? "#7e22ce" : "transparent",
              borderTop: isCameraPressed ? "1px solid #6b21a8" : "",
            }}
          />

          {/* right top */}
          <div // square
            onTouchStart={() => setIsDiscoPressed(true)}
            onTouchEnd={handleDiscoPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] right-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: !isDiscoPressed
                ? "-1vw 1vw 2vw -1vw #7e22ce, -2vw 2vw 2vw -1vw #7e22ce"
                : "inset 0px 9px 5px -6px #581c87",
              borderBottom: isDiscoPressed ? "1px solid #6b21a8" : "",
              borderLeft: isDiscoPressed ? "1px solid #6b21a8" : "",
              backgroundColor: isDiscoPressed ? "#7e22ce" : "transparent",
            }}
          >
            <ImExit
              className={`ml-2 w-8 h-8 ${
                setting !== "" && !isDiscoPressed && "opacity-75"
              } text-purple-${!isDiscoPressed ? "800" : "900"}`}
            />
          </div>
          <div // skew
            onTouchStart={() => setIsDiscoPressed(true)}
            onTouchEnd={handleDiscoPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] skew-x-[45deg] bg-transparent right-[16.5vw] z-30"
            style={{
              backgroundColor: isDiscoPressed ? "#7e22ce" : "transparent",
              boxShadow: !isDiscoPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsDiscoPressed(true)}
            onTouchEnd={handleDiscoPressed}
            className="absolute h-[5vw] w-[24vw] top-[15.55vw] right-[7vw] z-30"
            style={{
              boxShadow: !isDiscoPressed ? "0vw 2vw 2vw -1vw #7e22ce" : "",
              borderBottom: isDiscoPressed ? "1px solid #6b21a8" : "",
            }}
          />
          <div // small BF
            onTouchStart={() => setIsDiscoPressed(true)}
            onTouchEnd={handleDiscoPressed}
            className="absolute h-[5vw] w-[17vw] top-[15.5vw] right-[16.5vw] z-30"
            style={{
              backgroundColor: isDiscoPressed ? "#7e22ce" : "transparent",
              borderBottom: isDiscoPressed ? "1px solid #6b21a8" : "",
            }}
          />

          {/* right middle */}
          <div // skew top
            onTouchStart={() => setIsFriendsPressed(true)}
            onTouchEnd={handleFriendsPressed}
            className="absolute h-[10vw] w-[5.7vw] top-[23.9vw] skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor:
                isFriendsPressed || setting === "friends"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isFriendsPressed && setting !== "friends"
                  ? ""
                  : "inset -9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // middle left
            onTouchStart={() => setIsFriendsPressed(true)}
            onTouchEnd={handleFriendsPressed}
            className="absolute h-[37vw] w-[20.5vw] top-[50%] translate-y-[-50%] right-[0vw] z-50 bg-transparent flex justify-center items-center"
            style={{
              backgroundColor:
                isFriendsPressed || setting === "friends"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isFriendsPressed && setting !== "friends"
                  ? ""
                  : "inset -9px 0px 5px -6px #581c87",
              borderLeft:
                isFriendsPressed || setting === "friends"
                  ? "1px solid #6b21a8"
                  : "",
            }}
          >
            <FaUserFriends
              className={`w-11 h-11 z-50 ${
                setting !== "" &&
                setting !== "friends" &&
                !isFriendsPressed &&
                "opacity-75"
              } text-purple-${
                setting !== "friends" && !isFriendsPressed ? "800" : "900"
              }`}
            />
          </div>
          <div // middle
            onTouchStart={() => setIsFriendsPressed(true)}
            onTouchEnd={handleFriendsPressed}
            className="absolute h-[47.6vw] w-[14.8vw] top-[50%] translate-y-[-50%] right-[5.7vw] z-40"
            style={{
              backgroundColor:
                isFriendsPressed || setting === "friends"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isFriendsPressed &&
                setting !== "friends" &&
                setting !== "params"
                  ? "-3vw -2vw 1vw -2vw #7e22ce, -3vw 2vw 1vw -2vw #7e22ce"
                  : "",
              borderTop:
                isFriendsPressed || setting === "friends"
                  ? "1px solid #6b21a8"
                  : "",
              borderLeft:
                isFriendsPressed || setting === "friends"
                  ? "1px solid #6b21a8"
                  : setting === "params"
                  ? "1px solid #7e22ce"
                  : "",
              borderBottom:
                isFriendsPressed || setting === "friends"
                  ? "1px solid #6b21a8"
                  : "",
            }}
          />
          <div // skew bottom
            onTouchStart={() => setIsFriendsPressed(true)}
            onTouchEnd={handleFriendsPressed}
            className="absolute h-[10vw] w-[5.7vw] bottom-[23.9vw] -skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor:
                isFriendsPressed || setting === "friends"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isFriendsPressed && setting !== "friends"
                  ? ""
                  : "inset -9px 0px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
            }}
          />

          {/* right bottom */}
          <div // square
            onTouchStart={() => setIsQrcodePressed(true)}
            onTouchEnd={handleQrcodePressed}
            className="absolute h-[20.2vw] w-[17vw] bottom-[0.4vw] right-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: !isQrcodePressed
                ? "-1vw -1vw 2vw -1vw #7e22ce, -2vw -2vw 2vw -1vw #7e22ce"
                : "inset 0px -9px 5px -6px #581c87",
              borderTop: isQrcodePressed ? "1px solid #6b21a8" : "",
              borderLeft: isQrcodePressed ? "1px solid #6b21a8" : "",
              backgroundColor: isQrcodePressed ? "#7e22ce" : "transparent",
            }}
          >
            <LiaQrcodeSolid
              className={`w-11 h-11 ml-2 mb-1 ${
                setting !== "" && !isQrcodePressed && "opacity-75"
              } text-purple-${!isQrcodePressed ? "800" : "900"}`}
            />
          </div>
          <div // skew
            onTouchStart={() => setIsQrcodePressed(true)}
            onTouchEnd={handleQrcodePressed}
            className="absolute h-[20.2vw] w-[17vw] bottom-[0.4vw] -skew-x-[45deg] bg-transparent right-[16.5vw] z-30"
            style={{
              backgroundColor: isQrcodePressed ? "#7e22ce" : "transparent",
              boxShadow: !isQrcodePressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsQrcodePressed(true)}
            onTouchEnd={handleQrcodePressed}
            className="absolute h-[5vw] w-[24vw] bottom-[15.55vw] right-[7vw] z-30"
            style={{
              boxShadow: !isQrcodePressed ? "0vw -2vw 2vw -1vw #7e22ce" : "",
              borderTop: isQrcodePressed ? "1px solid #6b21a8" : "",
            }}
          />
          <div // small BF
            onTouchStart={() => setIsQrcodePressed(true)}
            onTouchEnd={handleQrcodePressed}
            className="absolute h-[5vw] w-[17vw] bottom-[15.5vw] right-[16.5vw] z-30"
            style={{
              backgroundColor: isQrcodePressed ? "#7e22ce" : "transparent",
              borderTop: isQrcodePressed ? "1px solid #6b21a8" : "",
            }}
          />
        </div>
      </div>
    </>
  );
};

const MainButtons = ({ setToggledSettings, setToggledPrelobby }) => {
  const [isSettingsPressed, setIsSettingsPressed] = useState(false);
  const [isPrelobbyPressed, setIsPrelobbyPressed] = useState(false);

  const handleSettingsPressed = useCallback(() => {
    setIsSettingsPressed(false);
    setToggledSettings(true);
  }, [setIsSettingsPressed, setToggledSettings]);

  const handlePrelobbyPressed = useCallback(() => {
    setIsPrelobbyPressed(false);
    setToggledPrelobby(true);
  }, [setIsPrelobbyPressed, setToggledPrelobby]);

  return (
    <>
      <div className="absolute z-30 w-full h-full">
        <div className="relative w-full h-full">
          {/* left */}
          <div // square
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] left-[26.5vw] z-30"
            style={{
              boxShadow: !isSettingsPressed
                ? "1vw 1vw 2vw -1vw #7e22ce, 2vw 2vw 2vw -1vw #7e22ce"
                : "",
              borderBottom: isSettingsPressed ? "1px solid #7e22ce" : "",
              borderRight: isSettingsPressed ? "1px solid #7e22ce" : "",
              backgroundColor: "transparent",
            }}
          />
          <div // skew
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[20vw] w-[17vw] top-[0.1vw] -skew-x-[45deg] bg-transparent left-[16.5vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isSettingsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[5vw] w-[12.7vw] top-[15.5vw] left-[18.7vw] z-30"
            style={{
              boxShadow: !isSettingsPressed ? "0vw 3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[5vw] w-[16.5vw] top-[15.5vw] left-[20.2vw] z-30"
            style={{
              backgroundColor: "transparent",
              borderBottom: isSettingsPressed ? "1px solid #7e22ce" : "",
            }}
          />

          <div // skew top
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[30vw] w-[20.5vw] top-[16.1vw] -skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isSettingsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // border filler + icon
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[49.2vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent left-[0.1vw] z-40 flex justify-center items-center"
            style={{
              borderRight: isSettingsPressed ? "1px solid #7e22ce" : "",
            }}
          >
            <div className="ml-2 mb-3">
              <FriendsSettingsIcon color="#6b21a8" />
            </div>
          </div>
          <div // background filler
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[20vw] w-[20.5vw] top-1/2 translate-y-[-50%] left-[0.1vw] z-30 flex justify-center items-center"
            style={{
              backgroundColor: "transparent",
            }}
          />
          <div // middle shadow
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[52vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent left-[0.1vw] z-30"
            style={{
              boxShadow: !isSettingsPressed ? "3vw 0vw 2vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew bottom
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[30vw] w-[20.5vw] bottom-[16.1vw] skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isSettingsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
            }}
          />

          <div // border filler
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[5vw] w-[16.5vw] bottom-[15.5vw] left-[20.2vw] z-30"
            style={{
              backgroundColor: "transparent",
              borderTop: isSettingsPressed ? "1px solid #7e22ce" : "",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[5vw] w-[12.7vw] bottom-[15.5vw] left-[18.7vw] z-30"
            style={{
              boxShadow: !isSettingsPressed ? "0vw -3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[20vw] w-[17vw] bottom-[0.2vw] skew-x-[45deg] left-[16.2vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isSettingsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div // square
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[20.2vw] w-[17vw] bg-transparent bottom-[0.3vw] left-[26.5vw] z-30"
            style={{
              boxShadow: !isSettingsPressed
                ? "1vw -1vw 2vw -1vw #7e22ce, 2vw -2vw 2vw -1vw #7e22ce"
                : "inset 0px -9px 5px -6px #581c87",
              borderTop: isSettingsPressed ? "1px solid #7e22ce" : "",
              borderRight: isSettingsPressed ? "1px solid #7e22ce" : "",
              backgroundColor: "transparent",
            }}
          />

          {/* right */}
          <div // square
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] right-[26.5vw] z-30"
            style={{
              boxShadow: !isPrelobbyPressed
                ? "-1vw 1vw 2vw -1vw #7e22ce, -2vw 2vw 2vw -1vw #7e22ce"
                : "",
              borderBottom: isPrelobbyPressed ? "1px solid #7e22ce" : "",
              borderLeft: isPrelobbyPressed ? "1px solid #7e22ce" : "",
              backgroundColor: "transparent",
            }}
          />
          <div // skew
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[20vw] w-[17vw] top-[0.1vw] skew-x-[45deg] bg-transparent right-[16.5vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isPrelobbyPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[5vw] w-[12.7vw] top-[15.5vw] right-[18.7vw] z-30"
            style={{
              boxShadow: !isPrelobbyPressed ? "0vw 3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[5vw] w-[16.5vw] top-[15.5vw] right-[20.2vw] z-30"
            style={{
              backgroundColor: "transparent",
              borderBottom: isPrelobbyPressed ? "1px solid #7e22ce" : "",
            }}
          />

          <div // skew top
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[30vw] w-[20.5vw] top-[16.1vw] skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isPrelobbyPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // border filler + icon
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[49.2vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent right-[0.1vw] z-40 flex justify-center items-center"
            style={{
              borderLeft: isPrelobbyPressed ? "1px solid #7e22ce" : "",
            }}
          >
            <MdOutlineVideogameAsset className="w-14 h-20 rotate-90 mb-3 text-purple-800" />
          </div>
          <div // background filler
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[20vw] w-[20.5vw] top-1/2 translate-y-[-50%] right-[0.1vw] z-30 flex justify-center items-center"
            style={{
              backgroundColor: "transparent",
              borderLeft: isPrelobbyPressed ? "1px solid #7e22ce" : "",
            }}
          />
          <div // middle shadow
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[52vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent right-[0.1vw] z-30"
            style={{
              boxShadow: !isPrelobbyPressed ? "-3vw 0vw 2vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew bottom
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[30vw] w-[20.5vw] bottom-[16.1vw] -skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isPrelobbyPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
            }}
          />

          <div // border filler
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[5vw] w-[16.5vw] bottom-[15.5vw] right-[20.2vw] z-30"
            style={{
              backgroundColor: "transparent",
              borderTop: isPrelobbyPressed ? "1px solid #7e22ce" : "",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[5vw] w-[12.7vw] bottom-[15.5vw] right-[18.7vw] z-30"
            style={{
              boxShadow: !isPrelobbyPressed ? "0vw -3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[20vw] w-[17vw] bottom-[0.2vw] -skew-x-[45deg] right-[16.2vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isPrelobbyPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87",
            }}
          />
          <div // square
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[20.2vw] w-[17vw] bg-transparent bottom-[0.3vw] right-[26.5vw] z-30"
            style={{
              boxShadow: !isPrelobbyPressed
                ? "-1vw -1vw 2vw -1vw #7e22ce, -2vw -2vw 2vw -1vw #7e22ce"
                : "inset 0px -9px 5px -6px #581c87",
              borderTop: isPrelobbyPressed ? "1px solid #7e22ce" : "",
              borderLeft: isPrelobbyPressed ? "1px solid #7e22ce" : "",
              backgroundColor: "transparent",
            }}
          />
        </div>
      </div>
    </>
  );
};

const PostButtons = ({
  resetPermissions,
  updateLastCP,
  user,
  setPostToggled,
}) => {
  const [isToolsPressed, setIsToolsPressed] = useState(false);
  const [isPostgamesPressed, setIsPostgamesPressed] = useState(false);

  const handleToolsPressed = useCallback(
    async (event) => {
      event.stopPropagation();
      setPostToggled("tools");
    },
    [resetPermissions, updateLastCP]
  );

  const handlePostgamesPressed = useCallback(
    async (event) => {
      event.stopPropagation();
      setPostToggled("postGame");
    },
    [resetPermissions, updateLastCP]
  );

  return (
    <>
      <div className="absolute z-30 w-full h-full">
        <div className="relative w-full h-full">
          {/* left */}
          <div // square
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] left-[26.5vw] z-30"
            style={{
              boxShadow: !isToolsPressed
                ? "1vw 1vw 2vw -1vw #7e22ce, 2vw 2vw 2vw -1vw #7e22ce"
                : "",
              borderBottom: isToolsPressed ? "1px solid #7e22ce" : "",
              borderRight: isToolsPressed ? "1px solid #7e22ce" : "",
              backgroundColor: "transparent",
            }}
          />
          <div // skew
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[20vw] w-[17vw] top-[0.1vw] -skew-x-[45deg] bg-transparent left-[16.5vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isToolsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[5vw] w-[12.7vw] top-[15.5vw] left-[18.7vw] z-30"
            style={{
              boxShadow: !isToolsPressed ? "0vw 3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[5vw] w-[16.5vw] top-[15.5vw] left-[20.2vw] z-30"
            style={{
              backgroundColor: "transparent",
              borderBottom: isToolsPressed ? "1px solid #7e22ce" : "",
            }}
          />

          <div // skew top
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[30vw] w-[20.5vw] top-[16.1vw] -skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isToolsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // border filler + icon
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[49.2vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent left-[0.1vw] z-40 flex justify-center items-center"
            style={{
              borderRight: isToolsPressed ? "1px solid #7e22ce" : "",
            }}
          >
            {/* <GoTools className="w-12 h-12 text-purple-800" /> */}
          </div>
          <div // background filler
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[20vw] w-[20.5vw] top-1/2 translate-y-[-50%] left-[0.1vw] z-30 flex justify-center items-center"
            style={{
              backgroundColor: "transparent",
            }}
          />
          <div // middle shadow
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[52vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent left-[0.1vw] z-30"
            style={{
              boxShadow: !isToolsPressed ? "3vw 0vw 2vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew bottom
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[30vw] w-[20.5vw] bottom-[16.1vw] skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isToolsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
            }}
          />

          <div // border filler
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[5vw] w-[16.5vw] bottom-[15.5vw] left-[20.5vw] z-30"
            style={{
              backgroundColor: "transparent",
              borderTop: isToolsPressed ? "1px solid #7e22ce" : "",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[5vw] w-[12.7vw] bottom-[15.5vw] left-[18.7vw] z-30"
            style={{
              boxShadow: !isToolsPressed ? "0vw -3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[20vw] w-[17vw] bottom-[0.2vw] skew-x-[45deg] left-[16.2vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isToolsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div // square
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[20.2vw] w-[17vw] bg-transparent bottom-[0.3vw] left-[26.5vw] z-30"
            style={{
              boxShadow: !isToolsPressed
                ? "1vw -1vw 2vw -1vw #7e22ce, 2vw -2vw 2vw -1vw #7e22ce"
                : "inset 0px -9px 5px -6px #581c87",
              borderTop: isToolsPressed ? "1px solid #7e22ce" : "",
              borderRight: isToolsPressed ? "1px solid #7e22ce" : "",
              backgroundColor: "transparent",
            }}
          />

          {/* right */}
          <div // square
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] right-[26.5vw] z-30"
            style={{
              boxShadow: !isPostgamesPressed
                ? "-1vw 1vw 2vw -1vw #7e22ce, -2vw 2vw 2vw -1vw #7e22ce"
                : "",
              borderBottom: isPostgamesPressed ? "1px solid #7e22ce" : "",
              borderLeft: isPostgamesPressed ? "1px solid #7e22ce" : "",
              backgroundColor: "transparent",
            }}
          />
          <div // skew
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[20vw] w-[17vw] top-[0.1vw] skew-x-[45deg] bg-transparent right-[16.5vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isPostgamesPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[5vw] w-[12.7vw] top-[15.5vw] right-[18.7vw] z-30"
            style={{
              boxShadow: !isPostgamesPressed ? "0vw 3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[5vw] w-[16.5vw] top-[15.5vw] right-[20.2vw] z-30"
            style={{
              backgroundColor: "transparent",
              borderBottom: isPostgamesPressed ? "1px solid #7e22ce" : "",
            }}
          />

          <div // skew top
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[30vw] w-[20.5vw] top-[16.1vw] skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isPostgamesPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // border filler + icon
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[49.2vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent right-[0.1vw] z-40 flex justify-center items-center"
            style={{
              borderLeft: isPostgamesPressed ? "1px solid #7e22ce" : "",
            }}
          >
            {/* <FaRegFloppyDisk className="w-12 h-12 text-purple-800" /> */}
          </div>
          <div // background filler
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[20vw] w-[20.5vw] top-1/2 translate-y-[-50%] right-[0.1vw] z-30 flex justify-center items-center"
            style={{
              backgroundColor: "transparent",
              borderLeft: isPostgamesPressed ? "1px solid #7e22ce" : "",
            }}
          />
          <div // middle shadow
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[52vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent right-[0.1vw] z-30"
            style={{
              boxShadow: !isPostgamesPressed ? "-3vw 0vw 2vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew bottom
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[30vw] w-[20.5vw] bottom-[16.1vw] -skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isPostgamesPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
            }}
          />

          <div // border filler
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[5vw] w-[16.5vw] bottom-[15.5vw] right-[20.5vw] z-30"
            style={{
              backgroundColor: "transparent",
              borderTop: isPostgamesPressed ? "1px solid #7e22ce" : "",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[5vw] w-[12.7vw] bottom-[15.5vw] right-[18.7vw] z-30"
            style={{
              boxShadow: !isPostgamesPressed ? "0vw -3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[20vw] w-[17vw] bottom-[0.2vw] -skew-x-[45deg] right-[16.2vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: !isPostgamesPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87",
            }}
          />
          <div // square
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[20.2vw] w-[17vw] bg-transparent bottom-[0.3vw] right-[26.5vw] z-30"
            style={{
              boxShadow: !isPostgamesPressed
                ? "-1vw -1vw 2vw -1vw #7e22ce, -2vw -2vw 2vw -1vw #7e22ce"
                : "inset 0px -9px 5px -6px #581c87",
              borderTop: isPostgamesPressed ? "1px solid #7e22ce" : "",
              borderLeft: isPostgamesPressed ? "1px solid #7e22ce" : "",
              backgroundColor: "transparent",
            }}
          />
        </div>
      </div>
    </>
  );
};

export function OctagonBackground({ handleBgClick }) {
  return (
    <>
      <div
        className="absolute w-[26.3vw] h-[36vw] -skew-y-[45deg] translate-y-[-28vw] translate-x-[-1px] left-0 z-40 bg-black"
        onClick={handleBgClick}
      />
      <div
        className="absolute w-[26.3vw] h-[36vw] skew-y-[45deg] translate-y-[-28vw] translate-x-[1px] right-0 z-40 bg-black"
        onClick={handleBgClick}
      />
      <div
        className="absolute w-[26.3vw] h-[36vw] skew-y-[45deg] translate-y-[28vw] translate-x-[-1px] left-0 bottom-0 z-40 bg-black"
        onClick={handleBgClick}
      />
      <div
        className="absolute w-[26.3vw] h-[36vw] -skew-y-[45deg] translate-y-[28vw] translate-x-[1px] right-0 bottom-0 z-40 bg-black"
        onClick={handleBgClick}
      />

      <>
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[-13.3vw] translate-x-[0vw] right-0 bottom-0 z-20 bg-transparent"
          style={{ boxShadow: "13px 20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[5.6vw] translate-x-[-17.6vw] right-0 bottom-0 z-20 bg-transparent rotate-45"
          style={{ boxShadow: "13px 20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[6.7vw] translate-x-[20vw] left-0 bottom-0 z-20 bg-transparent rotate-90"
          style={{ boxShadow: "13px 20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[39vw] translate-x-[1vw] left-0 top-0 z-20 bg-transparent rotate-[-45deg]"
          style={{ boxShadow: "-13px -20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[13.3vw] translate-x-[0vw] left-0 top-0 z-20 bg-transparent rotate-[0deg]"
          style={{ boxShadow: "-13px -20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[-5.6vw] translate-x-[17.7vw] left-0 top-0 z-20 bg-transparent rotate-[-135deg]"
          style={{ boxShadow: "13px 20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[-6.5vw] translate-x-[43.6vw] left-0 top-0 z-20 bg-transparent rotate-[90deg]"
          style={{ boxShadow: "-13px -20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[11vw] translate-x-[-1.2vw] right-0 top-0 z-20 bg-transparent rotate-[135deg]"
          style={{ boxShadow: "-13px -20px 15px -2px #3b0764" }}
        />
      </>

      <div
        className="absolute top-1/2 translate-y-[-50%] bg-transparent w-[90vw] h-[90vw] z-10 flex items-center"
        style={{ pointerEvents: "none" }}
      >
        <div className="relative w-full h-full">
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw]"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-45"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-90"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-[-45deg]"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-[-45deg]"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-[-90deg]"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw]"
            style={{
              boxShadow: "inset -9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-45"
            style={{
              boxShadow: "inset -9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-[-45deg]"
            style={{
              boxShadow: "inset -9px 0px 5px -6px #581c87",
            }}
          />
        </div>
      </div>
    </>
  );
}

const CentralZone = ({ children, onClick, zIndex }) => {
  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        onClick && onClick(event);
      }}
      className={`central-zone absolute top-[18.2%] left-[11.4%] h-[57.1vw] w-[69.3vw] z-[${zIndex}]`}
    >
      {children}
    </div>
  );
};

const BarParam = ({ style, borderPosition }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [style]);

  return ReactDOM.createPortal(
    <>
      <style jsx>
        {`
          @keyframes colorWipeTop {
            0% {
              border-top: 2px solid #f3f4f6; // gray 100
            }
            100% {
              border-top: 2px solid #000000;
            }
          }
          @keyframes colorWipeBottom {
            0% {
              border-bottom: 2px solid #f3f4f6; // gray 100
            }
            100% {
              border-bottom: 2px solid #000000;
            }
          }
        `}
      </style>
      <div
        key={key}
        className="absolute w-full"
        style={{
          ...style,
          animation:
            borderPosition === "top" ? "colorWipeTop 7s" : "colorWipeBottom 7s",
        }}
      />
    </>,
    document.body
  );
};

const Params = ({
  updateParams,
  updateLastCP,
  user,
  barValues,
  setBarValues,
  keyboard,
  setKeyboard,
}) => {
  const possibleBarValues = [4, 6, 8, 12, 14, 16, 18, 20];
  const [editedBarsValues, setEditedBarsValues] = useState(false);
  const possibleKeyboardLanguages = ["AZERTY", "QWERTY"];

  useEffect(() => {
    if (!user || barValues) return;
    if (!user?.params) {
      setBarValues({ bottomBarSize: 8, topBarSize: 8 });
      setKeyboard({ language: "AZERTY" });
      return;
    }
    const userParams = user.params || {};
    setBarValues({
      bottomBarSize: userParams.bottomBarSize,
      topBarSize: userParams.topBarSize,
    });
    setKeyboard({ language: userParams.keyboard?.language || "AZERTY" });
  }, [user, barValues]);

  useEffect(() => {
    if (!barValues || !user) return;
    const update = async () => {
      await updateParams({
        userId: user.id,
        param: "topBarSize",
        value: barValues.topBarSize,
      });
      await updateParams({
        userId: user.id,
        param: "bottomBarSize",
        value: barValues.bottomBarSize,
      });
      await updateParams({
        userId: user.id,
        param: "keyboard",
        value: keyboard,
      });
    };
    update();
  }, [barValues, user, updateParams, keyboard]);

  if (!barValues) return null;

  return (
    <div className="h-full aspect-square flex flex-col items-center justify-start relative translate-x-[0.12vw] translate-y-[0.1vw] z-30 py-1.5">
      {editedBarsValues && (
        <>
          <BarParam
            style={{ top: 0, height: `${barValues.topBarSize / 4}rem` }}
            borderPosition="bottom"
          />
          <BarParam
            style={{ bottom: 0, height: `${barValues.bottomBarSize / 4}rem` }}
            borderPosition="top"
          />
        </>
      )}

      <div className="w-[95%] h-full flex flex-col items-center px-0.5">
        {[
          { param: "topBarSize", label: "Barre supérieure" },
          {
            param: "bottomBarSize",
            label: "Barre inférieure",
          },
        ].map((barParam, i) => (
          <div
            key={i}
            onClick={(event) => event.stopPropagation()}
            className="relative border border-purple-200 bg-purple-400 p-1 mb-2 w-full text-center flex items-center text-purple-900 h-8"
          >
            <div className="text-center w-full relative">
              <div
                onClick={() => {
                  const index = possibleBarValues?.indexOf(
                    (barValues && barValues[barParam.param]) ||
                      possibleBarValues[0]
                  );
                  const newIndex = index === 0 ? index : index - 1;
                  setBarValues((prevValues) => ({
                    ...prevValues,
                    [barParam.param]: possibleBarValues[newIndex],
                  }));
                  setEditedBarsValues(true);
                }}
                className="absolute left-0 top-0 w-2/5 bg-white h-full z-30 opacity-0"
              />
              {barParam.label} : {barValues && barValues[barParam.param]}
              <div
                onClick={() => {
                  const index = possibleBarValues?.indexOf(
                    (barValues && barValues[barParam.param]) ||
                      possibleBarValues[0]
                  );
                  const newIndex =
                    index >= possibleBarValues.length - 1 ? index : index + 1;
                  setBarValues((prevValues) => ({
                    ...prevValues,
                    [barParam.param]: possibleBarValues[newIndex],
                  }));
                  setEditedBarsValues(true);
                }}
                className="absolute right-0 top-0 w-2/5 bg-white h-full z-30 opacity-0"
              />
            </div>
          </div>
        ))}
        <div
          onClick={(event) => event.stopPropagation()}
          className="relative border border-purple-200 bg-purple-400 p-1 mb-2 w-full text-center flex items-center text-purple-900 h-8"
        >
          <div className="text-center w-full relative flex items-center justify-end pr-6">
            <div
              onClick={() => {
                const index = possibleKeyboardLanguages?.indexOf(
                  (keyboard && keyboard.language) ||
                    possibleKeyboardLanguages[0]
                );
                const newIndex =
                  index === 0
                    ? possibleKeyboardLanguages.length - 1
                    : index - 1;
                setKeyboard((prevKeyboard) => ({
                  ...prevKeyboard,
                  language: possibleKeyboardLanguages[newIndex],
                }));
              }}
              className="absolute left-0 top-0 w-2/5 bg-white h-full z-30 opacity-0"
            />

            <FaKeyboard className="z-0 absolute left-[10%] h-8 w-8" />
            <div className="z-0">{`${keyboard.language}`}</div>

            <div
              onClick={() => {
                const index = possibleKeyboardLanguages?.indexOf(
                  (keyboard && keyboard.language) ||
                    possibleKeyboardLanguages[0]
                );
                const newIndex =
                  index + 1 >= possibleKeyboardLanguages.length ? 0 : index + 1;
                setKeyboard((prevKeyboard) => ({
                  ...prevKeyboard,
                  language: possibleKeyboardLanguages[newIndex],
                }));
              }}
              className="absolute right-0 top-0 w-2/5 bg-white h-full z-30 opacity-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SwipableDiv = ({ onConfirmedSwipe, height, margin, children }) => {
  const divRef = useRef(null);
  const [divHeight, setDivHeight] = useState(0);
  const startX = useRef(0);
  const swipeDistance = useRef(0);
  const [swipedWidth, setSwipedWidth] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);

  useEffect(() => {
    if (!divRef?.current) return;
    setDivHeight(divRef.current.getBoundingClientRect().height);
  }, [divRef]);

  const handleTouchStart = (e) => {
    if (isSwiped) return;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (isSwiped) return;
    const currentX = e.touches[0].clientX;
    swipeDistance.current = Math.max(0, currentX - startX.current);
    setSwipedWidth(swipeDistance.current);
  };

  const handleTouchEnd = () => {
    if (!divRef?.current) return;
    const widthThreshold = divRef.current.getBoundingClientRect().width / 2;
    if (swipeDistance.current >= widthThreshold) {
      setIsSwiped(true);
    }
    setSwipedWidth(0);
    startX.current = 0;
  };

  return (
    <div
      className={`relative w-full h-${height} m-${margin} overflow-hidden touch-none`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`absolute top-0 left-0 border border-red-900 bg-red-500 flex justify-center items-center transition-none z-10 ${
          !startX?.current && "hidden"
        }`}
        style={{
          width: `${swipedWidth}px`,
          height: divRef?.current?.getBoundingClientRect().height,
        }}
      >
        <FaRegTrashAlt className="w-8 h-8 text-red-900 py-1" />
      </div>

      <div
        ref={divRef}
        className="w-full h-full flex items-center justify-center"
      >
        {!isSwiped ? (
          children
        ) : (
          <div
            className="w-full flex gap-1 border border-purple-200 bg-purple-400 p-1"
            style={{ height: `${divHeight}px` }}
          >
            <div
              onClick={() => setIsSwiped(false)}
              className="h-full w-full flex justify-center items-center border border-red-800 bg-red-300"
            >
              <XMarkIcon
                className="text-red-800 py-1"
                style={{ height: `${divHeight}px` }}
              />
            </div>
            <div
              onClick={async () => await onConfirmedSwipe()}
              className="h-full w-full flex justify-center items-center border border-green-800 bg-green-300"
            >
              <FaCheck
                className="text-green-800"
                style={{ height: `${divHeight}px` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Friends = ({ friendList, user, deleteFriend, updateLastCP }) => {
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    setLocked(false);
  }, []);

  const onDeleteFriend = useCallback(
    async (friend) => {
      // event.stopPropagation();
      if (locked) return;
      await deleteFriend({
        userId: user.id,
        friendId: friend.friendId,
      });
      updateLastCP({ userId: user.id }); // no await
    },
    [locked, deleteFriend, user, updateLastCP]
  );

  return (
    <div className="h-full aspect-square translate-x-[0.12vw] translate-y-[0.1vw] py-1 flex flex-col items-center justify-center relative z-30">
      <div className="h-full w-[95%] flex flex-col justify-start items-center gap-1">
        {friendList.map((friend) => (
          <div
            key={friend.friendId}
            className="flex justify-center items-center w-full"
          >
            <SwipableDiv
              onConfirmedSwipe={() => onDeleteFriend(friend)}
              height={8}
              margin={0.5}
            >
              <div className="border border-purple-200 bg-purple-400 w-full h-full">
                <div className="h-full w-full text-purple-900 flex items-center justify-center">
                  {friend.customName}
                </div>
              </div>
            </SwipableDiv>
          </div>
        ))}
      </div>
    </div>
  );
};

const Invitations = ({
  user,
  updateLastCP,
  getPublicRooms,
  publicRooms,
  setPublicRooms,
  invitations,
  currentGame,
  setIsGoingGame,
  router,
}) => {
  const [threeFirsts, setThreeFirsts] = useState([]);

  useEffect(() => {
    setPublicRooms((prevPublics) => {
      const alreadyInInvitations = [];
      Object.entries(prevPublics).forEach((pub) => {
        invitations.forEach((inv) => {
          if (inv.link === pub[1].link) alreadyInInvitations.push(pub[0]);
        });
      });
      if (!alreadyInInvitations.length) return prevPublics;
      const publics = { ...prevPublics };
      alreadyInInvitations.forEach((already) => delete publics[already]);
      return publics;
    });
  }, [publicRooms, invitations, setPublicRooms]);

  useEffect(() => {
    const getRooms = async () => {
      setPublicRooms(await getPublicRooms());
    };
    getRooms();
  }, [getPublicRooms, setPublicRooms]);

  useEffect(() => {
    let newThreeFirsts = [];
    newThreeFirsts = invitations.slice(-3);

    const freeSpotsNumber = 3 - newThreeFirsts.length;
    if (freeSpotsNumber && Object.keys(publicRooms).length) {
      const formattedPublicRooms = Object.values(publicRooms)
        .slice(-freeSpotsNumber)
        .map((publicRoom) => ({
          ...publicRoom,
          userName: publicRoom.friendName,
        }));
      newThreeFirsts = [...newThreeFirsts, ...formattedPublicRooms];
    }

    if (currentGame) {
      newThreeFirsts = [
        {
          gameName: currentGame.game,
          link: `${process.env.NEXT_PUBLIC_DEHORS_URL}${currentGame.path}`,
          userName: currentGame.admin,
          isCurrentGame: true,
        },
      ];
    }

    setThreeFirsts(newThreeFirsts);
  }, [invitations, publicRooms, currentGame]);

  return (
    <div className="w-full h-full flex flex-col justify-start items-center relative py-5 gap-1">
      {!invitations.length &&
        !Object.keys(publicRooms).length &&
        !currentGame && (
          <div className="text-center text-purple-800 absolute top-1/2 translate-y-[-50%]">
            <div>Aucune partie</div>
            <div>disponible</div>
          </div>
        )}

      {/* tricky: translate */}
      <div className="h-full aspect-square flex flex-col gap-0.5 translate-x-[0.12vw] translate-y-[0.1vw] z-30">
        {threeFirsts.map((invitation, i) => (
          <div key={i} className="relative z-30 opacity-60 flex-1">
            <div
              onClick={async (event) => {
                event.stopPropagation();
                // resetPermissions();
                await updateLastCP({ userId: user.id, out: true });
                setIsGoingGame(true);
                router.push(invitation.link);
              }}
              className="w-full z-30 h-full"
            >
              <div className="h-full flex items-center justify-center border border-2 border-purple-800 text-lg font-semibold text-purple-900 bg-purple-500">
                {!invitation.isCurrentGame ? (
                  invitation.userName
                ) : (
                  <IoIosRefresh className="w-8 h-8" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Categories({
  user,
  tmpToken,
  updateParams,
  friendList,
  addFriend,
  deleteFriend,
  getPublicRooms,
  getCurrentGame,
  updateLastCP,
  signOut,
}) {
  const { isSupported, isVisible, released, request, release } = useWake();
  usePreventBackSwipe();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGroup = searchParams.get("group") === "true";

  const [toggledSettings, setToggledSettings] = useState(false);
  const [setting, setSetting] = useState("");
  const [toggledPrelobby, setToggledPrelobby] = useState(
    searchParams.get("prelobby") === "true"
  );
  const [postToggled, setPostToggled] = useState(null);

  const [location, setLocation] = useState(null);
  const [scanLocked, setScanLocked] = useState(false);
  const [stopScan, setStopScan] = useState();
  const [scanning, setScanning] = useState(false);

  const [barValues, setBarValues] = useState();
  const [keyboard, setKeyboard] = useState();
  const [octagonPosition, setOctagonPosition] = useState();

  const [serverMessage, setServerMessage] = useState();

  const [publicRooms, setPublicRooms] = useState({});
  const [invitations, setInvitations] = useState([]);
  const [currentGame, setCurrentGame] = useState();

  const [isGoingGame, setIsGoingGame] = useState(false);

  useEffect(() => {
    const channel = pusher.subscribe(`user-${user.email}`);
    channel.bind("user-event", function (data) {
      if (data.message) {
        setServerMessage(data.message);
        if (data.message.includes("ajouté")) setSetting("friends");
        router.refresh();
      }

      if (data.invitation) {
        if (data.invitation.deleted) {
          setPublicRooms((prevPublics) => {
            const prevPubs = { ...prevPublics };
            let deletedId;
            Object.entries(prevPubs).find((pub) => {
              if (pub[1].link === data.invitation.link) deletedId = pub[0];
            });
            if (deletedId) delete prevPubs[deletedId];
            return prevPubs;
          });
          if (!data.invitation.isPublicDel) {
            setInvitations((prevInvitations) => {
              const prevInvs = [...prevInvitations];
              const deletedInvs = prevInvs.filter(
                (inv) => inv.link !== data.invitation.link
              );
              return deletedInvs;
            });
          }
        } else {
          if (data.invitation.isPublic) {
            setPublicRooms((prevPublics) => {
              const publicRooms = { ...prevPublics };
              publicRooms[data.invitation.roomId] = {
                friendName: data.invitation.userName,
                gameName: data.invitation.gameName,
                link: data.invitation.link,
              };
              return publicRooms;
            });
          } else {
            setInvitations((prevInvitations) => {
              const prevInvs = [...prevInvitations];

              const alreadyInviterIndex = prevInvs.findIndex(
                (inv) => inv.userName === data.invitation.userName
              );
              if (alreadyInviterIndex !== -1) {
                prevInvs.splice(alreadyInviterIndex, 1);
                return [...prevInvs, data.invitation];
              }

              const sameInvLink = prevInvs.some(
                (inv) => inv.link === data.invitation.link
              );
              if (sameInvLink) return [...prevInvs];

              return [...prevInvs, data.invitation];
            });
          }
        }
      }
    });

    updateLastCP({ userId: user.id }); // no await

    return () => {
      pusher.unsubscribe(`user-${user.email}`);
    };
  }, [user, router, updateLastCP]);

  const onNewScanResult = throttle(
    async (decodedText) => {
      if (scanLocked) return;
      let userLocation;
      setScanLocked(true);
      // userLocation = await getLocation();

      const { error: addFriendError } = await addFriend({
        userLocation,
        friendCode: decodedText,
      });
      if (addFriendError) {
        if (addFriendError === "lobby_code") {
          router.push(decodedText);
          return;
        }
        setServerMessage(addFriendError);
        setSetting("");
      }
      setTimeout(() => {
        setScanLocked(false);
      }, 1000);
    },
    1000,
    { leading: true, trailing: false }
  );

  const QrCodeScanner = useMemo(() => {
    const requestCameraAccess = async () => {
      if (typeof window === "undefined") return;

      if (setting !== "camera" || stopScan) return;

      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (error) {
        console.error("Erreur lors de l'accès à la caméra :", error);
        const errorInformations = getErrorInformations({
          window,
          fail: "camera_permission",
        }).map((info, i) => (
          <div key={i} className={`${i === 0 && "font-bold"}`}>
            {i !== 0 && "=>"}
            {info}
          </div>
        ));
        setServerMessage(errorInformations);
        setScanning(false);
      }
    };
    requestCameraAccess();

    return (
      <div className="h-full flex items-center justify-center">
        <div
          onClick={(event) => event.stopPropagation()}
          className="h-[45vw] flex items-center"
        >
          <Html5QrcodePlugin
            scanning={setting === "camera"}
            fps={60}
            qrCodeSuccessCallback={onNewScanResult}
            setStopScan={setStopScan}
          />
        </div>
      </div>
    );
  }, [setting, scanning]);

  const resetPermissions = useCallback(() => {
    stopScan && setting === "camera" && stopScan();
    setStopScan();
  }, [stopScan, setting]);

  const handleBgClick = useCallback(
    (event) => {
      event.stopPropagation();
      resetPermissions();
      if (setting !== "") {
        setSetting("");
      } else {
        setToggledSettings(false);
      }
      if (postToggled !== null) {
        setPostToggled(null);
      } else {
        setToggledPrelobby(false);
      }
      setServerMessage("");
    },
    [resetPermissions, setting, postToggled]
  );

  // check
  const handleOctaClick = useCallback(
    (event) => {
      // resetPermissions();
      event.stopPropagation();
      // !toggledSettings && setToggledPrelobby(true);
      // toggledSettings && setToggledSettings(false);
      // setSetting("");
      // setServerMessage("");
    },
    [toggledSettings, resetPermissions]
  );

  useEffect(() => {
    const backToRoom = async () => {
      const current = await getCurrentGame();
      current && setCurrentGame(current);
    };
    backToRoom();
  }, [getCurrentGame, router]);

  useEffect(() => {
    if (!user || !updateLastCP) return;

    const CPInterval = setInterval(async () => {
      await updateLastCP({ userId: user.id });
    }, 5000);
    return () => clearInterval(CPInterval);
  }, [updateLastCP, user]);

  const showInvitations = !toggledSettings && !toggledPrelobby;

  useEffect(() => {
    const dynamicColor =
      setting === "camera" || setting === "qrCode" ? "black" : "#9333ea";
    document.documentElement.style.setProperty(
      "--dynamic-border-color",
      dynamicColor
    );
  }, [setting]);

  useEffect(() => {
    if (!user) return;

    if (!barValues) {
      const { params } = user;
      const { bottomBarSize, topBarSize } = params;
      const octagonPosition = `${(topBarSize - bottomBarSize) / 8}rem`;
      setOctagonPosition(octagonPosition);
    } else {
      const { bottomBarSize, topBarSize } = barValues;
      const octagonPosition = `${(topBarSize - bottomBarSize) / 8}rem`;
      setOctagonPosition(octagonPosition);
    }
  }, [user, barValues]);

  return (
    <div
      onClick={(event) => {
        handleBgClick(event);
      }}
      className={`h-screen flex items-center ${
        !isGroup ? "bg-black" : "bg-white"
      } text-white`}
    >
      <main
        className={`relative h-[100dvh] w-screen transition-transform duration-500 ${
          !octagonPosition && "hidden"
        }`}
        style={{
          transform: `translateY(${octagonPosition})`,
        }}
      >
        <div
          onClick={handleOctaClick}
          className="octagon left-1/2 translate-x-[-50%] top-[50dvh] translate-y-[-50%] relative z-0"
        >
          <OctagonBackground handleBgClick={handleBgClick} />

          <div
            className={`${
              isGoingGame
                ? "opacity-0 animate-[fadeOut_0.5s_ease-in-out]"
                : "opacity-100"
            }`}
          >
            {toggledSettings && (
              <>
                <SettingsButtons
                  updateLastCP={updateLastCP}
                  user={user}
                  tmpToken={tmpToken}
                  setSetting={setSetting}
                  setLocation={setLocation}
                  setServerMessage={setServerMessage}
                  resetPermissions={resetPermissions}
                  setScanning={setScanning}
                  setting={setting}
                  signOut={signOut}
                />

                {setting === "friends" && (
                  <CentralZone>
                    <div className="flex w-full h-full justify-center items-center py-5">
                      <Friends
                        friendList={friendList}
                        user={user}
                        deleteFriend={deleteFriend}
                        updateLastCP={updateLastCP}
                      />
                    </div>
                  </CentralZone>
                )}

                {setting === "params" && (
                  <CentralZone>
                    <div className="flex w-full h-full justify-center items-center py-5">
                      <Params
                        updateParams={updateParams}
                        updateLastCP={updateLastCP}
                        user={user}
                        barValues={barValues}
                        setBarValues={setBarValues}
                        keyboard={keyboard}
                        setKeyboard={setKeyboard}
                      />
                    </div>
                  </CentralZone>
                )}

                {setting === "qrCode" && (
                  <CentralZone onClick={handleOctaClick} zIndex={60}>
                    {location ? (
                      <div className="w-full h-full flex justify-center items-center">
                        <QRCode
                          value={`id=${user.id};mail=${user.email};name=${user.name};{"latitude":"${location?.latitude}","longitude":"${location?.longitude}"}`}
                          onClick={(event) => event.stopPropagation()}
                          className="h-[41vw] w-auto"
                          style={{
                            background: "white",
                            boxShadow: "0px 0px 5px 5px white",
                          }}
                        />
                      </div>
                    ) : null}
                  </CentralZone>
                )}

                <div className={`${setting !== "camera" && "hidden"}`}>
                  <CentralZone onClick={handleOctaClick} zIndex={60}>
                    {QrCodeScanner}
                  </CentralZone>
                </div>
              </>
            )}

            {showInvitations && (
              <>
                <MainButtons
                  setToggledSettings={setToggledSettings}
                  setToggledPrelobby={setToggledPrelobby}
                />
                <CentralZone onClick={handleOctaClick}>
                  <Invitations
                    user={user}
                    updateLastCP={updateLastCP}
                    getPublicRooms={getPublicRooms}
                    publicRooms={publicRooms}
                    setPublicRooms={setPublicRooms}
                    invitations={invitations}
                    currentGame={currentGame}
                    setIsGoingGame={setIsGoingGame}
                    router={router}
                  />
                </CentralZone>
              </>
            )}

            {toggledPrelobby && !toggledSettings && !postToggled && (
              <>
                <PostButtons
                  resetPermissions={resetPermissions}
                  updateLastCP={updateLastCP}
                  user={user}
                  setPostToggled={setPostToggled}
                />
                <CentralZone>
                  <div className="flex w-full h-full justify-center items-center py-5">
                    <div
                      className="h-full aspect-square translate-x-[0.12vw] translate-y-[0.1vw] flex justify-center items-center bg-purple-600 z-30"
                      style={{
                        background:
                          "radial-gradient(circle, #a855f7 0%, #7e22ce 100%)",
                      }}
                    >
                      <div
                        style={{
                          width: "23vw",
                          height: "23vw",
                          borderRadius: "50%",
                          background:
                            "radial-gradient(circle, #7e22ce 0%, #9333ea 100%)",
                          boxShadow: `inset 5px 5px 10px rgba(255, 255, 255, 0.3), inset -5px -5px 15px rgba(0, 0, 0, 0.3), 5px 5px 15px rgba(0, 0, 0, 0.3), 5px 5px 15px rgba(255, 255, 255, 0.1)`,
                        }}
                        className="flex justify-center items-center border border-purple-800"
                      >
                        <div
                          onClick={async (event) => {
                            setIsGoingGame(true);
                            event.stopPropagation();
                            resetPermissions();
                            await updateLastCP({
                              userId: user.id,
                              out: true,
                            });
                            router.push("/categories/categorie5/research");
                            // router.push(
                            //   user.lastPlayed || "/categories/grouping/grouping"
                            // );
                          }}
                          className="z-30"
                        >
                          <FaPlay className="ml-1.5 w-10 h-10 text-purple-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CentralZone>
              </>
            )}

            {postToggled && (
              <CentralZone>
                <div className="flex w-full h-full justify-center items-center py-5">
                  <div
                    className="h-full aspect-square translate-x-[0.12vw] translate-y-[0.1vw] flex flex-col justify-start items-center bg-purple-600 p-2"
                    style={{
                      boxShadow:
                        "inset 0vw 3vw 1vw -2vw #7e22ce, inset 0vw -3vw 1vw -2vw #7e22ce, inset 3vw 0vw 1vw -2vw #7e22ce, inset -3vw 0vw 1vw -2vw #7e22ce",
                    }}
                  >
                    {postToggled === "tools" && (
                      <>
                        {toolsList.map((tool, i) => (
                          <div
                            key={i}
                            onClick={(event) => event.stopPropagation()}
                            className="relative border border-purple-200 bg-purple-400 p-1 mb-2 w-full text-center text-purple-900 h-8"
                          >
                            <div
                              onClick={async () => {
                                setIsGoingGame(true);
                                resetPermissions();
                                await updateLastCP({
                                  userId: user.id,
                                  out: true,
                                });
                                router.push(`/tools/?tool=${tool.tool}`);
                              }}
                              className="text-center w-full relative"
                            >
                              {tool.layout}
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {postToggled === "postGame" && (
                      <>
                        {postGamesList.map((pg, i) => (
                          <div
                            key={i}
                            onClick={(event) => event.stopPropagation()}
                            className="relative border border-purple-200 bg-purple-400 p-1 mb-2 w-full text-center text-purple-900 h-8"
                          >
                            <div
                              onClick={async () => {
                                setIsGoingGame(true);
                                resetPermissions();
                                await updateLastCP({
                                  userId: user.id,
                                  out: true,
                                });
                                router.push(`/post-game/?game=${pg.game}`);
                              }}
                              className="text-center w-full relative"
                            >
                              {pg.layout}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </CentralZone>
            )}

            <div className="absolute top-full z-20 w-full mt-4 text-center text-purple-100">
              {serverMessage}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
