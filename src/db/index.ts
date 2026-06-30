import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connection_string,
});

export const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(50) DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);

    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request')),
            status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved')),
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
