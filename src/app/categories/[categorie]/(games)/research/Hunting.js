"use client";

import { useState, useEffect } from "react";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./hunting.css";

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
});

import { sendPosition } from "./gameActions";

const RealtimeMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position]);
  return null;
};

const Map = ({ user, roomId, roomToken, gameData }) => {
  const { positions } = gameData;

  const [position, setPosition] = useState([48.8566, 2.3522]);

  // dev
  const simulateNewPosition = async () => {
    const newPosition = [position[0] + 0.0001, position[1] + 0.0001];
    // setPosition(([lat, lng]) => [lat + 0.0001, lng + 0.0001]);
    setPosition(newPosition);
    await sendPosition({ roomId, roomToken, user, newPosition });
  };

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);

        const newPosition = coords;
        sendPosition({ roomId, roomToken, user, newPosition });
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

        {positions.map((p, i) => {
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
                  Position actuelle de {p.name} :<br />
                  {latitude}, {longitude}
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>

      <button
        onClick={simulateNewPosition}
        style={{ position: "absolute", zIndex: 1000, bottom: 0 }}
      >
        Simuler
      </button>
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
  console.log("gameData", gameData);
  return (
    <div className="h-full w-full flex justify-center items-center">
      <Map
        user={user}
        roomId={roomId}
        roomToken={roomToken}
        gameData={gameData}
      />
    </div>
  );
}
