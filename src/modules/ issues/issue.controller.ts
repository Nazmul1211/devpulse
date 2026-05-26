import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issuesService } from "./issue.service";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import config from "../../config";

const createNewIssues = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.createIssuesIntoDB(
      req.body,
      req.user?.id
    );

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

const updateIssues = async (req: Request, res: Response) => {
  try {
    const issueId = req.params.id as string;
    const updatedIssue = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const result = await issuesService.updateIssueIntoDB(
      issueId,
      updatedIssue,
      userId,
      userRole,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: any) {
    const statusCode =
      error.message === "Issue not found"
        ? 404
        : error.message.includes("Unauthorized")
          ? 403
          : 500;

    sendResponse(res, {
      statusCode: statusCode,
      success: false,
      message: error.message,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const userRole = req.user?.role;

    const result = await issuesService.deleteIssueFromDB(
      id as string,
      userRole as string,
    );

    console.log("result", result);

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
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

export const issueController = {
  createNewIssues,
  getAllIssues,
  getSingleIssues,
  updateIssues,
  deleteIssue,
};
