import { neon } from '@neondatabase/serverless';
import { User, UserResponse } from '../types';

const sql = neon(process.env.DATABASE_URL!);

export default sql;

// Helper to convert database row to UserResponse (removes password)
export function toUserResponse(row: any): UserResponse {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    isVerified: row.is_verified,
    createdAt: row.created_at,
  };
}