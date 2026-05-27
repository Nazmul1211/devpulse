
    import {createRequire} from 'module';
    const require = createRequire(import.meta.url);
    

// src/app.ts
import express from "express";
import cors from "cors";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/utils/sendResponse.ts
var sendResponse = (res, payload) => {
  const { statusCode, success, message, data, error } = payload;
  res.status(statusCode).json({
    success,
    message,
    data,
    error
  });
};
var sendResponse_default = sendResponse;

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET,
  token_expiration: process.env.JWT_EXPIRES_IN
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT,
            email VARCHAR(25) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(15) DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(15) NOT NULL CHECK (type IN ('bug', 'feature_request')),
            status VARCHAR(15) DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved')),
            reporter_id INT REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            CONSTRAINT description_min_length CHECK (LENGTH(TRIM(description)) >= 20)
            )
            
            `);
    console.log(`
 [ User and Issues table created successfully!! ] 
`);
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var createUserIntoDB = async (payload) => {
  if (!payload) {
    throw new Error("Request body is required");
  }
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  console.log(payload, hashPassword);
  const result = await pool.query(
    `
        INSERT INTO users(name, email, password, role) VALUES ($1,$2,$3,COALESCE($4, 'contributor'))
        RETURNING id, name, email, role, created_at, updated_at
        `,
    [name, email, hashPassword, role]
  );
  return result.rows[0];
};
var getSingleUserFromDB = async (email, password) => {
  const userData = await pool.query(
    `
        SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email=$1
        `,
    [email]
  );
  if (userData.rowCount === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = jwt.sign(jwtPayload, config_default.secret, {
    expiresIn: config_default.token_expiration
  });
  delete user.password;
  console.log("auth-service", accessToken, userData);
  return {
    token: accessToken,
    user: userData.rows[0]
  };
};
var devService = {
  createUserIntoDB,
  getSingleUserFromDB
};

// src/modules/auth/auth.controller.ts
var createUser = async (req, res, next) => {
  console.log("Request body:", req.body);
  try {
    const result = await devService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleUser = async (req, res) => {
  const payload = await req.body;
  const { email, password } = payload;
  try {
    const result = await devService.getSingleUserFromDB(email, password);
    if (result) {
      sendResponse_default(res, {
        statusCode: 200,
        success: true,
        message: "Login successful",
        data: result
      });
    }
  } catch (error) {
    console.log(error);
  }
};
var authController = {
  createUser,
  getSingleUser
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.createUser);
router.post("/login", authController.getSingleUser);
var apiRoutes = router;

// src/modules/ issues/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/ issues/issue.service.ts
var createIssuesIntoDB = async (payload, userId) => {
  try {
    const { title, description, type, status } = payload;
    const newIssues = await pool.query(
      `
        INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1,$2,$3,$4,$5)
        RETURNING *
        `,
      [title, description, type, status, userId]
    );
    console.log(newIssues);
    return newIssues.rows[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};
var getAllIssuesFromDB = async (query) => {
  let sqlText = `SELECT * FROM issues WHERE 1=1`;
  const values = [];
  let paramCounter = 1;
  if (query.type) {
    sqlText += ` AND type = $${paramCounter}`;
    values.push(query.type);
    paramCounter++;
  }
  if (query.status) {
    sqlText += ` AND status = $${paramCounter}`;
    values.push(query.status);
    paramCounter++;
  }
  if (query.sort === "oldest") {
    sqlText += ` ORDER BY created_at ASC`;
  } else {
    sqlText += ` ORDER BY created_at DESC`;
  }
  const issues = await pool.query(sqlText, values);
  const issueWithUser = await Promise.all(
    issues.rows.map(async (row) => {
      const userResult = await pool.query(`SELECT * FROM users WHERE id=$1`, [
        row.reporter_id
      ]);
      const user = userResult.rows[0];
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        type: row.type,
        status: row.status,
        reporter: {
          id: user.id,
          name: user.name,
          role: user.role
        },
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    })
  );
  return issueWithUser;
};
var getSingleIssuesFromDB = async (id) => {
  const issue = await pool.query(
    `
        SELECT * FROM issues WHERE id=$1
        `,
    [id]
  );
  console.log(issue.rows[0]);
  if (issue.rowCount === 0) {
    return null;
  }
  const singleIssue = issue.rows[0];
  const userResult = await pool.query(`SELECT * FROM users WHERE id=$1`, [
    singleIssue.reporter_id
  ]);
  const user = userResult.rows[0];
  return {
    id: singleIssue.id,
    title: singleIssue.title,
    description: singleIssue.description,
    type: singleIssue.type,
    status: singleIssue.status,
    reporter: {
      id: user.id,
      name: user.name,
      role: user.role
    },
    created_at: singleIssue.created_at,
    updated_at: singleIssue.updated_at
  };
};
var updateIssueIntoDB = async (issueId, updates, userId, userRole) => {
  try {
    const existingIssueResult = await pool.query(
      `SELECT * FROM issues WHERE id=$1`,
      [issueId]
    );
    if (existingIssueResult.rowCount === 0) {
      throw new Error("Issue not found");
    }
    const issue = existingIssueResult.rows[0];
    const isMaintainer = userRole === "maintainer";
    const isOwnerContributor = userRole === "contributor" && issue.reporter_id === userId && issue.status === "open";
    if (!isMaintainer && !isOwnerContributor) {
      throw new Error(
        "Unauthorized: Only maintainers or the original contributor (if issue is open) can update this issue."
      );
    }
    const { title, description, type } = updates;
    const updatedIssueResult = await pool.query(
      `
        UPDATE issues 
        SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        updated_at = NOW()
        WHERE id = $4 
        RETURNING *
      `,
      [title, description, type, issueId]
    );
    return updatedIssueResult.rows[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};
var deleteIssueFromDB = async (id, role) => {
  if (role !== "maintainer") {
    throw new Error("Unauthorized: Only maintainers can delete the issues");
  }
  const result = await pool.query(`
    DELETE FROM issues WHERE id=$1 RETURNING *
  `, [id]);
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0];
};
var issuesService = {
  createIssuesIntoDB,
  getAllIssuesFromDB,
  getSingleIssuesFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/modules/ issues/issue.controller.ts
var createNewIssues = async (req, res) => {
  try {
    const result = await issuesService.createIssuesIntoDB(
      req.body,
      req.user?.id
    );
    if (result) {
      sendResponse_default(res, {
        statusCode: 201,
        success: true,
        message: "Issue created successfully",
        data: result
      });
    }
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 401,
      success: false,
      message: error.message
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const queryParams = req.query;
    const validTypes = ["bug", "feature_request"];
    if (queryParams.type && !validTypes.includes(queryParams.type)) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Invalid type. It must be 'bug' or 'feature_request'"
      });
    }
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (queryParams.status && !validStatuses.includes(queryParams.status)) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Invalid status. It must be 'open', 'in_progress', or 'resolved'"
      });
    }
    const result = await issuesService.getAllIssuesFromDB(queryParams);
    if (result.length === 0) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "No issues found for the given criteria",
        data: []
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssues = async (req, res) => {
  console.log("hitted the get single issue route");
  console.log(req.params.id);
  try {
    const id = req.params.id;
    const result = await issuesService.getSingleIssuesFromDB(id);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 404,
      success: false,
      message: "Issue not found",
      error
    });
  }
};
var updateIssues = async (req, res) => {
  try {
    const issueId = req.params.id;
    const updatedIssue = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const result = await issuesService.updateIssueIntoDB(
      issueId,
      updatedIssue,
      userId,
      userRole
    );
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    const statusCode = error.message === "Issue not found" ? 404 : error.message.includes("Unauthorized") ? 403 : 500;
    sendResponse_default(res, {
      statusCode,
      success: false,
      message: error.message
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const id = req.params.id;
    const userRole = req.user?.role;
    const result = await issuesService.deleteIssueFromDB(
      id,
      userRole
    );
    console.log("result", result);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var issueController = {
  createNewIssues,
  getAllIssues,
  getSingleIssues,
  updateIssues,
  deleteIssue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unathorized Access"
        });
      }
      const decoded = jwt2.verify(
        token,
        config_default.secret
      );
      const userData = await pool.query(
        `
        SELECT * FROM users WHERE id=$1
        `,
        [decoded.id]
      );
      console.log(userData.rows[0]);
      if (userData.rowCount === 0) {
        return sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "User Not Found"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/modules/ issues/issue.route.ts
var issueRouter = Router2();
issueRouter.post("/issues", auth_default(), issueController.createNewIssues);
issueRouter.get("/issues", issueController.getAllIssues);
issueRouter.get("/issues/:id", issueController.getSingleIssues);
issueRouter.patch("/issues/:id", auth_default(), issueController.updateIssues);
issueRouter.delete("/issues/:id", auth_default(), issueController.deleteIssue);
var issue_route_default = issueRouter;

// src/app.ts
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.status(200).json({
    message: "DevPulse Server",
    author: "~"
  });
});
app.use("/api/auth", apiRoutes);
app.use("/api/", issue_route_default);
var app_default = app;

// src/server.ts
var main = async () => {
  await initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map