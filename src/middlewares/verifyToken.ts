import jwt from "jsonwebtoken";
import cookie from "cookie";
import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prismaClient";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  // const cookies = cookie.parse(req.headers.cookie || "");
  const cookies = req.cookies.tk || "";
  console.log(cookies);

  if (Object.keys(cookies).length === 0) {
    console.log("nenhum access cookie encontradoo");
    return res.sendStatus(201); // forbidden
    // res.json({ message: "user is not logged in" }).sendStatus(403); //forbidden
  }

  console.log("cookies");
  console.log(cookies);

  try {
    const tokenIsValid = jwt.verify(
      cookies,
      String(process.env.ACCESS_TOKEN_SECRET)
    );
    console.log("middleware: access token is valid");
    console.log(tokenIsValid);
    // console.log(tokenIsValid);
    // console.log("token dentro do cookie");
    // console.log(cookies.accessToken);
    //@ts-ignore
    return res.json({ isLogged: true, email: tokenIsValid.email });
  } catch (error) {
    console.log("middleware: access token is invalid: ");

    const jwtValue = jwt.decode(cookies);

    //limpa os cookies
    // res.clearCookie("accessToken", { httpOnly: false });
    console.log("jwt value");
    //@ts-ignore
    console.log(jwtValue.email);
    console.log("jwt value");

    const foundUser = await prisma.users.findFirst({
      where: {
        //@ts-ignore
        email: jwtValue.email,
      },
      select: {
        id: true,
      },
    });

    if (foundUser === null) return res.sendStatus(403);

    try {
      const refreshTk = await prisma.refresh_token.findUnique({
        where: {
          //@ts-ignore
          users_id: Number(foundUser.id),
        },
      });

      console.log("refreshtk");
      console.log(refreshTk);
      console.log("refreshtk");

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

          console.log("chegou aqui");
          console.log(foundUser.id);

          const savedRefresh = await prisma.refresh_token.upsert({
            where: {
              users_id: foundUser.id,
            },
            update: {
              access_token: accessToken,
              refresh_tk: refreshToken,
            },
            create: {
              access_expires_in: "20s",
              refresh_expires_in: "10d",
              access_token: accessToken,
              refresh_tk: refreshToken,
              users_id: foundUser.id,
            },
          });

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

          console.log(savedRefresh);

          // res.setHeader(
          //   "Set-Cookie",
          //   cookie.serialize("accessToken", accessToken, {
          //     httpOnly: false,
          //     maxAge: 60 * 60 * 24 * 7, // 1 week
          //   })
          // );

          res.json({ token: accessToken, ok: true });
        } catch (err) {
          console.log("nao foi possivel criar um novo refresh token");
          return res.sendStatus(403); //forbidden
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
