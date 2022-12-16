import prisma from "../utils/prismaClient";
import { Request, Response } from "express";

export const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.query;
  console.log(id);
  console.log(req.query);

  try {
    const deleteComment = await prisma.comentario.delete({
      where: {
        id: Number(id),
      },
    });

    console.log(deleteComment);

    return res.json({ comment: "comentario deletado", ok: true }).status(200);
  } catch (error) {
    return res
      .json({ comment: "falha ao deletar comentario", ok: false })
      .status(401);
  }
};
