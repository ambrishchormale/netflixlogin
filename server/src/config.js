import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  corsOrigins: (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET || "change_this_jwt_secret",
  omdbApiKey: process.env.OMDB_API_KEY || "99b965e6",
  mysql: {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl: process.env.MYSQL_SSL === "false" ? undefined : { rejectUnauthorized: false },
  },
};
