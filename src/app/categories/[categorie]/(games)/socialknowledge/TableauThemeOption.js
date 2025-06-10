"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";

import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";

import Modal from "@/components/Modal";
import { InputModal } from "@/components/Modal";

// export default function TableauThemeOption({
//   isAdmin,
//   options,
//   setOptions,
//   max,
//   lastParams,
//   setServerMessage,
// }) {
//   const defaultThemes = useMemo(
//     () => [
//       { theme: "Célébrité artistique", selected: false, enhanced: false },
//       { theme: "Célébrité sportive", selected: false, enhanced: false },
//       { theme: "Etudes", selected: false, enhanced: false },
//       { theme: "Film", selected: false, enhanced: false },
//       { theme: "Hobby 1", selected: false, enhanced: false },
//       { theme: "Hobby 2", selected: false, enhanced: false },
//       { theme: "Jeu de société", selected: false, enhanced: false },
//       { theme: "Langue parlée", selected: false, enhanced: false },
//       { theme: "Livre/manga", selected: false, enhanced: false },
//       { theme: "Marque", selected: false, enhanced: false },
//       { theme: "Métier", selected: false, enhanced: false },
//       { theme: "Nourriture", selected: false, enhanced: false },
//       { theme: "Parfum de glace", selected: false, enhanced: false },
//       { theme: "Pays d'origine", selected: false, enhanced: false },
//       { theme: "Série", selected: false, enhanced: false },
//       { theme: "Signe astrologique", selected: false, enhanced: false },
//       { theme: "Sport pratiqué", selected: false, enhanced: false },
//       { theme: "Ville de naissance", selected: false, enhanced: false },
//     ],
//     []
//   );

//   const [themes, setThemes] = useState(
//     options.themes || lastParams?.themes || defaultThemes
//   );
//   const [enhancedLength, setEnhancedLength] = useState();
//   const [unenhancedLength, setUnenhancedLength] = useState();
//   const [randoms, setRandoms] = useState(lastParams?.randoms || 0);

//   const [showModal, setShowModal] = useState(false);
//   const [modalMessage, setModalMessage] = useState("");

//   const getUnAndEnhancedLength = (themes) => {
//     let unenhancedLength = 0;
//     let enhancedLength = 0;
//     themes?.forEach((theme) => {
//       if (!theme.enhanced && theme.selected) unenhancedLength++;
//       else if (theme.selected) enhancedLength++;
//     });
//     return { unenhancedLength, enhancedLength };
//   };

//   useEffect(() => {
//     const { enhancedLength: enhanced, unenhancedLength: unenhanced } =
//       getUnAndEnhancedLength(themes);
//     setEnhancedLength(enhanced);
//     setUnenhancedLength(unenhanced);
//   }, [themes]);

//   useEffect(() => {
//     if (!themes || !setOptions || !isAdmin) return;
//     setOptions((prevOptions) => ({ ...prevOptions, themes, randoms }));
//   }, [themes, setOptions, isAdmin, randoms]);

//   useEffect(() => {
//     if (isAdmin) return;
//     if (!options.themes) {
//       setThemes(defaultThemes);
//       return;
//     }
//     setThemes(options.themes);
//     setRandoms(options.randoms);
//   }, [options, isAdmin]);

//   const closeModal = () => {
//     setShowModal(false);
//   };

//   const handleCheck = useCallback(
//     (theme) => {
//       if (!isAdmin) return;

//       const themeIndex = themes.findIndex((th) => th.theme === theme.theme);
//       let isSelected =
//         !themes[themeIndex].selected || !themes[themeIndex].enhanced;
//       let isEnhanced =
//         themes[themeIndex].selected && !themes[themeIndex].enhanced;
//       let lowerRandoms = false;
//       if (isEnhanced && enhancedLength + randoms >= max) {
//         if (randoms === 0) {
//           isSelected = false;
//           isEnhanced = false;
//         } else {
//           lowerRandoms = true;
//         }
//       }

//       const newTheme = {
//         ...themes[themeIndex],
//         selected: isSelected,
//         enhanced: isEnhanced,
//       };
//       const newThemes = [...themes];
//       newThemes[themeIndex] = newTheme;
//       setThemes(newThemes);

//       const { enhancedLength: enhanced, unenhancedLength: unenhanced } =
//         getUnAndEnhancedLength(newThemes);
//       setEnhancedLength(enhanced);
//       setUnenhancedLength(unenhanced);

