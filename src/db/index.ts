import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "luckydraw",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 죽은 소켓을 붙잡고 무한 대기하는 걸 막는다. 현장에서 "무한로딩" 나던 원인 중 하나.
  // ponytail: mysql2 는 쿼리 단위 타임아웃이 없다. keepalive 로 죽은 커넥션을 걷어내는 게
  //           전부이고, 그래도 매달리면 라우트 쪽에서 잘라야 한다.
  connectTimeout: 10_000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10_000,
});

export const db = drizzle(poolConnection, { schema, mode: "default" });

/** db.transaction 콜백이 넘겨주는 트랜잭션 핸들 */
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
