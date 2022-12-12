import jwt from "jsonwebtoken";
import cookie from "cookie";
import { Request, Response } from "express";
import prisma from "../utils/prismaClient";

export const verifyTokenController = async (req: Request, res: Response) => {
  const cookies = req.body.token;
  // console.log(cookies);
  //@ts-ignore
  // const cookies = cookies2.split("=")[1];
  // const cookies = req.body.token;
  // console.log(cookies.tk);

  if (Object.keys(cookies).length === 0) {
    console.log("nenhum access cookie encontradoo");
    return res.sendStatus(201); // forbidden
    // res.json({ message: "user is not logged in" }).sendStatus(403); //forbidden
  }

  // console.log("cookies");
  // console.log(cookies);

  try {
    const tokenIsValid = jwt.verify(
      cookies,
      String(process.env.ACCESS_TOKEN_SECRET)
    );
    console.log("controller: access token is valid");
    console.log(tokenIsValid);
    // console.log(tokenIsValid);
    // console.log("token dentro do cookie");
    // console.log(cookies.accessToken);
    //@ts-ignore
    return res.json({ isLogged: true, email: tokenIsValid.email });
  } catch (error) {
    console.log("access token is invalid: ");

    const jwtValue = jwt.decode(cookies);

    //limpa os cookies
    // res.clearCookie("accessToken", { httpOnly: false });
    console.log(jwtValue);

    try {
      const refreshTk = await prisma.refresh_token.findUnique({
        where: {
          //@ts-ignore
          users_id: Number(jwtValue.id),
        },
      });

      try {
        const refreshIsValid = jwt.verify(
          //@ts-ignore
          refreshTk?.refresh_tk,
          String(process.env.REFRESH_TOKEN_SECRET)
        );

        console.log("refresh é valido");

        try {
          const accessToken = jwt.sign(
            { id: refreshIsValid.id, email: refreshIsValid.email },
            String(process.env.ACCESS_TOKEN_SECRET),
            {
              expiresIn: "10s",
            }
          );

          const refreshToken = jwt.sign(
            { id: refreshIsValid.id, email: refreshIsValid.email },
            String(process.env.REFRESH_TOKEN_SECRET),
            {
              expiresIn: "60s",
            }
          );

          const savedRefresh = await prisma.refresh_token.upsert({
            where: {
              users_id: refreshIsValid.id,
            },
            update: {
              access_token: accessToken,
              refresh_tk: refreshToken,
              users_id: refreshIsValid.id,
            },
            create: {
              access_expires_in: "20s",
              refresh_expires_in: "10d",
              access_token: accessToken,
              refresh_tk: refreshToken,
              users_id: refreshIsValid.id,
            },
          });

          console.log(savedRefresh);

          // res.setHeader(
          //   "Set-Cookie",
          //   cookie.serialize("accessToken", accessToken, {
          //     httpOnly: false,
          //     maxAge: 60 * 60 * 24 * 7, // 1 week
          //   })
          // );
          res.json({ message: "teste" });
        } catch (err) {
          console.log("nao foi possivel criar um novo refresh token");
          res.sendStatus(403); //forbidden
        }
      } catch (error) {
        console.log("refresh ja expirou");
        res.sendStatus(403); //forbidden
        return;
      }
    } catch (error) {
      console.log("no refresh on db");
      res.sendStatus(403); //forbidden
    }
  }
};
