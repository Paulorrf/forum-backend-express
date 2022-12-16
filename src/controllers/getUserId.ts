import prisma from "../utils/prismaClient";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const getUserId = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (token === "") {
    return res.json({ id: null }).status(200);
  }

  try {
    const tokenValue: any = jwt.decode(token);

    try {
      const userId = await prisma.users.findUnique({
        where: {
          email: tokenValue.email,
        },
        select: {
          id: true,
        },
      });

      if (userId) {
        return res.json({ id: userId.id }).status(200);
      }
    } catch (error) {
      return res.json({ id: null }).status(401);
    }
  } catch (error) {}
};
