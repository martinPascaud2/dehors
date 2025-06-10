import { revalidatePath } from "next/cache";
import prisma from "@/utils/prisma";

import AddTheme from "./AddTheme";
import Theme from "./Theme";

export default async function UndercoverEditionPage() {
  const themeList = await prisma.undercovertheme.findMany({
    where: {},
    include: {
      words: true,
    },
  });

  const revalidate = async () => {
    "use server";
    revalidatePath("/admin/app-edition/undercover");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div>Editeur Undercover</div>
      <AddTheme revalidate={revalidate} />

      <hr className="border-b border-black w-full" />

      <div className="m-2">
        {themeList.map((theme, i) => (
          <div key={i}>
            <Theme theme={theme} revalidate={revalidate} />
            {i < themeList.length - 1 && (
              <hr className="border-b border-black w-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
