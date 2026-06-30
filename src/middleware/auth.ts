import type { NextFunction, Request, Response } from "express";
import config from "../config";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { pool } from "../db";
import sendResponse from "../utils/sendResponse";

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
    //   console.log(req.headers);

      // 1. check if the token exists
      // 2. verify the token
      // 3. find the user into database

      //   check if the token exists

     const token = req.headers.authorization;

      if (!token) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unathorized Access",
        });
      }

      // token verification
      const decoded = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;

        // console.log(decoded);

      // find the user into database
      const userData = await pool.query(
        `
        SELECT * FROM users WHERE id=$1
        `,
        [decoded.id],
      );



    // const user = userData.rows[0];

    if(userData.rowCount === 0){
        return sendResponse(res, {
            statusCode: 404,
            success: false,
            message: "User Not Found"
        })
    }
    
    req.user = decoded;
    
    next();
    } catch (error) {
        next(error);
    }
  };
};

export default auth;
