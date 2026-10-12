import mysql from "mysql2/promise";

const port = Number(process.env.DB_PORT ?? "3306");

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("DB_PORT must be a valid TCP port.");
}

declare global {
  var communityBoardMysqlPool: mysql.Pool | undefined;
}

export const pool =
  globalThis.communityBoardMysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port,
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "community_event_board",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "Z",
    charset: "utf8mb4"
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.communityBoardMysqlPool = pool;
}
