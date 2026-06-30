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

  const responseBody: Record<string, unknown> = { success, message };

  if (data !== undefined) responseBody.data = data;
  if (error !== undefined) responseBody.error = error;

  res.status(statusCode).json(responseBody);
};

export default sendResponse;
