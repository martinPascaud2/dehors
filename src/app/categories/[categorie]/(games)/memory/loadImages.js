"use server";

import shuffleArray from "@/utils/shuffleArray";
import { saveAndDispatchData } from "@/components/Room/actions";

const imageContext = require.context("./icons", false, /\.(png)$/);

export async function loadImages({
  prefixes,
  pairsNumber,
  gameData,
  roomToken,
  roomId,
}) {
  "use server";
  const savedAdminLoad = gameData.adminLoad;
  if (savedAdminLoad) return savedAdminLoad;

  // const imageContext = require.context("./icons", false, /\.(png)$/); //check
  const images = {};
  const imagesNames = [];
  let imageLength = 0;
  const shufflePrefixes = shuffleArray(prefixes);

  const numberByTheme = Math.floor(pairsNumber / prefixes.length);
  const remainings = {};
  prefixes.forEach((theme) => {
    remainings[theme.theme] = numberByTheme;
  });
  prefixes.forEach((prefix) => {
    if (!prefix.enhanced)
      remainings[prefix.theme] = Math.ceil(remainings[prefix.theme] / 1.5);
  });

  const totalRemainings = Object.values(remainings).reduce(
    (acc, number) => acc + number,
    0
  );

  let missings = pairsNumber - totalRemainings;
  let index = 0;
  const isThereEnhanced = prefixes.some((prefix) => prefix.enhanced);
  while (missings > 0) {
    if (isThereEnhanced) {
      if (shufflePrefixes[index].enhanced) {
        remainings[shufflePrefixes[index].theme]++;
        missings--;
      }
    } else {
      remainings[shufflePrefixes[index].theme]++;
      missings--;
    }
    index = (index + 1) % shufflePrefixes.length;
  }

  const shuffledImageContextKeys = shuffleArray(imageContext.keys());
  shuffledImageContextKeys.forEach((path) => {
    const imageName = path.replace(/^\.\/(.*)\.png$/, "$1");

    if (
      !imageName.startsWith("src") &&
      prefixes.some((prefix) => imageName.startsWith(prefix.theme)) &&
      remainings[imageName.split(" ")[0]] > 0
    ) {
      imagesNames.push(imageName);
      images[imageName] = imageContext(path).default;
      imageLength++;
      remainings[imageName.split(" ")[0]]--;
    }
  });

  const adminLoad = { images, imagesNames, imageLength };
  const newData = {
    ...gameData,
    adminLoad,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });

  return adminLoad;
}
