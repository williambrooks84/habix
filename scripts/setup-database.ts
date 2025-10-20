// scripts/setup-database.ts
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env (not .env.local)
dotenv.config({ path: resolve(__dirname, '../.env') });

async function setupDatabase() {
  // Check if DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    console.log('Please check your .env file contains DATABASE_URL');
    process.exit(1);
  }

  console.log('📡 Connecting to database...');
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🚀 Creating database tables...');

    // Drop column if exists
    //await sql`ALTER TABLE users DROP COLUMN IF EXISTS is_verified`;

    // Create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    console.log('✅ Users table created successfully!');

    // Verify the table was created
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'users'
    `;

    if (result.length > 0) {
      console.log('✅ Users table verified and ready to use!');
    }

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

setupDatabase();