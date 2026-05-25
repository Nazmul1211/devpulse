import type { IUser } from "./auth.interface";
import { pool } from "../../db";
import bcrypt from "bcrypt";

const createUserIntoDB = async (payload: IUser) => {
  if (!payload) {
    throw new Error("Request body is required");
  }

  const { name, email, password, role } = payload;
  //   console.log("auth-service: ",payload);

  const hashPassword = await bcrypt.hash(password, 10);
  console.log(payload, hashPassword)

  const result = await pool.query(
    `
        INSERT INTO users(name, email, password, role) VALUES ($1,$2,$3,COALESCE($4, 'contributor'))
        RETURNING id, name, email, role, created_at, updated_at
        `,
    [name, email, hashPassword, role],
  );

  console.log(result);
  return result.rows[0];
};

export const devService = {
  createUserIntoDB,
};
