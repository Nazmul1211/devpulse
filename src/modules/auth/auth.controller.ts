import type { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { devService } from "./auth.service";

const createUser = async(req: Request, res: Response, next: NextFunction) => {
  console.log("Request body:", req.body);
  
  try {
    const result = await devService.createUserIntoDB(req.body);
  
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) { 
    sendResponse(res, {
        statusCode: 500,
        success: false,
        message: error.message,
        error: error
    })
  }
};


const getSingleUser = async(req: Request, res: Response) => {
    const payload = await req.body;
    const {email, password} = payload;
    // console.log(payload);

    try {
        const result = await devService.getSingleUserFromDB(email as string, password as string);
        // console.log(result);
        if(result){
            sendResponse(res, {
                statusCode: 200,
                success: true,
                message: "Login successful",
                data: result
            })
        }

    } catch (error) {
        console.log(error)
    }
}

export const authController = {
  createUser,
  getSingleUser,
};
