
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
  port: process.env.PORT
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
            reporter_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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
var createUserIntoDB = async (payload) => {
  if (!payload) {
    throw new Error("Request body is required");
  }
  const { name, email, password, role } = payload;
  console.log("auth-service: ", payload);
  const result = await pool.query(
    `
        INSERT INTO users(name, email, password, role) VALUES ($1,$2,$3,COALESCE($4, 'contributor'))
        RETURNING id, name, email, role, created_at, updated_at
        `,
    [name, email, password, role]
  );
  console.log(result);
  return result.rows[0];
};
var devService = {
  createUserIntoDB
};

// src/modules/auth/auth.controller.ts
var createUser = async (req, res, next) => {
  console.log("Request body:", req.body);
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      const error = new Error("Request body is required");
      error.statusCode = 400;
      throw error;
    }
    const result = await devService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var authController = {
  createUser
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.createUser);
var apiRoutes = router;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong",
    error: {
      name: error.name
    }
  });
};

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
app.use(globalErrorHandler);
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