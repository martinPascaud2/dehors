"use client";

import { useState, useEffect } from "react";

import "./room.css";

export default function LoadingRoomOctagon({
  setHasLoadingOctagonAnimated,
  isJoinStarted,
}) {
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    setTimeout(() => setStartAnimation(true), 10);
  }, []);

  return (
    <div
      className={`relative octagon top-1/2 translate-y-[-50%] left-1/2 translate-x-[-50%] ${
        !isJoinStarted ? "" : "animate-[joinAgainShrink_3s_ease-in-out]"
      }`}
    >
      <div className="absolute w-[26.3vw] h-[36vw] -skew-y-[45deg] translate-y-[-22.7vw] translate-x-[-1px] left-0 z-0 bg-black" />
      <div className="absolute w-[26.3vw] h-[36vw] skew-y-[45deg] translate-y-[-22.7vw] translate-x-[1px] right-0 z-0 bg-black" />
      <div className="absolute w-[26.3vw] h-[36vw] skew-y-[45deg] translate-y-[25.7vw] translate-x-[-1px] left-0 bottom-0 z-0 bg-black" />
      <div className="absolute w-[26.3vw] h-[36vw] -skew-y-[45deg] translate-y-[25.7vw] translate-x-[1px] right-0 bottom-0 z-0 bg-black" />

      <div
        className={`${
          startAnimation
            ? "opacity-0 animate-[fadeOut_1.5s_ease-in-out]"
            : "opacity-100"
        }`}
        onAnimationEnd={() =>
          setHasLoadingOctagonAnimated && setHasLoadingOctagonAnimated(true)
        }
      >
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
      </div>

      <div className="absolute top-1/2 translate-y-[-50%] bg-transparent w-[90vw] h-[90vw] z-10 flex items-center">
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
    </div>
  );
}
