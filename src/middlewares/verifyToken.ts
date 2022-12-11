import jwt from "jsonwebtoken";
import cookie from "cookie";
import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prismaClient";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const cookies = cookie.parse(req.headers.cookie || "");
  // const cookies = req.body.token;

  if (Object.keys(cookies).length === 0) {
    console.log("nenhum access cookie encontrado");
    res.json({ message: "user is not logged in" }).sendStatus(403); //forbidden
  }

  console.log("cookies");
  console.log(cookies);

  try {
    const tokenIsValid = jwt.verify(cookies.accessToken, "dspaojdspoadsaodksa");
    console.log("access token is valid");
    // console.log(tokenIsValid);
    // console.log("token dentro do cookie");
    // console.log(cookies.accessToken);
  } catch (error) {
    console.log("access token is invalid: ");

    const jwtValue = jwt.decode(cookies.accessToken);

    //limpa os cookies
    res.clearCookie("accessToken", { httpOnly: false });
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
          "dsaoindsadmnsaosda"
        );

        console.log("refresh é valido");

        try {
          const accessToken = jwt.sign(
            { id: refreshIsValid.id, email: refreshIsValid.email },
            "dspaojdspoadsaodksa",
            {
              expiresIn: "10s",
            }
          );

          const refreshToken = jwt.sign(
            { id: refreshIsValid.id, email: refreshIsValid.email },
            "dsaoindsadmnsaosda",
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

  next();
};

export default verifyToken;
