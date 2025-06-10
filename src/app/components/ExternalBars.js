import { getUserParams } from "@/utils/getUser";

// to be done: use ExternalBars in Layouts
export default async function ExternalBars() {
  const userParams = await getUserParams();

  const bottomBarSize = userParams?.bottomBarSize || 8;
  const topBarSize = userParams?.topBarSize || 8;

  const ExternalBars = (
    <>
      <div
        className={`absolute w-full top-0 z-20 bg-black`}
        style={{ height: `${topBarSize / 4}rem` }}
      />
      <div
        className={`absolute w-full bottom-0 z-20 bg-black`}
        style={{ height: `${bottomBarSize / 4}rem` }}
      />
    </>
  );

  return ExternalBars;
}
