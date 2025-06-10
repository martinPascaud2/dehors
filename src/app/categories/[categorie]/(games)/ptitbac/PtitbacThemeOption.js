"use client";

import { useState, useEffect, useCallback } from "react";

import { getAllUndefaultThemes } from "./gameActions";

import Modal from "@/components/Modal";

export default function PtitbacThemeOption({
  isAdmin,
  options,
  setOptions,
  max,
  lastParams,
  setServerMessage,
}) {
  const [themes, setThemes] = useState();
  const [selectedThemes, setSelectedThemes] = useState();
  const [enhancedLength, setEnhancedLength] = useState();
  const [unenhancedLength, setunenhancedLenght] = useState();
  const [random, setRandom] = useState(0);
  const [allRandomLength, setAllRandomLength] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isFetched, setIsFetched] = useState(false);

  const getUnAndEnhancedLength = (themes) => {
    let unenhancedLength = 0;
    let enhancedLength = 0;
    themes.forEach((theme) => {
      if (!theme.enhanced && theme.selected) unenhancedLength++;
      else if (theme.selected) enhancedLength++;
    });
    return { unenhancedLength, enhancedLength };
  };

  useEffect(() => {
    if (!lastParams && isAdmin) return;
    const defaultThemes = [
      { theme: "Animal", selected: true, enhanced: false },
      { theme: "Métier", selected: true, enhanced: false },
      { theme: "Pays/ville", selected: true, enhanced: false },
      { theme: "Prénom", selected: true, enhanced: false },
      { theme: "Sport/loisir", selected: true, enhanced: false },
      { theme: "Végétal", selected: true, enhanced: false },
    ];

    const fetchThemes = async () => {
      const allUndefault = await getAllUndefaultThemes();
      const lastThemes = lastParams?.themes;

      const statusAllThemes = allUndefault.map((theme) => {
        const last = lastThemes?.find((last) => last.theme === theme);
        if (last) return last;
        else return { theme, selected: false, enhanced: false };
      });

      let unselectedDefaults = [];
      let selectedDefaults = [];
      if (!lastThemes) unselectedDefaults = defaultThemes;
      else {
        defaultThemes.forEach((def) => {
          const theme = lastThemes.find((last) => last.theme === def.theme);
          if (theme) selectedDefaults.push({ ...theme });
          else unselectedDefaults.push({ ...def, selected: false });
        });
      }

      const allThemes = [
        ...statusAllThemes,
        ...selectedDefaults,
        ...unselectedDefaults,
      ].sort((a, b) => a.theme.localeCompare(b.theme));

      setThemes(allThemes);

      // tricky condition
      if (isAdmin) {
        const { enhancedLength: enhanced, unenhancedLength: unenhanced } =
          getUnAndEnhancedLength(allThemes);
        setEnhancedLength(enhanced);
        setunenhancedLenght(unenhanced);
      }
      setAllRandomLength(statusAllThemes.length);
      lastParams && lastParams.random && setRandom(lastParams.random);
      !isAdmin && setIsFetched(true);
    };
    fetchThemes();
  }, [lastParams, isAdmin]);

  useEffect(() => {
    if (!themes || !setOptions || !isAdmin) return;
    const newSelected = themes.filter((theme) => theme.selected);
    setSelectedThemes(
      newSelected.sort((a, b) => a.theme.localeCompare(b.theme))
    );
    setOptions((options) => ({
      ...options,
      themes: newSelected,
      allRandomLength,
    }));
    setIsFetched(true);
  }, [themes, allRandomLength, setOptions, isAdmin]);

  const closeModal = () => {
    setShowModal(false);
  };

  const handleCheck = useCallback(
    (theme) => {
      if (!isAdmin) return;

      const themeIndex = themes.findIndex((th) => th.theme === theme.theme);
      const isSelected =
        !themes[themeIndex].selected || !themes[themeIndex].enhanced;
      const isEnhanced =
        themes[themeIndex].selected && !themes[themeIndex].enhanced;

      const newTheme = {
        ...themes[themeIndex],
        selected: isSelected,
        enhanced: isEnhanced,
      };
      const newThemes = [...themes];
      newThemes[themeIndex] = newTheme;
      setThemes(newThemes.sort((a, b) => a.theme.localeCompare(b.theme)));

      const { enhancedLength: enhanced, unenhancedLength: unenhanced } =
        getUnAndEnhancedLength(newThemes);
      setEnhancedLength(enhanced);
      setunenhancedLenght(unenhanced);

      if (isSelected && !isEnhanced)
        setRandom((prevRan) => {
          if (prevRan + 1 + enhanced > max || prevRan === max) return prevRan;
          return prevRan;
        });
      else
        setRandom((prevRan) => {
          if (unenhanced === 0) return 0;
          else if (unenhanced <= prevRan) return unenhanced - 1;
          else return prevRan;
        });

      setServerMessage("");
      setModalMessage("");
    },
    [max, selectedThemes, themes, random, isAdmin, setServerMessage]
  );

  useEffect(() => {
    if (!setOptions || !isAdmin) return;
    setOptions((options) => ({
      ...options,
      random,
    }));
  }, [random, isAdmin, setOptions]);

  useEffect(() => {
    if (isAdmin) return;

    const { enhancedLength: enhanced, unenhancedLength: unenhanced } =
      getUnAndEnhancedLength(options.themes);

    setSelectedThemes(options.themes);
    setRandom(options.random);
    setEnhancedLength(enhanced);
    setunenhancedLenght(unenhanced);
  }, [options, isAdmin]);

  if (!isFetched) return null;

  return (
    <div className="flex flex-col justify-center items-center my-6">
      <button
        onClick={() => setShowModal(true)}
        className="flex justify-center border border-amber-700 bg-amber-100 text-amber-700 w-2/3"
      >
        {enhancedLength + random} catégorie
        {enhancedLength + random >= 2 ? "s" : ""}
      </button>

      <Modal isOpen={showModal} onClose={closeModal} message={modalMessage}>
        <div className="py-2 bg-gray-100">
          <div
            onClick={() => closeModal()}
            className="flex justify-center border border-2 border-b-0 border-gray-950 bg-gray-100 w-full py-1 rounded-t-lg"
          >
            <button className="font-semibold text-gray-950">
              {enhancedLength + random} catégorie
              {enhancedLength + random >= 2 ? "s" : ""}
            </button>
          </div>

          <div className="text-center bg-gray-100">
            <div className="border border-2 border-gray-950 w-full flex flex-col items-center rounded-b-lg">
              <div className="columns-2 gap-2 bg-[#848b98] (gray-450)">
                {themes.map((theme, i) => {
                  const selected = selectedThemes.find(
                    (sel) => sel.theme === theme.theme
                  );

                  const isSelected = !!selected;
                  const isEnhanced = selected?.enhanced;

                  return (
                    <div key={i} className="p-2">
                      <div
                        className={`w-full flex items-center p-0 rounded-full ${
                          !isSelected && "text-gray-100"
                        } ${
                          isEnhanced &&
                          (isAdmin ? "bg-green-700" : "bg-sky-700")
                        }
                      `}
                      >
                        <div
                          className={`w-full flex justify-center p-[3px] ${
                            isSelected &&
                            !isEnhanced &&
                            (isAdmin ? "text-green-600" : "text-sky-600")
                          } ${
                            isEnhanced &&
                            (isAdmin ? "text-green-700" : "text-sky-700")
                          }`}
                        >
                          <div
                            onClick={() => {
                              handleCheck(theme);
                            }}
                            className={`w-full p-1.5 ${
                              isSelected &&
                              `bg-gray-100 ${
                                isAdmin
                                  ? "shadow-[inset_0_0_0_2px_#16a34a] (green 600)"
                                  : "shadow-[inset_0_0_0_2px_#0284c7] (sky 600)"
                              } rounded-full`
                            }`}
                          >
                            {theme.theme}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="font-semibold border-t-2 border-black w-full py-2 relative h-12 text-sm flex items-center bg-gray-100 rounded-b-lg">
                <div className="flex absolute left-2 items-center h-full">
                  Constants : {enhancedLength}
                </div>
                <div className="flex gap-2 absolute right-2 items-center h-full">
                  <div className="text-gray-950">
                    Aléatoires : {random} parmi {unenhancedLength}
                  </div>
                  <button
                    onClick={() => {
                      setRandom((prevRan) => (prevRan !== 0 ? prevRan - 1 : 0));
                      setModalMessage("");
                      setServerMessage("");
                    }}
                    className={`border border-gray-950 bg-blue-100 w-6 ${
                      !isAdmin ? "hidden" : ""
                    }`}
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      if (random + enhancedLength === max)
                        setModalMessage("Nombre maximal de catégories atteint");
                      else {
                        setRandom((prevRan) =>
                          prevRan + 2 > unenhancedLength ? prevRan : prevRan + 1
                        );
                        setModalMessage("");
                        setServerMessage("");
                      }
                    }}
                    className={`border border-gray-950 bg-blue-100 w-6 ${
                      !isAdmin ? "hidden" : ""
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center h-0">{modalMessage}</div>
        </div>
      </Modal>
    </div>
  );
}
