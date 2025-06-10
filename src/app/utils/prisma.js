import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

global.prisma = global.prisma ?? prismaClientSingleton();

export default global.prisma;
