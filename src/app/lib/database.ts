import { neon } from '@neondatabase/serverless';
import { User, UserResponse } from '../types';

const sql = neon(process.env.DATABASE_URL!);

export default sql;

export function toUserResponse(row: any): UserResponse {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    createdAt: row.created_at,
  };
}