import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const UserMode = {
  NewUser: 1,
  Registered: 2
};

export const getUser = async (id: string) => {
  let user = await prisma.user.findFirst({ where: { id: id } });
  if (!user) {
    user = await addUser(id);
  }
  return user;
};

export const addUser = async (id: string) => {
  return await prisma.user.create({
    data: { id: id, mode: UserMode.NewUser }
  });
};

export const setAddress = async (id: string, address: string) => {
  await prisma.user.update({
    where: {
      id
    },
    data: {
      mode: UserMode.Registered,
      wallet: address
    }
  });
};

export const getAllRegisteredUsers = async () => {
  return await prisma.user.findMany({
    where: {
      mode: UserMode.Registered
    }
  });
};
