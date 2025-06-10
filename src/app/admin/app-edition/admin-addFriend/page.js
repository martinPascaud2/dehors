import prisma from "@/utils/prisma";

import AdminAddFriend from "./AdminAddFriend";

export default async function AdminAddFriendPage() {
  const adminAddFriend = async ({ firstMail, secondMail }) => {
    "use server";
    const firstUser = await prisma.user.findUnique({
      where: { email: firstMail },
    });
    if (!firstUser) return { error: `${firstMail} introuvable` };
    const secondUser = await prisma.user.findUnique({
      where: { email: secondMail },
    });
    if (!secondUser) return { error: `${secondMail} introuvable` };
    if (firstMail === secondMail) return { error: `Bien tenté` };

    const friendList = (
      await prisma.user.findUnique({
        where: {
          email: firstMail,
        },
        select: {
          friends: {
            include: {
              friend: true,
            },
            orderBy: {
              friend: {
                name: "asc",
              },
            },
          },
        },
      })
    ).friends;

    const isAlreadyFriend = friendList.some(
      (friend) => friend.friend.email === secondMail.toLowerCase()
    );
    if (isAlreadyFriend)
      return {
        error: `${firstUser.name} et ${secondUser.name} sont déjà amis`,
      };

    const firstUserId = firstUser.id;
    const secondUserId = secondUser.id;

    try {
      await prisma.friend.create({
        data: {
          user: { connect: { id: firstUserId } },
          friend: { connect: { id: secondUserId } },
          customName: secondUser.name,
        },
      });
      await prisma.friend.create({
        data: {
          user: { connect: { id: secondUserId } },
          friend: { connect: { id: firstUserId } },
          customName: firstUser.name,
        },
      });
    } catch (e) {
      return { error: "Une erreur s'est produite lors de l'ajout" };
    }

    return {
      message: `${firstUser.name} et ${secondUser.name} sont désormais amis`,
    };
  };

  return (
    <div>
      <AdminAddFriend adminAddFriend={adminAddFriend} />
    </div>
  );
}
