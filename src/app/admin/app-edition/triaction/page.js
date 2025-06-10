import prisma from "@/utils/prisma";

import ActionsList from "./ActionsList";

export default async function TriactionEditionPage() {
  const firstTen = await prisma.triactionAction.findMany({
    take: 10,
    orderBy: { id: "desc" },
  });

  const takeNext = async ({ skip }) => {
    "use server";
    const next = await prisma.triactionAction.findMany({
      take: 10,
      orderBy: { id: "desc" },
      skip: skip,
    });
    return next;
  };

  const deleteAction = async ({ id }) => {
    "use server";
    await prisma.triactionAction.delete({ where: { id } });
  };

  return (
    <>
      <ActionsList
        takeNext={takeNext}
        firstTen={firstTen}
        deleteAction={deleteAction}
      />
    </>
  );
}
