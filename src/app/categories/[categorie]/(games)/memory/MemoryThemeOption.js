"use client";

import { useState, useEffect, useCallback } from "react";
import compareState from "@/utils/compareState";

import Modal from "@/components/Modal";

export default function MemoryThemeOption({
  isAdmin,
  setOptions,
  selectedThemes,
  setSelectedThemes,
  max,
  setServerMessage,
  lastParams,
}) {
  const [themes, setThemes] = useState([
    { theme: "ObjectBall", label: "Ballons", selected: true, enhanced: false },
    { theme: "AnimalDog", label: "Chiens", selected: true, enhanced: false },
    {
      theme: "ObjectAll",
      label: "Objets divers",
      selected: true,
      enhanced: false,
    },
  ]);
  const [showModal, setShowModal] = useState(false);

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (!lastParams || !isAdmin) return;

    setThemes((prevThemes) => {
      const lastThemes = lastParams.themes;
      const newThemes = prevThemes.map((prevTheme) => {
        const lastTheme = lastThemes?.find(
          (lastTheme) => lastTheme.theme === prevTheme.theme
        );
        if (lastTheme) return lastTheme;
        else return { ...prevTheme, selected: false };
      });
      return compareState(prevThemes, newThemes);
    });
  }, [lastParams, isAdmin]);

  useEffect(() => {
    if (!themes || !setOptions || !isAdmin) return;

    const newSelected = themes.filter((theme) => theme.selected);
    setSelectedThemes((prevSelectedThemes) => {
      const newSelectedThemes = newSelected.sort((a, b) =>
        a.label.localeCompare(b.label)
      );
      return compareState(prevSelectedThemes, newSelectedThemes);
    });

    setOptions((prevOptions) => {
      const newOptions = {
        ...prevOptions,
        themes: newSelected,
      };
      return compareState(prevOptions, newOptions);
    });
  }, [themes, setOptions, isAdmin, setSelectedThemes]);

  const handleCheck = useCallback(
    (theme) => {
      if (!isAdmin) return;

      const themeIndex = themes.findIndex((th) => th.theme === theme.theme);
      const newTheme = {
        ...themes[themeIndex],
        selected: !themes[themeIndex].selected || !themes[themeIndex].enhanced,
        enhanced: themes[themeIndex].selected && !themes[themeIndex].enhanced,
      };
      const newThemes = [...themes];

      newThemes[themeIndex] = newTheme;
      setThemes(newThemes.sort((a, b) => a.label.localeCompare(b.label)));

      setServerMessage("");
    },
    [setServerMessage, themes, isAdmin]
  );

  return (
    <div className="flex flex-col justify-center items-center my-6">
      <button
        onClick={() => setShowModal(true)}
        className="flex justify-center border border-amber-700 bg-amber-100 w-4/5"
      >
        <div className="text-amber-700">
          {selectedThemes?.length} catégorie
          {selectedThemes?.length >= 2 ? "s" : ""}
        </div>
      </button>

      <Modal isOpen={showModal} onClose={closeModal} message="">
        <div
          onClick={() => closeModal()}
          className="flex justify-center border border-2 border-b-0 border-gray-950 bg-gray-100 w-full py-1"
        >
          <button className="font-semibold text-gray-950">
            {selectedThemes?.length} catégorie
            {selectedThemes?.length >= 2 ? "s" : ""}
          </button>
        </div>

        <div className="border border-2 border-gray-950 w-full flex justify-center items-center p-2 bg-[#848b98] (gray 450)">
          {themes &&
            themes.map((theme, i) => {
              const selected =
                (isAdmin &&
                  selectedThemes.find((sel) => sel.theme === theme.theme)) ||
                (!isAdmin &&
                  selectedThemes.find((sel) => sel.theme === theme.theme));
              const isSelected = !!selected;
              const isEnhanced = selected?.enhanced;

              return (
                <div
                  key={i}
                  className={`m-1 p-[2px] flex justify-center ${
                    isEnhanced &&
                    (isAdmin
                      ? "shadow-[inset_0_0_0_2px_#15803d] (green 700) bg-green-700"
                      : "shadow-[inset_0_0_0_2px_#0369a1] (sky 700) bg-sky-700")
                  }`}
                >
                  <div
                    onClick={() => handleCheck(theme)}
                    className={`w-full flex text-center p-[2px] ${
                      isSelected && "bg-gray-100"
                    }
                    ${
                      isSelected &&
                      (isAdmin
                        ? "shadow-[inset_0_0_0_2px_#16a34a] (green 600)"
                        : "shadow-[inset_0_0_0_2px_#0284c7] (sky 600)")
                    }`}
                  >
                    <div
                      className={`w-full py-1 px-2 ${
                        !isSelected && "text-gray-100"
                      } ${
                        isSelected &&
                        !isEnhanced &&
                        (isAdmin ? "text-green-600" : "text-sky-600")
                      } ${
                        isEnhanced &&
                        (isAdmin ? "text-green-700" : "text-sky-700")
                      }`}
                    >
                      {theme.label}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Modal>
    </div>
  );
}
