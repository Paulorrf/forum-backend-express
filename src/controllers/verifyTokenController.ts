import jwt from "jsonwebtoken";
import cookie from "cookie";
import { Request, Response } from "express";
import prisma from "../utils/prismaClient";

export const verifyTokenController = async (req: Request, res: Response) => {
  const cookies = req.body;
  // const cookies = req.cookies.tk || "";
  //@ts-ignore
  // const cookies = cookies2.split("=")[1];
  // const cookies = req.body.token;
  // console.log(cookies.tk);

  if (Object.keys(cookies).length === 0) {
    console.log("controller: nenhum access cookie encontradoo");
    try {
      return res
        .send({ message: "no access token found", isLogged: false })
        .status(200);
    } catch (error) {
      console.log("DEU RUIM");
      return;
    }
    // res.json({ message: "user is not logged in" }).sendStatus(403); //forbidden
  }

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
    console.log("controller: access token is invalid");

    const jwtValue = jwt.decode(cookies.token);

    //@ts-ignore
    if (!jwtValue.email) {
      return res.json({ isLogged: false });
    }

    const foundUser = await prisma.users.findFirst({
      where: {
        //@ts-ignore
        email: jwtValue.email,
      },
      select: {
        id: true,
      },
    });

    if (foundUser === null) {
      return res.sendStatus(403);
    }

    try {
      const refreshTk = await prisma.refresh_token.findUnique({
        where: {
          //@ts-ignore
          users_id: Number(foundUser.id),
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
            { email: refreshIsValid.email },
            String(process.env.ACCESS_TOKEN_SECRET),
            {
              expiresIn: "10s",
            }
          );

          const refreshToken = jwt.sign(
            { email: refreshIsValid.email },
            String(process.env.REFRESH_TOKEN_SECRET),
            {
              expiresIn: "1d",
            }
          );

          const savedRefresh = await prisma.refresh_token.upsert({
            where: {
              users_id: foundUser.id,
            },
            update: {
              access_token: accessToken,
              refresh_tk: refreshToken,
              users_id: foundUser.id,
            },
            create: {
              access_expires_in: "20s",
              refresh_expires_in: "10d",
              access_token: accessToken,
              refresh_tk: refreshToken,
              users_id: foundUser.id,
            },
          });

          // console.log(savedRefresh);

          let expiresIn = new Date(Date.now() + 86400 * 1000);
          res.clearCookie("tk", { httpOnly: false });

          res.setHeader(
            "Set-Cookie",
            cookie.serialize("tk", accessToken, {
              maxAge: 1000 * 60 * 15, //15 minutes
              httpOnly: false, // The cookie only accessible by the web server
              path: "/",
              secure: true,
              expires: expiresIn,
              sameSite: "none",
              // priority: "high",
            })
          );

          // res.setHeader(
          //   "Set-Cookie",
          //   cookie.serialize("accessToken", accessToken, {
          //     httpOnly: false,
          //     maxAge: 60 * 60 * 24 * 7, // 1 week
          //   })
          // );
          //@ts-ignore
          res.json({ email: jwtValue.email, isLogged: true });
        } catch (err) {
          console.log(
            "controller: nao foi possivel criar um novo refresh token"
          );
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
