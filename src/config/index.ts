import dotenv from "dotenv";
import path from "path";

// console.log("CWD:", process.cwd());

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

interface Iconfig {
  connection_string: string | undefined;
  port: string | undefined;
  secret: string,
  token_expiration: string,
}

const config: Iconfig = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET as string,
  token_expiration: process.env.JWT_EXPIRES_IN as string,
};

export default config;
