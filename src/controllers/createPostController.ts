import prisma from "../utils/prismaClient";
import { Request, Response } from "express";

export const createPost = async (req: Request, res: Response) => {
  const { title, mensagem, email, category_id } = req.body;
  // console.log("title", title);
  // console.log("mensagem", mensagem);
  // console.log("email", email);
  // console.log("category_id", category_id);

  try {
    const foundUser: any = await prisma.users.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    // console.log(foundUser);

    try {
      const savedPost = await prisma.post.create({
        data: {
          title,
          mensagem,
          category_id,
          users_id: foundUser.id,
        },
      });

      console.log("post salvo");
      return res.sendStatus(200).json(savedPost);
    } catch (error) {
      console.log("erro ao salvar o post");
      return res.sendStatus(403).send({ message: error });
    }
  } catch (error) {
    console.log("nao foi possivel achar o usuario");
    return res.sendStatus(403).send({ message: error });
  }
};
