import jwt from "jsonwebtoken";
import cookie from "cookie";
import prisma from "../utils/prismaClient";
import { Request, Response } from "express";
import dayjs from "dayjs";

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (email !== "" && password !== "") {
    try {
      const savedUser = await prisma.users.create({
        data: {
          name,
          email,
          password,
        },
      });

      console.log("usuario salvo: " + savedUser);
      res.send({ savedUser });
    } catch (error) {
      console.log("erro em criar usuario");
      console.log(error);
      res.json({ message: error });
    }
  } else {
    res.json({ message: "email and password need to have value" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email, password);

  //limpa os cookies
  // res.clearCookie("tk", { httpOnly: true });

  if (email !== "" && password !== "") {
    try {
      const foundUser: any = await prisma.users.findFirst({
        where: {
          email,
          password,
        },
      });

      try {
        const accessToken = jwt.sign(
          { email },
          String(process.env.ACCESS_TOKEN_SECRET),
          {
            expiresIn: "1d",
          }
        );
        const refreshToken = jwt.sign(
          { email },
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
            access_expires_in: "",
            refresh_expires_in: "",
            access_token: accessToken,
            refresh_tk: refreshToken,
            users_id: foundUser.id,
          },
        });
        // res.header("Access-Control-Allow-Origin", "http://localhost:3000/");

        let expiresIn = new Date(Date.now() + 86400 * 1000);

        // res.cookie("tk", accessToken, {
        //   maxAge: 1000 * 60 * 15, //15 minutes
        //   httpOnly: true, // The cookie only accessible by the web server
        //   path: "/",
        //   secure: true,
        //   sameSite: "none",
        //   expires: expiresIn,
        //   // signed: true,
        //   // domain: "http://localhost:3000",
        //   //@ts-ignore
        //   // expires: dayjs.utc().hours(60).valueOf(),
        // });

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
        //   cookie.serialize("name", String(accessToken), {
        //     httpOnly: true,
        //     maxAge: 60 * 60 * 24 * 7, // 1 week
        //   })
        // );

        // Redirect back after setting cookie
        // res.statusCode = 302;
        // res.setHeader("Location", req.headers.referer || "/");

        return res.json({ token: accessToken, ok: true });
        // res.end();
      } catch (error) {
        console.log("refresh cant be created");
        res.send({ message: "refresh cant be created" });
      }
    } catch (error) {
      res.send({ message: "user not found" });
    }
  } else {
    res.json({ message: "token creation failed" });
  }
};
