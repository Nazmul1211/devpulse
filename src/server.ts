import express, { type Request, type Response } from "express";
import { apiRoutes } from "./modules/auth/auth.route";

const app = express()
const port = 3000

app.get('/', (req : Request, res: Response) => {
  res.send('Hello World!')
})

app.use("/api/auth/singup", apiRoutes);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

