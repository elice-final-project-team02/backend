import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "./common/utils/logger";
import cookieParser from "cookie-parser";
import cors from "cors";

import pingRouter from "./routers/pingRouter";
import postRouter from "./routers/postRouter";
import userRouter from "./routers/userRouter";
import chatRouter from "./routers/chatRouter";
import { errorMiddleware } from "./middlewares/errorMiddlewares";

dotenv.config();

const app = express();
const port: string = process.env.PORT;
const mongoURI: string = process.env.MONGO_DB_PATH;

mongoose
  .connect(mongoURI as string)
  .then(() => logger.info("mongoose connected"))
  .catch((err: Error) => logger.error("DB connection fail", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://kdt-sw-6-team02.elicecoding.com"],
    credentials: true,
  }),
);

app.use("/api/ping", pingRouter);
app.use("/api/post", postRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

app.use(errorMiddleware);

app.listen(port, () => {
  logger.info(`server is running on ${port}`);
});
