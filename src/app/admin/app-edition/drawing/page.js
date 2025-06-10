import { revalidatePath } from "next/cache";

import prisma from "@/utils/prisma";

import AddWord from "./AddWord";
import Word from "./Word";

export default async function DrawingEditionPage() {
  const allWords = await prisma.drawingWord.findMany({ where: {} });

  const revalidate = async () => {
    "use server";
    revalidatePath("/admin/app-edition/drawing");
  };

  return (
    <>
      <div>éditeur dessin</div>
      <AddWord revalidate={revalidate} />

      <hr className="border-b border-black w-full" />

      <div className="m-2">
        {allWords.map((word, i) => (
          <div key={i}>
            <Word word={word} revalidate={revalidate} />
            {i < allWords.length - 1 && <hr />}
          </div>
        ))}
      </div>
    </>
  );
}
