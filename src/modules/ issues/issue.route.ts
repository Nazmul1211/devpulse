import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";



const issueRouter = Router();

issueRouter.post("/issues", auth(), issueController.createNewIssues);
issueRouter.get("/issues", issueController.getAllIssues);

export default issueRouter;