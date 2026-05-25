import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import { apiRoutes } from "./modules/auth/auth.route";
import globlaErrorHandler from "./middleware/globalErrorHandler";
import issueRouter from "./modules/ issues/issue.route";

const app : Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "DevPulse Server",
    author: "~",
  });
});

app.use("/api/auth", apiRoutes);
app.use("/api/", issueRouter);

// app.use(globlaErrorHandler);

export default app;
