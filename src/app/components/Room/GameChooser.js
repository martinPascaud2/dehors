"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

import { categories, subCategories, gamesRefs } from "@/assets/globals";

export default function GameChooser({
  adminSelectedCategorie,
  setAdminSelectedCategorie,
  adminSearchtCategorie,
  adminSelectedGame,
  setAdminSelectedGame,
  adminSearchtGame,
  setAdminSearchtGame,
  adminSelectedMode,
  setAdminSelectedMode,
  initialHeight,
}) {
  const currCat = categories.filter((categorie) => categorie.name !== "APPLI");
  const memoHeight = useMemo(() => {
    return initialHeight;
  }, []);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (loadedCount === currCat.length) {
      setIsLoaded(true);
    }
  }, [loadedCount, currCat.length]);

  const handleImageLoad = () => {
    setLoadedCount((prev) => prev + 1);
  };

  if (!adminSearchtCategorie)
    return (
      <>
        <div
          className="overflow-hidden relative h-full w-[80%] flex flex-col justify-around items-center p-2"
          style={{
            animation: "expand 0.8s ease-in-out",
          }}
        />
        <style jsx>{`
          @keyframes expand {
            0% {
              height: ${memoHeight};
            }
            100% {
              height: 100%;
            }
          }
        `}</style>

        <div
          className={`${
            !isLoaded && "hidden"
          } overflow-hidden absolute top-12 h-full w-[80%] flex flex-col justify-around items-center p-2`}
          style={{ height: "calc(100% - 3rem)" }}
        >
          {currCat.map((categorie, index) => {
            return (
              <div
                key={index}
                onClick={() => setAdminSelectedCategorie(categorie.subCats)}
                className={`absolute ${
                  adminSelectedCategorie
                    ? adminSelectedCategorie !== categorie.subCats
                      ? "opacity-50"
                      : "scale-110"
                    : ""
                }`}
                style={{
                  top: `${Math.floor(index / 2) * 33 + 5}%`,
                  left: index % 2 === 0 && "8%",
                  right: index % 2 === 1 && "8%",
                  width: "33.333333%",
                  aspectRatio: "1 / 1",
                }}
              >
                <Image
                  src={categorie.src}
                  alt={`${categorie.name} image`}
                  className="max-h-full aspect-square"
                  style={{ objectFit: "contain" }}
                  width={500}
                  height={500}
                  onLoadingComplete={handleImageLoad}
                  priority
                />
              </div>
            );
          })}
        </div>
      </>
    );
  else if (!adminSearchtGame)
    return (
      <div className="overflow-hidden relative h-full w-[80%] flex flex-col justify-around items-center p-2">
        {subCategories[adminSearchtCategorie].map((subCat, i) => (
          <div
            key={i}
            onClick={() => {
              setAdminSelectedGame(subCat);
              setAdminSearchtGame(subCat);
            }}
            className={`p-4 text-2xl whitespace-nowrap overflow-hidden text-ellipsis ${
              adminSelectedGame?.name === subCat?.name &&
              "outline outline-2 font-semibold"
            }`}
          >
            {subCat.name}
          </div>
        ))}
      </div>
    );
  else {
    return (
      <div className="overflow-hidden relative h-full w-[80%] flex flex-col justify-around items-center p-2">
        {gamesRefs[adminSearchtGame.path].modes.map((ref, i) => (
          <div
            key={i}
            onClick={() => setAdminSelectedMode(ref)}
            className={`p-4 text-2xl whitespace-nowrap overflow-hidden text-ellipsis ${
              adminSelectedMode?.path === ref.path &&
              "outline outline-2 outline-dotted font-semibold"
            }`}
          >
            {ref.label}
          </div>
        ))}
      </div>
    );
  }
}
