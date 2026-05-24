import type { Response } from "express";

type IResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  error?: any;
};

const sendResponse = <T>(res: Response, payload: IResponse<T>) => {
  const { statusCode, success, message, data, error } = payload;
  res.status(statusCode).json({
    success,
    message,
    data,
    error,
  });
};

export default sendResponse;
