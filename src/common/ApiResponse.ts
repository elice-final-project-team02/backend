import { Response } from "express";

export class ApiResponse {
  static success(res: Response, message: string, data?: any) {
    return res.status(200).json({ code: 200, message, data });
  }

  static created(res: Response, message: string, data?: any) {
    return res.status(201).json({ code: 201, message, data });
  }
}
