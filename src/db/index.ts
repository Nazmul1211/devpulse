import { Pool } from "pg";
import config from "../config";
import type { Request, Response } from "express";

export const pool = new Pool({
  connectionString: config.connection_string,
});

export const initDB = async () => {
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


    console.log(`\n [ User and Issues table created successfully!! ] \n`);
  } catch (error) {
    console.log(error);
  }
};
