"use client";

import Image from "next/image";

import classNames from "classnames";
import { useEffect, useState } from "react";

export default function Card({
  index,
  src,
  triggered,
  discovered,
  isActive,
  reveal,
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (isActive) return;
    if (triggered === undefined || discovered === undefined) return;
    if (!triggered) {
      setIsRevealed(false);
    }
  }, [triggered, discovered, isActive]);

  useEffect(() => {
    const reSync = async () => {
      if (isActive && isRevealed && !triggered && !discovered) {
        await reveal({ index });
      }
    };
    reSync();
  }, [index, isActive, isRevealed, reveal, triggered, discovered]);

  if (!src) return;

  return (
    <div className="bg-transparent w-[24%] aspect-square inline-block m-[0.5%] perspective-10">
      <div
        onClick={async () => {
          if (triggered || discovered || !isActive) return;
          setIsRevealed(true);
          reveal && reveal({ index });
        }}
        className={classNames(
          "flip-card relative w-full h-full rounded-2xl	border-2",
          `transition-transform duration-500 transform-style-3d ${
            isRevealed || triggered || discovered ? "rotate-y-[-180deg]" : ""
          }`
        )}
      >
        <div
          className={`card-front absolute w-full h-full rounded-2xl backface-hidden rotate-y-[180deg]`}
        >
          <Image src={src} alt="Memory icon" priority={true} />
        </div>
        <div className="card-back absolute w-full h-full rounded-2xl backface-hidden bg-red-500"></div>
      </div>
    </div>
  );
}