//       if (isSelected && !isEnhanced)
//         setRandoms((prevRan) => {
//           if (prevRan + 1 + enhanced > max || prevRan + 1 === unenhanced)
//             return prevRan;
//           return prevRan + 1;
//         });
//       else
//         setRandoms((prevRan) => {
//           if (unenhanced === 0) return 0;
//           else if (unenhanced <= prevRan) return unenhanced - 1;
//           else if (lowerRandoms) return prevRan - 1;
//           else return prevRan;
//         });

//       setServerMessage("");
//       setModalMessage("");
//     },
//     [max, themes, randoms, isAdmin, setServerMessage]
//   );

//   useEffect(() => {
//     if (
//       Number.isNaN(max) ||
//       Number.isNaN(enhancedLength) ||
//       Number.isNaN(randoms) ||
//       !isAdmin
//     )
//       return;
//     const categoriesNumber = enhancedLength + randoms;
//     if (categoriesNumber > max) {
//       if (randoms) {
//         setRandoms((prevRandoms) => prevRandoms - 1);
//       } else {
//         setThemes((prevThemes) => {
//           const newThemes = [...prevThemes];
//           const firstEnhancedIndex = newThemes.findIndex(
//             (theme) => theme.enhanced
//           );
//           const newEnhanced = {
//             ...newThemes[firstEnhancedIndex],
//             enhanced: false,
//           };
//           newThemes[firstEnhancedIndex] = newEnhanced;
//           return newThemes;
//         });
//       }
//     }
//   }, [max, enhancedLength, randoms, isAdmin]);

//   return (
//     <div className="flex flex-col justify-center items-center my-4">
//       <button
//         onClick={() => setShowModal(true)}
//         className="flex justify-center border border-amber-700 bg-amber-100 text-amber-700 w-2/3"
//       >
//         {enhancedLength + randoms} catégorie
//         {enhancedLength + randoms >= 2 ? "s" : ""}
//       </button>

//       <Modal isOpen={showModal} onClose={closeModal} message={modalMessage}>
//         <div className="py-2 bg-gray-100">
//           <div
//             onClick={() => closeModal()}
//             className="flex justify-center border border-2 border-b-0 border-gray-950 bg-gray-100 w-full py-1 rounded-t-lg"
//           >
//             <button className="font-semibold text-gray-950">
//               {enhancedLength + randoms} catégorie
//               {enhancedLength + randoms >= 2 ? "s" : ""}
//             </button>
//           </div>

//           <div className="text-center bg-gray-100">
//             <div className="border border-2 border-gray-950 w-full flex flex-col items-center rounded-b-lg">
//               <div className="columns-2 gap-2 bg-[#848b98] (gray-450)">
//                 {themes?.map((theme, i) => {
//                   const isSelected = theme.selected;
//                   const isEnhanced = theme.enhanced;

//                   return (
//                     <div key={i} className="p-2">
//                       <div
//                         className={`w-full flex items-center p-0 rounded-full ${
//                           !isSelected && "text-gray-100"
//                         } ${
//                           isEnhanced && "bg-green-700 text-gray-950 bg-gray-100"
//                         }
//                       `}
//                       >
//                         <div
//                           className={`w-full flex justify-center p-[3px] ${
//                             isSelected && !isEnhanced && "text-green-600"
//                           } ${isEnhanced && "text-green-700"}`}
//                         >
//                           <div
//                             onClick={() => {
//                               handleCheck(theme);
//                             }}
//                             className={`w-full p-1.5 ${
//                               isSelected &&
//                               "bg-gray-100 shadow-[inset_0_0_0_2px_#16a34a] (green 600) rounded-full"
//                             }`}
//                           >
//                             {theme.theme}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="font-semibold border-t-2 border-black w-full py-2 relative h-12 text-sm flex items-center bg-gray-100 rounded-b-lg">
//                 <div className="flex absolute left-2 items-center h-full">
//                   Constants : {enhancedLength}
//                 </div>
//                 <div className="flex gap-2 absolute right-2 items-center h-full">
//                   <div className="text-gray-950">
//                     Aléatoires : {randoms} parmi {unenhancedLength}
//                   </div>
//                   <button
//                     onClick={() => {
//                       setRandoms((prevRan) =>
//                         prevRan !== 0 ? prevRan - 1 : 0
//                       );
//                       setModalMessage("");
//                       setServerMessage("");
//                     }}
//                     className={`border border-gray-950 bg-blue-100 w-6 ${
//                       !isAdmin ? "hidden" : ""
//                     }`}
//                   >
//                     -
//                   </button>
//                   <button
//                     onClick={() => {
//                       if (randoms + enhancedLength === max)
//                         setModalMessage("Nombre maximal de catégories atteint");
//                       else {
//                         setRandoms((prevRan) =>
//                           prevRan + 2 > unenhancedLength ? prevRan : prevRan + 1
//                         );
//                         setModalMessage("");
//                         setServerMessage("");
//                       }
//                     }}
//                     className={`border border-gray-950 bg-blue-100 w-6 ${
//                       !isAdmin ? "hidden" : ""
//                     }`}
//                   >
//                     +
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }

