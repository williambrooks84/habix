import { NextResponse } from 'next/server'
import { getAllCategories } from '../../lib/categories'

export async function GET() {
  try {
    const categories = await getAllCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
