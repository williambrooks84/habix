import sql from './database'
import { Recommendation } from './definitions'

export async function getAllRecommendations(): Promise<Recommendation[]> {
    const rows = await sql`
    SELECT id, title, content FROM recommendations
  `

    return rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        content: r.content,
    }))
}

export async function getRecommendationById(id: number): Promise<Recommendation | null> {
    const rows = await sql`
    SELECT id, title, content FROM recommendations WHERE id = ${id}
    `
    if (!rows || rows.length === 0) return null
    const r = rows[0]
    return {
        id: r.id,
        title: r.title,
        content: r.content,
    }
}