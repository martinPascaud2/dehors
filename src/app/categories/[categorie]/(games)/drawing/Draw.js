"use client";

import { useEffect, useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";

import NextStep from "@/components/NextStep";

export default function Draw({
  setImgData,
  setSvg,
  setPath,
  setHasValidated,
  finishCountdownDate,
}) {
  const canvasRef = useRef(null);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const colorsRef = useRef(null);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [eraseMode, setEraseMode] = useState(false);

  const handleStrokeWidthChange = (event) => {
    setStrokeWidth(event.target.value);
  };

  const handleStrokeColorChange = (event) => {
    setStrokeColor(event.target.value);
  };

  useEffect(() => {
    canvasRef.current?.eraseMode(eraseMode);
  }, [eraseMode]);

  const handleExportImage = () => {
    if (canvasRef.current) {
      canvasRef.current
        .exportImage("png")
        .then((data) => {
          setImgData(data);
        })
        .catch((e) => {
          console.error("Drawing export error:", e);
        });
    }
  };

  const getIsIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };
  const isIos = getIsIos();

  useEffect(() => {
    const timeout = finishCountdownDate - Date.now();
    const set = setTimeout(() => {
      handleExportImage();
      setHasValidated(true);
    }, timeout);
    return () => clearTimeout(set);
  }, [finishCountdownDate]);

  return (
    <>
      <div className="flex justify-center w-full">
        <ReactSketchCanvas
          ref={canvasRef}
          style={{
            border: "0.0625rem solid #9c9c9c",
            borderRadius: "0.25rem",
            width: "90%",
            height: "50vh",
          }}
          strokeWidth={strokeWidth}
          eraserWidth={strokeWidth}
          strokeColor={strokeColor}
        />
      </div>

      <div className="flex flex-col items-center">
        <label htmlFor="strokeWidth" className="form-label">
          Epaisseur du trait
        </label>
        <input
          type="range"
          min="3"
          max="11"
          step="2"
          id="strokeWidth"
          value={strokeWidth}
          onChange={(e) => handleStrokeWidthChange(e)}
          className="w-3/4"
        />

        <div className="flex justify-center gap-2 mt-1">
          <button
            type="button"
            className={`border ${
              !eraseMode ? "border-2 border-blue-500" : "border border-blue-300"
            } bg-blue-100`}
            onClick={() => setEraseMode(false)}
          >
            Pinceau
          </button>
          <button
            type="button"
            className={`border ${
              eraseMode ? "border-2 border-blue-500" : "border border-blue-300"
            } bg-blue-100`}
            onClick={() => setEraseMode(true)}
          >
            Gomme
          </button>
        </div>

        <div className="flex flex-col items-center m-2">
          <button
            onClick={() => colorsRef.current.click()}
            className="font-semibold"
            style={{ color: strokeColor }}
          >
            Couleur
          </button>
          <input
            id="color"
            ref={colorsRef}
            type="color"
            value={strokeColor}
            onChange={(e) => handleStrokeColorChange(e)}
            className={`${!isIos && "hidden"}`}
          />
        </div>

        <div className="flex gap-2 w-16">
          <button
            onClick={() => canvasRef.current.undo()}
            className="border border-blue-300 bg-blue-100"
          >
            <ArrowUturnLeftIcon className="w-full h-full" />
          </button>
          <button
            onClick={() => canvasRef.current.redo()}
            className="border border-blue-300 bg-blue-100"
          >
            <ArrowUturnRightIcon className="w-full h-full" />
          </button>
        </div>

        <button
          onClick={() => canvasRef.current.clearCanvas()}
          className="border border-blue-300 bg-blue-100 mt-2"
        >
          Tout effacer
        </button>
      </div>

      {/* <button onClick={async () => setSvg(await canvasRef.current.exportSvg())}>
        Envoyer svg
      </button>

      <button
        onClick={async () => setPath(await canvasRef.current.exportPaths())}
      >
        Envoi paths
      </button> */}

      <NextStep
        onClick={() => {
          handleExportImage();
          setHasValidated(true);
        }}
      >
        Envoi
      </NextStep>
    </>
  );
}
