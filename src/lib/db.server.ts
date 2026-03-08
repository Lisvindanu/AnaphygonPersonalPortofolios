import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '~/db/schema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) {
    const pool = mysql.createPool({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? 'password',
      database: process.env.DB_NAME ?? 'anaphygon_portfolio',
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 30,
      connectTimeout: 10000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      idleTimeout: 60000,
    })
    _db = drizzle(pool, { schema, mode: 'default' })
  }
  return _db
}
