"use client";
// check: unused

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCallback, useState } from "react";

import { subCategories } from "@/assets/globals.js";

import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const useSwipe = (activeIndex, updateIndex) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(false);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      updateIndex(activeIndex + 1);
    }
    if (isRightSwipe) {
      updateIndex(activeIndex - 1);
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd, isSwiping };
};

export default function OneCategoriePage({ params }) {
  const { categorie } = params;
  const searchParams = useSearchParams();
  const isGroup = searchParams.get("group") === "true";

  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const games = subCategories[categorie];
  const [showDescription, setShowDescription] = useState(false);

  const updateIndex = useCallback(
    (newIndex) => {
      if (newIndex < 0) {
        newIndex = games.length - 1;
      } else if (newIndex === games.length) {
        newIndex = 0;
      }
      setActiveIndex(newIndex);
    },
    [games?.length]
  );

  const { onTouchStart, onTouchMove, onTouchEnd, isSwiping } = useSwipe(
    activeIndex,
    updateIndex
  );

  const divNavs = [];
  for (let i = 0; i < games?.length; i++) {
    divNavs.push(
      <div
        key={i}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setActiveIndex(i);
        }}
        className={`w-8 h-4 ${
          i === activeIndex ? "bg-yellow-700" : "bg-yellow-300"
        }`}
      />
    );
  }

  return (
    <>
      <main
        onClick={() =>
          router.push(!isGroup ? "/categories" : "/categories?group=true")
        }
        className="relative bg-slate-300"
      >
        <div className="z-10 p-5 absolute top-[10%]">
          <div className="w-full overflow-hidden mx-auto">
            <div
              className={"inner whitespace-nowrap duration-300"}
              style={{
                transform: `translateX(-${activeIndex * 100}%) translateZ(0)`,
              }}
            >
              {games?.map((game) => (
                <div key={game.name} className="inline-flex">
                  <Image
                    alt={`Image du jeu ${game.name}`}
                    src={game.img}
                    width={1800}
                    height={1125}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onClick={(e) => {
                      if (isSwiping) {
                        e.stopPropagation();
                        e.preventDefault();
                      } else {
                        e.stopPropagation();
                        router.push(`/categories/${categorie}/${game.path}`);
                      }
                    }}
                    priority
                  />
                </div>
              ))}
            </div>
          </div>
          <div>{games && games[activeIndex]?.name}</div>
          <div className="flex justify-between">{divNavs}</div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDescription(!showDescription);
            }}
            className="z-10 border border-blue-300 bg-blue-100 mt-2"
          >
            Description du jeu{" "}
            <span className="inline-flex align-middle">
              {showDescription ? (
                <ChevronDownIcon className="h-4 w-4 stroke-2	" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 stroke-2	" />
              )}
            </span>
          </button>
          {showDescription && <div>{games[activeIndex].description}</div>}
        </div>
      </main>
    </>
  );
}
