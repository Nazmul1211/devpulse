import config from "../../config";
import { pool } from "../../db";
import jwt, { type JwtPayload } from "jsonwebtoken";

const createIssuesIntoDB = async (payload: any) => {
  try {
    const payloadBody = payload.body;
    const { title, description, type, status } = payloadBody;
    // console.log("Issue service: ", payloadBody);

    // 1. check if the token exists
    // 2. verify the token
    // 3. find the user into database

    //   check if the token exists
    const token = payload.headers.authorization;

    // token verification
    const decoded = jwt.verify(
      token as string,
      config.secret as string,
    ) as JwtPayload;

    // console.log(decoded);

    // find the user into database
    const userData = await pool.query(
      `
        SELECT * FROM users WHERE id=$1
        `,
      [decoded.id],
    );

    console.log(userData.rows[0]);

    const user = userData.rows[0];

    // insert new issues into the issues table
    const newIssues = await pool.query(
      `
        INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1,$2,$3,$4,$5)
        RETURNING *
        `,
      [title, description, type, status, user.id],
    );

    console.log(newIssues);

    return newIssues.rows[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllIssuesFromDB = async () => {
  const issues = await pool.query(`
        SELECT * FROM issues
        `);

  // console.log(issues.rows);

  // We use Promise.all to wait for ALL the inner queries to finish

  const issueWithUser: any = [];

  const results = await Promise.all(
    issues.rows.map(async (row) => {
      // Note the added 'await' and 'FROM' keyword
      const userResult = await pool.query(`SELECT * FROM users WHERE id=$1`, [
        row.reporter_id,
      ]);

      const user = userResult.rows[0];

      // Return the combined object structure
      issueWithUser.push({
        id: row.id,
        title: row.title,
        description: row.description,
        type: row.type,
        status: row.status,
        reporter: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
        created_at: row.created_at,
        updated_at: row.updated_at,
      });
    }),
  );

  return issueWithUser;
};

const getSingleIssuesFromDB = async (id: string) => {
  const issue = await pool.query(
    `
        SELECT * FROM issues WHERE id=$1
        `,
    [id],
  );

  console.log(issue.rows[0]);

  if (issue.rowCount === 0) {
    return null;
  }

  const singleIssue = issue.rows[0];

  // Note the added 'await' and 'FROM' keyword
  const userResult = await pool.query(`SELECT * FROM users WHERE id=$1`, [
    singleIssue.reporter_id,
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
      role: user.role,
    },
    created_at: singleIssue.created_at,
    updated_at: singleIssue.updated_at,
  };
};

export const issuesService = {
  createIssuesIntoDB,
  getAllIssuesFromDB,
  getSingleIssuesFromDB,
};
