import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issuesService } from "./issue.service";

const createNewIssues = (req: Request, res: Response) => {
  // const payload = req.body;
  // const {title, description, type} = payload;

  const result = issuesService.createIssuesIntoDB(req.body as object);

  // console.log("Issue Request Body:", result);

  try {
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unathorized Access",
      data: result,
    });
  }
};

export const issueController = {
  createNewIssues,
};
