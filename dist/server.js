
    import {createRequire} from 'module';
    const require = createRequire(import.meta.url);
    

// src/server.ts
import express from "express";

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

// src/modules/auth/auth.controller.ts
var createUser = (req, res) => {
  console.log(req.body);
  const result = "new user data";
  sendResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "User created successfully",
    data: result
  });
};
var authController = {
  createUser
};

// src/modules/auth/auth.route.ts
var router = Router();
router.get("/", authController.createUser);
var apiRoutes = router;

// src/server.ts
var app = express();
var port = 3e3;
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/auth/singup", apiRoutes);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
//# sourceMappingURL=server.js.map