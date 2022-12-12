import { authRouter } from "./src/routes/authUser";
import { createPostRouter } from "./src/routes/createPostRoute";
import { verifyTokenRoute } from "./src/routes/verifyTokenRoute";
import cors from "cors";
import verifyToken from "./src/middlewares/verifyToken";
import express from "express";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";

// const corsOptions = {
//   origin: "http://localhost:3000/",
//   optionsSuccessStatus: 200,
// };

// const express = require("express");
dotenv.config();
const app = express();
app.use(cookieParser());

// app.use(cors({ credentials: true, origin: "http://localhost:3000/" }));
// app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// require("dotenv").config();

app.use(
  "/",
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
    credentials: true,
    // exposedHeaders: ["Set-Cookie"],
  }),
  authRouter
);
app.use("/", verifyTokenRoute);
app.use("/", verifyToken, createPostRouter);
// app.use("/", createPostRouter);
// app.use("/", loginUser);

const port = 5000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
