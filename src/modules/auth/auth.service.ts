import type { IUser } from "./auth.interface";
import { pool } from "../../db";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import config from "../../config";

const createUserIntoDB = async (payload: IUser) => {
  if (!payload) {
    throw new Error("Request body is required");
  }

  const { name, email, password, role } = payload;
  //   console.log("auth-service: ",payload);

  const hashPassword = await bcrypt.hash(password, 10);
  console.log(payload, hashPassword);

  const result = await pool.query(
    `
        INSERT INTO users(name, email, password, role) VALUES ($1,$2,$3,COALESCE($4, 'contributor'))
        RETURNING id, name, email, role, created_at, updated_at
        `,
    [name, email, hashPassword, role],
  );

  //   console.log(result);
  return result.rows[0];
};

const getSingleUserFromDB = async (email: string, password: string) => {
  // 1. check if the user exists
  // 2. compare the password
  // 3. Generate Token

  // 1. check if the user exists
  const userData = await pool.query(
    `
        SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email=$1
        `,
    [email],
  );

  //   handle invalid credentials
  if (userData.rowCount === 0) {
    throw new Error("Invalid Credentials!");
  }

  const user = userData.rows[0];

  // compare the password (client vs datatabase)
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }

  // Generate Token with JWT
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.secret, {
    expiresIn: config.token_expiration,
  }) as SignOptions;

// Remove password before returning
  delete user.password;

  console.log("auth-service", accessToken, userData);
  return {
    token: accessToken,
    user: userData.rows[0],
  };
};

export const devService = {
  createUserIntoDB,
  getSingleUserFromDB,
};
