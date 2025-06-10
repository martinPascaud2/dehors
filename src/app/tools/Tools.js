"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import Pusher from "pusher-js";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import usePreventBackSwipe from "@/utils/usePreventBackSwipe";

import { audios } from "./audios";

console.log("audios", audios);

import LoadingRoomOctagon from "@/components/Room/LoadingRoomOctagon";
import ThreeSmoke from "@/components/Room/ThreeSmoke";
import { StaticNextStep } from "@/components/NextStep";
import ControlButton from "@/components/ControlButton";

const Buzzer = () => {
  const audio = useRef();
  const [selectedAudio, setSelectedAudio] = useState();

  const handleChooseSound = (e) => {
    setSelectedAudio(e.target.value);
  };

  const handlePlay = () => {
    audio.current && audio.current.play();
    // onPress && onPress(id)
  };

  useEffect(() => {
    if (!selectedAudio) setSelectedAudio(audios[0].value);
  }, [selectedAudio]);

  useEffect(() => {
    if (!selectedAudio) return;
    audio.current = new Audio(`/sounds/${selectedAudio}`);
  }, [selectedAudio]);

  return (
    <div className="flex flex-col justify-center items-center w-full h-full relative">
      <select
        onChange={handleChooseSound}
        className="border border-2 border-blue-600 bg-blue-100 text-blue-600 p-2 font-semibold m-2 w-36 rounded-lg"
      >
        {audios.map((audio, i) => (
          <option key={i} value={audio.value} className="text-center">
            {audio.label}
          </option>
        ))}
      </select>
      <button
        onClick={(e) => {
          e.preventDefault();
          handlePlay();
        }}
        className="w-36 h-36 rounded-full border border-2 m-2 border-red-900 bg-red-600 text-red-900 shadow-[inset_0_0px_2rem_0px_#7f1d1d]"
      ></button>
    </div>
  );
};

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
});

const RealtimeMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position]);
  return null;
};

const Map = ({ user }) => {
  const [position, setPosition] = useState([48.8566, 2.3522]);

  useEffect(() => {
    const pusher = new Pusher("61853af9f30abf9d5b3d", {
      cluster: "eu",
      useTLS: true,
    });

    const channel = pusher.subscribe("user-location");
    channel.bind("location-update", (data) => {
      if (data && data.lat && data.lng) {
        setPosition([data.lat, data.lng]);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  // dev
  const simulateNewPosition = () => {
    setPosition(([lat, lng]) => [lat + 0.0001, lng + 0.0001]);
  };

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-center">
      <MapContainer
        id="map"
        center={position}
        zoom={17}
        style={{ height: "70vh", width: "90%" }}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <RealtimeMap position={position} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position} icon={userIcon}>
          <Popup>
            Position actuelle de l'utilisateur :<br />
            {position[0]}, {position[1]}
          </Popup>
        </Marker>
      </MapContainer>

      <button
        onClick={simulateNewPosition}
        style={{ position: "absolute", zIndex: 1000 }}
      >
        Simuler
      </button>
    </div>
  );
};

export default function Tools({ user }) {
  usePreventBackSwipe();
  const { params: userParams } = user;
  const barsSizes = useMemo(
    () => ({
      bottom: userParams?.bottomBarSize || 8,
      top: userParams?.topBarSize || 8,
    }),
    [userParams?.bottomBarSize, userParams?.topBarSize]
  );
  const calculatedHeight = `calc(100dvh - ${barsSizes.top / 4}rem - ${
    barsSizes.bottom / 4
  }rem)`;
  const searchParams = useSearchParams();
  const searchTool = searchParams.get("tool");

  const [hasLoadingOctagonAnimated, setHasLoadingOctagonAnimated] =
    useState(false);
  useEffect(() => {
    setTimeout(() => setHasLoadingOctagonAnimated(true), 2900);
  }, []);

  const [selectedTool, setSelectedTool] = useState(searchTool);
  const [showedControls, setShowedControls] = useState(false);
  const [showedToolsList, setShowedToolsList] = useState(false);
  const [showedInfo, setShowedInfo] = useState(false);

  const selectionClass = (tool) => {
    return `${
      tool === selectedTool
        ? "border border-green-400 bg-green-100 text-green-400 p-2 h-16 w-28 text-center flex items-center justify-center"
        : "border border-blue-400 bg-blue-100 text-blue-400 p-2 h-12 w-24 text-center flex items-center justify-center"
    }`;
  };

  if (!hasLoadingOctagonAnimated)
    return (
      <div
        className="h-screen w-full px-2 overflow-x-hidden bg-black"
        style={{
          paddingTop: `${barsSizes.top / 4}rem`,
          paddingBottom: `${barsSizes.bottom / 4}rem`,
        }}
      >
        <LoadingRoomOctagon isJoinStarted />
      </div>
    );

  return (
    <div
      onClick={() => {
        setShowedToolsList(false);
        setShowedInfo(false);
        setShowedControls(false);
      }}
      className="w-full h-full relative"
      style={{
        paddingTop: `${barsSizes.top / 4}rem`,
        paddingBottom: `${barsSizes.bottom / 4}rem`,
      }}
    >
      <ThreeSmoke />

      <div
        className="w-full flex justify-center absolute"
        style={{
          height: `${calculatedHeight}`,
        }}
      >
        {!showedControls ? (
          <StaticNextStep
            onLongPress={() => {
              setShowedControls(true);
            }}
          >
            <div className="text-sm">{"Outils"}</div>
          </StaticNextStep>
        ) : (
          <>
            <div
              className="w-full absolute flex justify-around"
              style={{
                pointerEvents: "none",
                height: `${calculatedHeight}`,
              }}
            >
              <ControlButton
                layout="?"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowedInfo(true);
                  setShowedToolsList(false);
                }}
              />
              <ControlButton
                layout="!"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowedInfo(false);
                  setShowedToolsList(true);
                }}
              />
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-20"
              style={{
                zIndex: 20,
                pointerEvents: "auto",
                bottom: 0,
              }}
            >
              <Link
                href={"/categories/?prelobby=true"}
                className="border border-blue-300 bg-blue-100 p-1"
              >
                Retour
              </Link>
            </div>
          </>
        )}
      </div>

      {showedToolsList && (
        <div className="relative flex flex-col items-center justify-center gap-4 w-full h-full z-10">
          <div
            onClick={() => {
              setSelectedTool("buzzer");
              setShowedControls(false);
              setShowedToolsList(false);
            }}
            className={selectionClass("buzzer")}
          >
            Buzzer
          </div>
          <div
            onClick={() => {
              setSelectedTool("map");
              setShowedControls(false);
              setShowedToolsList(false);
            }}
            className={selectionClass("map")}
          >
            Carte
          </div>
        </div>
      )}

      {showedInfo && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-[90%] border rounded-md border-sky-700 bg-sky-100 text-sky-700 p-2 flex flex-col">
            <div className="text-sky-700 text-sm w-full flex items-center justify-center">
              Buzzer : c'est un buzzer
            </div>
            <div className="text-sky-700 text-sm w-full flex items-center justify-center">
              Carte : une carte
            </div>
          </div>
        </div>
      )}

      {selectedTool === "buzzer" && !showedToolsList && !showedInfo && (
        <Buzzer />
      )}

      {selectedTool === "map" && !showedToolsList && !showedInfo && (
        <Map user={user} />
      )}
    </div>
  );
}
