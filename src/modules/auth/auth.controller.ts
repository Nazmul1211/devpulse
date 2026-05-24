import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";

const createUser = (req: Request, res: Response) => {
  console.log(req.body);
  const result = "new user data"
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User created successfully",
    data: result
  })
};

export const authController = {
  createUser,
};
