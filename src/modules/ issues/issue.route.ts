import { Router } from "express";
import { issueController } from "./issue.controller";



const issueRouter = Router();

issueRouter.post("/issues", issueController.createNewIssues);

export default issueRouter;