import {
  mysqlTable,
  serial,
  varchar,
  text,
  int,
  boolean,
  json,
  datetime,
  mysqlEnum,
} from 'drizzle-orm/mysql-core'

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const
export type SkillLevel = (typeof SKILL_LEVELS)[number]

// ─── Admin Users ────────────────────────────────────────────────────────────
export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: datetime('created_at').notNull().default(new Date()),
})

// ─── Projects ────────────────────────────────────────────────────────────────
export const projects = mysqlTable('projects', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  techStack: json('tech_stack').$type<string[]>().default([]),
  imageUrl: varchar('image_url', { length: 500 }),
  images: json('images').$type<string[]>().default([]),
  repoUrl: varchar('repo_url', { length: 500 }),
  liveUrl: varchar('live_url', { length: 500 }),
  isFeatured: boolean('is_featured').default(false),
  orderIndex: int('order_index').default(0),
  createdAt: datetime('created_at').notNull().default(new Date()),
})

// ─── Hard Skills ─────────────────────────────────────────────────────────────
export const hardSkills = mysqlTable('hard_skills', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  category: mysqlEnum('category', [
    'Frontend',
    'Backend',
    'Mobile',
    'DevOps',
    'Database',
    'Caching',
    'Other',
  ])
    .notNull()
    .default('Other'),
  level: mysqlEnum('level', SKILL_LEVELS).notNull().default('Intermediate'),
  iconUrl: varchar('icon_url', { length: 500 }),
  orderIndex: int('order_index').default(0),
})

// ─── Soft Skills ─────────────────────────────────────────────────────────────
export const softSkills = mysqlTable('soft_skills', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  orderIndex: int('order_index').default(0),
})

// ─── Tools ───────────────────────────────────────────────────────────────────
export const TOOL_CATEGORIES = ['Language', 'Framework', 'IDE', 'Design', 'DevOps', 'Browser', 'Productivity', 'Other'] as const
export type ToolCategory = (typeof TOOL_CATEGORIES)[number]

export const tools = mysqlTable('tools', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  category: mysqlEnum('category', TOOL_CATEGORIES).notNull().default('Other'),
  orderIndex: int('order_index').default(0),
})

// ─── Social Links ────────────────────────────────────────────────────────────
export const socialLinks = mysqlTable('social_links', {
  id: serial('id').primaryKey(),
  platform: varchar('platform', { length: 100 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  label: varchar('label', { length: 100 }),
  orderIndex: int('order_index').default(0),
})

// ─── Contact Messages ─────────────────────────────────────────────────────────
export const contactMessages = mysqlTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: datetime('created_at').notNull().default(new Date()),
})

// ─── Types ───────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type HardSkill = typeof hardSkills.$inferSelect
export type NewHardSkill = typeof hardSkills.$inferInsert
export type SoftSkill = typeof softSkills.$inferSelect
export type NewSoftSkill = typeof softSkills.$inferInsert
export type Tool = typeof tools.$inferSelect
export type NewTool = typeof tools.$inferInsert
export type SocialLink = typeof socialLinks.$inferSelect
export type NewSocialLink = typeof socialLinks.$inferInsert
export type ContactMessage = typeof contactMessages.$inferSelect
export type NewContactMessage = typeof contactMessages.$inferInsert
