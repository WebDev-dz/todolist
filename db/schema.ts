import { extendedClient } from "@/DbModule"
import { UserCreateOneSchema } from "@/prisma/prisma/generated/schemas"
import { Prisma } from "@prisma/client/extension"






export const addUser = async (user: typeof UserCreateOneSchema._type) => {
  const res = await extendedClient.user.create(user)
  return res;
} 