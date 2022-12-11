import prisma from "../utils/prismaClient";
import { Request, Response } from "express";

export const createPost = async (req: Request, res: Response) => {
  const { title, mensagem, users_id, category_id } = req.body;

  try {
    const savedPost = await prisma.post.create({
      data: {
        title,
        mensagem,
        category_id,
        users_id,
      },
    });

    console.log("post salvo");
    res.send(savedPost);
  } catch (error) {
    console.log("erro ao salvar o post");
    res.send({ message: error });
  }

  // res.send({ title, mensagem, users_id, category_id });
};
