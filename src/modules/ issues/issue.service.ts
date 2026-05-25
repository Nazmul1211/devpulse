import { pool } from "../../db";


const createIssuesIntoDB = (payload: any) => {
    const {title, description, bug} = payload 
    console.log("Issue service: ", payload);

//     {
//   "title": "Database connection timeout under load",
//   "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
//   "type": "bug"
// }

    // "id": 45,
    // "title": "Database connection timeout under load", 
    // "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    // "type": "bug",
    // "status": "open",
    // "reporter_id": 1,
    // "created_at": "2026-01-20T10:30:00Z",
    // "updated_at": "2026-01-20T10:30:00Z"


    // jwt
    // id(reporter_id) name role

    // query to findout user role 



    try {


        // const newIssues = pool.query(`
        //     INSERT INTO issues(title, descriptioin, type, status, reorter_id) VALUES($1,$2,$3,$4, COALESCE(&5, users.id))
        //     `, [title, description, type, status, reorter_id]);


        //     return newIssues; 
    } catch (error) {
        console.log(error);
    }

}


export const issuesService = {
    createIssuesIntoDB,
}