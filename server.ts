import { authRouter } from "./src/routes/authUser";
import { createPostRouter } from "./src/routes/createPostRoute";
import { verifyTokenRoute } from "./src/routes/verifyTokenRoute";
import cors from "cors";
import verifyToken from "./src/middlewares/verifyToken";
import express from "express";
import * as dotenv from "dotenv";

// const corsOptions = {
//   origin: "http://localhost:3000/",
//   optionsSuccessStatus: 200,
// };

// const express = require("express");
dotenv.config();
const app = express();

// app.use(cors({ credentials: true, origin: "http://localhost:3000/" }));
// app.options("*", cors());

var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(express.json());
// require("dotenv").config();

app.use(
  "/",
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
    credentials: true,
  }),
  authRouter
);
// app.use("/", verifyToken, createPostRouter);
app.use("/", createPostRouter);
app.use("/", verifyTokenRoute);
// app.use("/", loginUser);

const port = 5000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
