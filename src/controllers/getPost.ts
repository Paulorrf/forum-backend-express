import prisma from "../utils/prismaClient";
import { Request, Response } from "express";

export const getPost = async (req: Request, res: Response) => {
  const { postId } = req.body;

  console.log(postId);
  try {
    const postValue = await prisma.post.findFirst({
      where: {
        id: parseInt(postId),
      },
      select: {
        id: true,
        title: true,
        mensagem: true,

        comentario: {
          select: {
            mensagem: true,
            id: true,

            users: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });

    console.log("post value", postValue);

    return res.json({ post: postValue, ok: true }).status(200);
  } catch (error) {
    console.log("nao foi possivel achar o post");
    return res.json({ ok: false }).status(404);
  }
};
