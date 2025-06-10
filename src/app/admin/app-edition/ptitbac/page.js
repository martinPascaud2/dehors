import { revalidatePath } from "next/cache";

import prisma from "@/utils/prisma";

import AddTheme from "./AddTheme";
import Theme from "./Theme";

export default async function PtitbacEditionPage() {
  const allThemes = await prisma.ptitbactheme.findMany({ where: {} });

  const revalidate = async () => {
    "use server";
    revalidatePath("/admin/app-edition/ptitbac");
  };

  return (
    <>
      <div>éditeur ptit bac</div>
      <AddTheme revalidate={revalidate} />

      <hr className="border-b border-black w-full" />

      <div className="m-2">
        {allThemes.map((theme, i) => (
          <div key={i}>
            <Theme theme={theme} revalidate={revalidate} />
            {i < allThemes.length - 1 && <hr />}
          </div>
        ))}
      </div>
    </>
  );
}
