import { pool } from "../../db";
import type { IIssue, IUpdateIssue } from "./issue.interface";

const createIssuesIntoDB = async (payload: IIssue, userId: number | string) => {
  try {
    const { title, description, type, status } = payload;
    

    const newIssues = await pool.query(
      `
        INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1,$2,$3,$4,$5)
        RETURNING *
        `,
      [title, description, type, status, userId],
    );

    console.log(newIssues);

    return newIssues.rows[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllIssuesFromDB = async (query: any) => {

  let sqlText = `SELECT * FROM issues WHERE 1=1`;

  const values: any[] = [];
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
  } 
  else {
    sqlText += ` ORDER BY created_at DESC`;
  }

  const issues = await pool.query(sqlText, values);

  // console.log(issues.rows);

  // We use Promise.all to wait for ALL the inner queries to finish

  const issueWithUser = await Promise.all(
    issues.rows.map(async (row) => {

      const userResult = await pool.query(`SELECT * FROM users WHERE id=$1`, [
        row.reporter_id,
      ]);

      const user = userResult.rows[0];

      // Return the combined object structure
      return {
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
      };
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


  const userResult = await pool.query(`SELECT * FROM users WHERE id=$1`, [
    singleIssue.reporter_id,
  ]);

  const user = userResult.rows[0];


  // Return the combined object structure
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

const updateIssueIntoDB = async (
  issueId: string,
  updates: IUpdateIssue,
  userId: number,
  userRole: string
) => {
  try {
    // 1. Fetch the existing issue to check permissions
    const existingIssueResult = await pool.query(
      `SELECT * FROM issues WHERE id=$1`,
      [issueId]
    );

    if (existingIssueResult.rowCount === 0) {
      throw new Error("Issue not found");
    }

    const issue = existingIssueResult.rows[0];

    // 2. Check Role & Permissions
    const isMaintainer = userRole === "maintainer";
    const isOwnerContributor =
      userRole === "contributor" &&
      issue.reporter_id === userId &&
      issue.status === "open";

    if (!isMaintainer && !isOwnerContributor) {
      throw new Error(
        "Unauthorized: Only maintainers or the original contributor (if issue is open) can update this issue."
      );
    }

    // 3. Update the Issue
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

const deleteIssueFromDB = async(id: string, role: string) => {

  if(role !== "maintainer") {
    throw new Error("Unauthorized: Only maintainers can delete the issues");
  }

  const result = await pool.query(`
    DELETE FROM issues WHERE id=$1 RETURNING *
  `, [id]);

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}

export const issuesService = {
  createIssuesIntoDB,
  getAllIssuesFromDB,
  getSingleIssuesFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB,
};


