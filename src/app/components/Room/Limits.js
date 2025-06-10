import { FaLongArrowAltRight, FaLongArrowAltLeft } from "react-icons/fa";

import { modesRules, gamesRefs } from "@/assets/globals";

export default function Limits({
  searchMode,
  categorie,
  gameName,
  gameData,
  options,
  adminSelectedMode,
}) {
  let lowLimit;
  let optiNumber;
  let highLimit;

  if (categorie !== "grouping" && !gameData.isSearching && options?.mode) {
    lowLimit = modesRules[decodeURIComponent(options.mode)].limits.min;
    optiNumber = modesRules[decodeURIComponent(options.mode)].limits.opti;
    highLimit = modesRules[decodeURIComponent(options.mode)].limits.max;
  } else if (adminSelectedMode) {
    lowLimit =
      modesRules[decodeURIComponent(adminSelectedMode.path)].limits.min;
    optiNumber =
      modesRules[decodeURIComponent(adminSelectedMode.path)].limits.opti;
    highLimit =
      modesRules[decodeURIComponent(adminSelectedMode.path)].limits.max;
  } else if (searchMode && !gameData.isSearching) {
    lowLimit = modesRules[searchMode].limits.min;
    optiNumber = modesRules[searchMode].limits.opti;
    highLimit = modesRules[searchMode].limits.max;
  } else if (!gameData.isSearching) {
    lowLimit = gamesRefs[gameName].limits.min;
    optiNumber = gamesRefs[gameName].limits.opti;
    highLimit = gamesRefs[gameName].limits.max;
  } else {
    return null;
  }

  return (
    <div className="absolute top-[10dvh] w-full flex justify-center">
      <div className="flex items-center">
        <div className="text-lg text-purple-950">
          {lowLimit}
          &nbsp;
        </div>

        <FaLongArrowAltRight className="mr-1 w-6 h-6 text-purple-950" />

        <div className="text-xl font-semibold text-purple-950">
          {optiNumber}
        </div>

        <FaLongArrowAltLeft className="ml-1 w-6 h-6 text-purple-950" />

        <div className="text-lg text-purple-950">
          &nbsp;
          {highLimit}
        </div>
      </div>
    </div>
  );
}
