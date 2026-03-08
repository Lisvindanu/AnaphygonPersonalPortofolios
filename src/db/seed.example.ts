import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { sql } from 'drizzle-orm'
import { hashPassword as hash } from '../lib/crypto.server'
import * as schema from './schema'

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'anaphygon_portfolio',
})

const db = drizzle(pool, { schema, mode: 'default' })

async function seed() {
  console.log('Seeding database...')

  // Admin user
  const passwordHash = await hash(process.env.ADMIN_PASSWORD ?? 'change_me')
  await db
    .insert(schema.users)
    .values({ username: process.env.ADMIN_USERNAME ?? 'admin', passwordHash })
    .onDuplicateKeyUpdate({ set: { username: process.env.ADMIN_USERNAME ?? 'admin', passwordHash } })

  // Sample hard skills
  await db.insert(schema.hardSkills).values([
    { name: 'React', category: 'Frontend', level: 'Advanced', orderIndex: 1 },
    { name: 'TypeScript', category: 'Frontend', level: 'Advanced', orderIndex: 2 },
    { name: 'Tailwind CSS', category: 'Frontend', level: 'Expert', orderIndex: 3 },
    { name: 'Node.js', category: 'Backend', level: 'Intermediate', orderIndex: 4 },
    { name: 'MySQL', category: 'Database', level: 'Intermediate', orderIndex: 5 },
    { name: 'React Native', category: 'Mobile', level: 'Advanced', orderIndex: 6 },
  ]).onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } })

  // Sample soft skills
  await db.insert(schema.softSkills).values([
    { name: 'Problem Solving', description: 'Methodical approach to breaking down complex problems step by step.', orderIndex: 1 },
    { name: 'Adaptability', description: 'Comfortable learning new technologies and adjusting to change quickly.', orderIndex: 2 },
    { name: 'Self-Driven', description: 'Learning and building independently, even through failure.', orderIndex: 3 },
    { name: 'Attention to Detail', description: 'Care for clean code, consistent design, and thoughtful UX.', orderIndex: 4 },
  ]).onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } })

  console.log('Seed complete.')
  await pool.end()
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