export default function TableauThemeOption({
  isAdmin,
  options,
  setOptions,
  max,
  lastParams,
  serverMessage,
  setServerMessage,
}) {
  const defaultThemes = useMemo(
    () => [
      { theme: "Célébrité artistique", selected: false, enhanced: false },
      { theme: "Célébrité sportive", selected: false, enhanced: false },
      { theme: "Etudes", selected: false, enhanced: false },
      { theme: "Film", selected: false, enhanced: false },
      { theme: "Hobby 1", selected: false, enhanced: false },
      { theme: "Hobby 2", selected: false, enhanced: false },
      { theme: "Jeu de société", selected: false, enhanced: false },
      { theme: "Langue parlée", selected: false, enhanced: false },
      { theme: "Livre/manga", selected: false, enhanced: false },
      { theme: "Marque", selected: false, enhanced: false },
      { theme: "Métier", selected: false, enhanced: false },
      { theme: "Nourriture", selected: false, enhanced: false },
      { theme: "Parfum de glace", selected: false, enhanced: false },
      { theme: "Pays d'origine", selected: false, enhanced: false },
      { theme: "Série", selected: false, enhanced: false },
      { theme: "Signe astrologique", selected: false, enhanced: false },
      { theme: "Sport pratiqué", selected: false, enhanced: false },
      { theme: "Ville de naissance", selected: false, enhanced: false },
    ],
    []
  );

  const [themes, setThemes] = useState(
    options.themes || lastParams?.themes || defaultThemes
  );
  const selected = themes.filter((theme) => theme.selected).length;

  const [customs, setCustoms] = useState(lastParams?.customs || 0);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isDeletingCustom, setIsDeletingCustom] = useState(false);

  useEffect(() => {
    if (!themes || !setOptions || !isAdmin) return;
    setOptions((prevOptions) => ({ ...prevOptions, themes }));
  }, [themes, setOptions, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    if (!options.themes) {
      setThemes(defaultThemes);
      return;
    }
    setThemes(options.themes);
  }, [options, isAdmin]);

  useEffect(() => {
    if (!themes) return;
    const newCustoms = themes.filter((theme) => theme.custom).length;
    setCustoms(newCustoms);
  }, [themes]);

  const closeModal = () => {
    setShowModal(false);
  };
  const closeInputModal = () => {
    setShowCustomInput(false);
  };

  const handleCheck = useCallback(
    (theme) => {
      if (!isAdmin) return;

      if (
        !theme.selected &&
        themes.filter((theme) => theme.selected).length >= max
      ) {
        setServerMessage(`${max} catégories maximum`);
        return;
      }
      setServerMessage("");

      const themeIndex = themes.findIndex((th) => th.theme === theme.theme);
      let isSelected = !themes[themeIndex].selected;
      const newTheme = {
        ...themes[themeIndex],
        selected: isSelected,
      };
      const newThemes = [...themes];
      newThemes[themeIndex] = newTheme;
      setThemes(newThemes);

      setServerMessage("");
    },
    [max, themes, isAdmin, setServerMessage]
  );

  const addCustom = (formData) => {
    const newCustom = capitalizeFirstLetter(formData.get("custom"));

    if (themes.some((theme) => theme.theme === newCustom)) {
      setServerMessage("Cette catégorie est déjà présente");
      return;
    }
    if (newCustom.length < 3) {
      setServerMessage("Nombre de caractères inférieur à 3");
      return;
    }
    if (newCustom.length > 15) {
      setServerMessage("Nombre de caractères supérieur à 15");
      return;
    }

    const newThemes = [...themes];
    newThemes.push({ theme: newCustom, selected: true, custom: true });
    const sortedThemes = newThemes.sort((a, b) =>
      a.theme.localeCompare(b.theme)
    );
    setThemes(sortedThemes);

    setShowCustomInput(false);
    setServerMessage("");
  };

  const deleteCustom = ({ index }) => {
    const newThemes = [...themes];
    newThemes.splice(index, 1);
    setThemes(newThemes);
    setServerMessage("");
  };

  return (
    <div className="flex flex-col justify-center items-center my-4">
      <button
        onClick={() => setShowModal(true)}
        className="flex justify-center border border-amber-700 bg-amber-100 text-amber-700 w-2/3"
      >
        {selected} catégorie
        {selected >= 2 ? "s" : ""}
      </button>

      <Modal isOpen={showModal} onClose={closeModal}>
        <div className="py-2 bg-gray-100">
          <div
            onClick={() => closeModal()}
            className="flex justify-center border border-2 border-b-0 border-gray-950 bg-gray-100 w-full py-1 rounded-t-lg"
          >
            <button className="font-semibold text-gray-950">
              {selected} catégorie
              {selected >= 2 ? "s" : ""}
            </button>
          </div>

          <div className="text-center bg-gray-100">
            <div className="border border-2 border-gray-950 w-full flex flex-col items-center rounded-b-lg">
              <div className="columns-2 gap-2 bg-[#848b98] (gray-450)">
                {themes?.map((theme, i) => {
                  const isSelected = theme.selected;
                  const isCustom = theme.custom;

                  return (
                    <div key={i} className="p-1">
                      <div
                        className={`w-full flex items-center p-0 rounded-full ${
                          !isSelected && "text-gray-100"
                        }`}
                      >
                        <div
                          className={`w-full flex justify-center p-[3px] ${
                            isDeletingCustom && isCustom
                              ? "text-red-600"
                              : isSelected &&
                                (isAdmin
                                  ? !isCustom
                                    ? "text-green-600"
                                    : "text-sky-600"
                                  : "text-sky-700")
                          }`}
                        >
                          <div
                            onClick={() => {
                              if (isCustom && isDeletingCustom)
                                deleteCustom({ index: i });
                              else {
                                setIsDeletingCustom(false);
                                handleCheck(theme);
                              }
                            }}
                            className={`w-full p-1 ${
                              isDeletingCustom && isCustom
                                ? "bg-red-100 shadow-[inset_0_0_0_2px_#dc2626] (red 600) rounded-full"
                                : isSelected &&
                                  (isAdmin
                                    ? !isCustom
                                      ? "bg-gray-100 shadow-[inset_0_0_0_2px_#16a34a] (green 600) rounded-full"
                                      : "bg-gray-100 shadow-[inset_0_0_0_2px_#0284c7] (sky 600) rounded-full"
                                    : "bg-gray-100 shadow-[inset_0_0_0_2px_#0369a1] (sky 700) rounded-full")
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

              <div className="font-semibold border-t-2 border-black w-full relative h-10 py-2 text-sm flex items-center bg-gray-100 rounded-b-lg">
                <div className="flex gap-2 absolute right-2 items-center h-full">
                  <div className="text-gray-950">
                    Personnalisées : {customs}
                  </div>
                  <button
                    onClick={() => {
                      if (
                        themes.filter((theme) => theme.selected).length >= max
                      ) {
                        setServerMessage(`${max} catégories maximum`);
                        return;
                      }
                      if (customs >= 4) {
                        setServerMessage("4 personnalisées maximum");
                        return;
                      }
                      setIsDeletingCustom(false);
                      setShowCustomInput(true);
                      setServerMessage("");
                    }}
                    className={`border border-gray-950 bg-sky-100 w-6 ${
                      !isAdmin ? "hidden" : ""
                    }`}
                  >
                    +
                  </button>

                  <button
                    onClick={() => {
                      if (!customs) return;
                      if (isDeletingCustom) {
                        setIsDeletingCustom(false);
                        return;
                      }

                      setIsDeletingCustom(true);
                      setServerMessage("");
                    }}
                    className={`border border-gray-950 bg-red-100 w-6 ${
                      !isAdmin ? "hidden" : ""
                    }`}
                  >
                    -
                  </button>
                </div>
              </div>

              <InputModal
                isOpen={showCustomInput}
                onClose={closeInputModal}
                action={addCustom}
                name="custom"
                message="Nouvelle catégorie personnalisée"
              />

              {serverMessage.length !== 0 && (
                <div className="absolute bottom-0">{serverMessage}</div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
