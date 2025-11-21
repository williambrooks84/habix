import sql from './database'
import { Category } from './definitions'

export async function getAllCategories(): Promise<Category[]> {
  const rows = await sql`
    SELECT id, name, created_at, updated_at
    FROM categories
    ORDER BY name ASC
  `

  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const rows = await sql`
    SELECT id, name, created_at, updated_at
    FROM categories
    WHERE id = ${id}
    LIMIT 1
  `
  if (!rows || rows.length === 0) return null
  const r = rows[0]
  return {
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}
