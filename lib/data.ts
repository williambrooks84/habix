import sql from '../src/app/lib/database'
import type { User as UserDef } from '../src/app/lib/definitions'
import * as bcrypt from 'bcryptjs'

export async function getUsers(): Promise<UserDef[]> {
  const rows = await sql`
    SELECT id, created_at, email, password_hash, first_name, last_name
    FROM users
    ORDER BY id DESC
  `

  return rows.map((u: any) => ({
    id: String(u.id),
    createdAt: u.created_at,
    email: u.email,
    password: u.password_hash,
    firstName: u.first_name,
    lastName: u.last_name,
  }))
}

export async function getUserById(id: number | string): Promise<UserDef | null> {
  const uid = typeof id === 'string' ? parseInt(id, 10) : id
  const rows = await sql`
    SELECT id, created_at, email, password_hash, first_name, last_name
    FROM users
    WHERE id = ${uid}
    LIMIT 1
  `
  if (rows.length === 0) return null
  const u = rows[0]
  return {
    id: String(u.id),
    createdAt: u.created_at,
    email: u.email,
    password: u.password_hash,
    firstName: u.first_name,
    lastName: u.last_name,
  }
}

export async function createUser(data: {
  email: string
  password: string
  firstName?: string
  lastName?: string
}): Promise<UserDef> {
  // hash the password before storing
  const hashedPassword = bcrypt.hashSync(data.password, 10)

  const rows = await sql`
    INSERT INTO users (email, password_hash, first_name, last_name)
    VALUES (${data.email}, ${hashedPassword}, ${data.firstName ?? ''}, ${data.lastName ?? ''})
    RETURNING id, created_at, email, password_hash, first_name, last_name
  `

  const u = rows[0]
  return {
    id: String(u.id),
    createdAt: u.created_at,
    email: u.email,
    password: u.password_hash,
    firstName: u.first_name,
    lastName: u.last_name,
  }
}