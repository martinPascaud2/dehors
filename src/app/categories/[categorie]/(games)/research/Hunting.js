"use client";

import { useState, useEffect } from "react";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./hunting.css";

import ValidateButton from "@/components/NextStep";

const userIcon = new L.Icon({
  // iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconUrl: "/position.png",
  iconSize: [35, 35],
});

import { sendPosition, getPositions } from "./gameActions";

const RealtimeMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position]);
  return null;
};

const FitBounds = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (!positions || positions.length === 0) return;

    const bounds = L.latLngBounds(
      positions
        .filter(
          (p) =>
            typeof p.latitude === "number" &&
            typeof p.longitude === "number" &&
            !isNaN(p.latitude) &&
            !isNaN(p.longitude)
        )
        .map((p) => [p.latitude, p.longitude])
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);

  return null;
};

const Map = ({ user, roomId, roomToken, positions }) => {
  // const { positions } = gameData;

  const [position, setPosition] = useState([48.8566, 2.3522]);

  // dev
  const simulateNewPosition = async () => {
    const newPosition = [position[0] + 0.001, position[1] + 0.001];
    setPosition(newPosition);
    await sendPosition({ roomId, roomToken, user, newPosition });
  };

  useEffect(() => {
    let lastSentTime = 0;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);

        const now = Date.now();

        // const newPosition = coords;
        // sendPosition({ roomId, roomToken, user, newPosition });
        if (now - lastSentTime >= 10000) {
          lastSentTime = now;
          const newPosition = coords;
          sendPosition({ roomId, roomToken, user, newPosition });
        }
      },
      (err) => console.error(err),
      {
        enableHighAccuracy: true,
        // timeout: 10000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-center relative">
      <MapContainer
        id="map"
        center={position}
        zoom={17}
        style={{ height: "70vh", width: "90%" }}
        // zoomControl={false}
        zoomControl={true}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <RealtimeMap position={position} />
        <FitBounds positions={positions} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {positions &&
          positions.map((p, i) => {
            const { latitude, longitude } = p;
            if (
              typeof latitude !== "number" ||
              typeof longitude !== "number" ||
              isNaN(latitude) ||
              isNaN(longitude)
            )
              return null;
            return (
              <div key={i} className="w-full h-full">
                <Marker position={[latitude, longitude]} icon={userIcon}>
                  <Popup>
                    Dernière position de {p.name} :<br />
                    {latitude}, {longitude}
                  </Popup>
                </Marker>
              </div>
            );
          })}
        <button
          onClick={simulateNewPosition}
          style={{ position: "absolute", zIndex: 1000, bottom: 0 }}
        >
          Simuler
        </button>
      </MapContainer>
    </div>
  );
};

export default function Hunting({
  roomId,
  roomToken,
  user,
  gameData,
  setShowNext,
}) {
  const [positions, setPositions] = useState(gameData.positions);
  const isAdmin = user.name === gameData.admin;
  console.log("gameData", gameData);
  console.log("positions", positions);
  return (
    <div className="h-full w-full flex flex-col items-center relative">
      <Map
        user={user}
        roomId={roomId}
        roomToken={roomToken}
        // gameData={gameData}
        positions={positions}
      />
      <div
        onClick={async () => {
          const newPositions = await getPositions({ roomId });
          setPositions(newPositions);
        }}
        className="absolute bottom-10"
      >
        Positions
      </div>
    </div>
  );
}
