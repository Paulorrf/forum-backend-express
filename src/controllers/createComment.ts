import prisma from "../utils/prismaClient";
import { Request, Response } from "express";

export const createComment = async (req: Request, res: Response) => {
  const { comment, users_id, post_id } = req.body;

  console.log("testeeeee11", comment);

  try {
    const savedComment = await prisma.comentario.create({
      data: {
        mensagem: comment,
        users_id,
        post_id,
      },
    });

    return res.json({ comment: savedComment, ok: true }).status(200);
  } catch (error) {
    return res
      .json({ comment: "could not save the comment", ok: false })
      .status(401);
  }
};
