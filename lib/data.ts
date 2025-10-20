import prisma from './prisma'
import type { User as UserDef } from '../src/app/lib/definitions'
import * as bcrypt from 'bcryptjs'

export async function getUsers(): Promise<UserDef[]> {
  const users = await prisma.user.findMany({ orderBy: { id: 'desc' } })
  return users.map((u: any) => ({
    id: String(u.id),
    createdAt: u.createdAt,
    email: u.email,
    password: u.password,
    firstName: u.firstName,
    lastName: u.lastName,
  }))
}

export async function getUserById(id: number | string): Promise<UserDef | null> {
  const uid = typeof id === 'string' ? parseInt(id, 10) : id
  const u = await prisma.user.findUnique({ where: { id: uid } })
  if (!u) return null
  return {
    id: String(u.id),
    createdAt: u.createdAt,
    email: u.email,
    password: u.password,
    firstName: u.firstName,
    lastName: u.lastName,
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

  const u = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
    }
  })

  return {
    id: String(u.id),
    createdAt: u.createdAt,
    email: u.email,
    password: u.password,
    firstName: u.firstName,
    lastName: u.lastName,
  }
}