import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issuesService } from "./issue.service";

const createNewIssues = async (req: Request, res: Response) => {
  // console.log(req.body);

  try {
    const result = await issuesService.createIssuesIntoDB(req as object);

    if (result) {
      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Issue created successfully",
        data: result,
      });
    }
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 401,
      success: false,
      message: error.message,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    console.log("Issue routes hitted.");
    const result = await issuesService.getAllIssuesFromDB();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getSingleIssues = async (req: Request, res: Response) => {
  console.log("hitted the get single issue route");
  console.log(req.params.id);

  try {
    const id = req.params.id;

    const result = await issuesService.getSingleIssuesFromDB(id as string);

    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Issue not found",
      error: error,
    });
  }
};

export const issueController = {
  createNewIssues,
  getAllIssues,
  getSingleIssues,
};
