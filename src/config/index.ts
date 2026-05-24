import dotenv from "dotenv";
import path from "path";

// console.log("CWD:", process.cwd());

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

interface Iconfig {
  connection_string: string | undefined;
  port: string | undefined;
}

const config: Iconfig = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
};

export default config;
