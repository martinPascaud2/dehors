"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useUserContext } from "../Room/Room";

import { FiDelete } from "react-icons/fi";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

const frenchLayout = [
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
  ["W", "X", "C", "Empty", "Empty", "Empty", "Empty", "V", "B", "N"],
  ["Delete", "UpDown", "Space"],
];

const englishLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
  ["Z", "X", "C", "Empty", "Empty", "Empty", "Empty", "V", "B", "N"],
  ["Delete", "UpDown", "Space"],
];

export default function TriactionKeyboard({
  setInput,
  onClose,
  onValidate,
  select,
}) {
  const contextValue = useUserContext();
  const { userParams } = contextValue;
  const bottomBarSize = userParams?.bottomBarSize || 8;
  const keyboard = userParams?.keyboard;
  const language = keyboard?.language || "AZERTY";
  let layoutLanguage;
  switch (language) {
    case "QWERTY":
      layoutLanguage = englishLayout;
      break;
    default:
      layoutLanguage = frenchLayout;
  }

  const [mounted, setMounted] = useState(false);
  const keyboardRef = useRef();

  const handleKeyClick = async (key) => {
    if (key.startsWith("Empty")) {
      return;
    } else if (key === "Space") {
      setInput((prev) => (prev || "") + " ");
    } else if (key === "Delete") {
      setInput((prev) => (prev || "").slice(0, -1));
    } else if (key === "Enter") {
      await onValidate();
      onValidate();
    } else {
      setInput((prev) => (prev || "") + key);
    }
  };

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event) => {
      if (keyboardRef.current && !keyboardRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchend", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="absolute w-screen h-screen"
      style={{
        bottom: 0,
      }}
      ref={keyboardRef}
    >
      <div className="relative w-full h-full">
        <div
          className="absolute p-2 w-full"
          style={{
            zIndex: 90,
            bottom: `${bottomBarSize / 4}rem`,
          }}
        >
          <div className="space-y-1 w-full">
            {/* <div className="w-full flex justify-center gap-1">
              <div
                onClick={() => select.onUp()}
                className="bg-gray-100 border border-gray-700 text-gray-700 py-1 px-2 rounded-xl w-12 h-12 flex justify-center items-center"
              >
                <FaChevronUp className="w-4/5 h-4/5" />
              </div>
              <div className="bg-gray-100 border border-gray-700 text-gray-700 py-1 px-2 rounded-xl w-12 h-12 flex justify-center items-center">
                <FaChevronDown
                  onClick={() => select.onDown()}
                  className="w-4/5 h-4/5"
                />
              </div>
            </div> */}

            {layoutLanguage.map((row, i) => {
              if (i !== 3) {
                return (
                  <div key={i} className="flex w-full space-x-1">
                    {row.map((key, j) => {
                      const isEmpty = key.startsWith("Empty");

                      return (
                        <div
                          key={j}
                          onPointerDown={async (e) => {
                            e.stopPropagation();
                            await handleKeyClick(key);
                          }}
                          className={`bg-gray-100 border border-gray-700 text-gray-700 font-semibold py-1 px-2 rounded-xl transition relative h-8 ${
                            isEmpty ? "collapse " : ""
                          }`}
                          style={{
                            touchAction: "manipulation",
                            width: `10%`,
                          }}
                        >
                          <div className="opacity-0">X</div>
                          <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
                            {key}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              } else {
                return (
                  <div key={i} className="flex w-full space-x-1 relative">
                    {row.map((key) => {
                      const width =
                        key === "Delete" || key === "Space" ? "30%" : "40%";

                      let layout;
                      switch (key) {
                        case "Space":
                          layout = (
                            <div
                              key={key}
                              className={`w-[${width}] h-8 flex justify-center items-center`}
                            >
                              <div
                                className={`bg-gray-100 border border-gray-700 text-gray-700 font-semibold py-1 px-2 rounded-xl transition relative w-2/3 h-full flex justify-center items-center`}
                                onPointerDown={async (e) => {
                                  e.stopPropagation();
                                  await handleKeyClick(key);
                                }}
                              ></div>
                            </div>
                          );
                          break;
                        // case "Enter":
                        //   layout = (
                        //     <div
                        //       key={key}
                        //       className={`w-[${width}] h-6 relative flex justify-center items-center translate-y-[-50%]`}
                        //     >
                        //       <div
                        //         className={`relative w-2/5 aspect-square flex justify-center items-center`}
                        //         onPointerDown={async (e) => {
                        //           e.stopPropagation();
                        //           await handleKeyClick(key);
                        //         }}
                        //       >
                        //         <div
                        //           className="absolute -inset-[1px]"
                        //           style={{
                        //             clipPath:
                        //               "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        //             backgroundColor: "#374151", // gray-700
                        //             zIndex: 0,
                        //           }}
                        //         />

                        //         <div
                        //           className="w-full h-full flex justify-center items-center"
                        //           style={{
                        //             clipPath:
                        //               "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        //             backgroundColor: "#f3f4f6", // gray-100
                        //             color: "#374151", // gray-700
                        //             zIndex: 1,
                        //           }}
                        //         >
                        //           <FaCheck className="w-6 h-6" />
                        //         </div>
                        //       </div>
                        //     </div>
                        //   );
                        //   break;
                        case "UpDown":
                          layout = (
                            <div key={key} className={`w-[${width}] h-6`}>
                              <div className="absolute mb-4 h-8 w-full flex justify-center gap-1 bottom-0 left-0 translate-x-[–50%]">
                                <div
                                  onClick={() => select.onUp()}
                                  className="bg-gray-100 border border-gray-700 text-gray-700 py-1 px-2 rounded-xl w-12 h-12 flex justify-center items-center"
                                >
                                  <FaChevronUp className="w-4/5 h-4/5" />
                                </div>
                                <div className="bg-gray-100 border border-gray-700 text-gray-700 py-1 px-2 rounded-xl w-12 h-12 flex justify-center items-center">
                                  <FaChevronDown
                                    onClick={() => select.onDown()}
                                    className="w-4/5 h-4/5"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                          break;
                        case "Delete":
                          layout = (
                            <div
                              key={key}
                              className={`w-[${width}] h-8 flex justify-center items-center`}
                            >
                              <div
                                className={`bg-gray-100 border border-gray-700 text-gray-700 font-semibold py-1 px-2 rounded-xl transition relative w-2/3 h-full flex justify-center items-center`}
                                onPointerDown={async (e) => {
                                  e.stopPropagation();
                                  await handleKeyClick(key);
                                }}
                              >
                                <FiDelete className="w-6 h-6" />
                              </div>
                            </div>
                          );
                          break;
                        default:
                          break;
                      }

                      return layout;
                    })}
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
