import prisma from "../utils/prismaClient";
import { Request, Response } from "express";

export const updateComment = async (req: Request, res: Response) => {
  const { comment_id, mensagem } = req.body;

  try {
    const updatedComment = await prisma.comentario.update({
      where: {
        id: comment_id,
      },
      data: {
        mensagem,
      },
    });

    return res.json({ comment: updatedComment, ok: true }).status(200);
  } catch (error) {
    return res
      .json({ comment: "could not update comment", ok: false })
      .status(401);
  }
};
