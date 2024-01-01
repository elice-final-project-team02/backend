import { Request, Response, ErrorRequestHandler, NextFunction } from "express";
import CustomError from "../common/error/CustomError";

export const errorMiddleware: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  const statusCode = err instanceof CustomError ? err.statusCode : 500;
  res.status(statusCode).json({ message: err.message });
};
