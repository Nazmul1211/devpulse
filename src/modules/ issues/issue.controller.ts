import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issuesService } from "./issue.service";

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
    // console.log("Issue routes hitted.");
    
    // Catching the query params after the '?' in the URL
    const queryParams = req.query; 


    const validTypes = ["bug", "feature_request"];
    
    if (queryParams.type && !validTypes.includes(queryParams.type as string)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid type. It must be 'bug' or 'feature_request'",
      });
    }


    const validStatuses = ["open", "in_progress", "resolved", "closed"];

    if (queryParams.status && !validStatuses.includes(queryParams.status as string)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid status. It must be 'open', 'in_progress', or 'resolved'",
      });
    }

 
    const result = await issuesService.getAllIssuesFromDB(queryParams);

    if (result.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "No issues found for the given criteria",
        data: []
      });
    }

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
