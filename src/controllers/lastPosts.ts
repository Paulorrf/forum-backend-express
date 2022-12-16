import prisma from "../utils/prismaClient";
import { Request, Response } from "express";

export const lastPosts = async (req: Request, res: Response) => {
  const { urlName } = req.body;
  // console.log(category_id);

  try {
    const categoryId = await prisma.category.findFirst({
      where: {
        name: urlName,
      },
      select: {
        id: true,
      },
    });

    try {
      const lastPosts = await prisma.post.findMany({
        where: {
          category_id: categoryId?.id,
        },
        orderBy: [{ id: "desc" }],
        take: 10,
      });

      console.log("posts certo");

      res.json({ lastPosts }).status(200);
    } catch (error) {
      console.log("erro posts");
    }
  } catch (error) {}
};
