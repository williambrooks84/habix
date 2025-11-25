// scripts/setup-database.ts

//Commande d'exécution: npx tsx scripts/setup-database.ts

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

    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Default categories
    await sql`
      INSERT INTO categories (name) VALUES
        ('Santé'), ('Productivité'), ('Loisirs'), ('Apprentissage')
      ON CONFLICT (name) DO NOTHING
    `;

    console.log('✅ Categories table created (or already exists)');

    // Create habits table
    await sql`
      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        motivation TEXT,
        period_start TIMESTAMP WITH TIME ZONE,
        period_end TIMESTAMP WITH TIME ZONE,
        frequency_type VARCHAR(50),
        frequency_config JSONB,
        next_run TIMESTAMPTZ,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    console.log('✅ Habits table created (or already exists)');

    // Ensure new columns exist (add them when table already existed)
    await sql`
      ALTER TABLE habits
        ADD COLUMN IF NOT EXISTS frequency_type VARCHAR(50),
        ADD COLUMN IF NOT EXISTS frequency_config JSONB,
        ADD COLUMN IF NOT EXISTS next_run TIMESTAMPTZ
    `;

    // Detect which source column exists ("frequence" or "frequency") and backfill accordingly

    const hasFrequency = (await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'habits' AND column_name = 'frequency'
      ) AS exists
    `)[0]?.exists;

    if (hasFrequency) {
      await sql`
        UPDATE habits
        SET frequency_type = CASE
          WHEN lower(coalesce(frequency,'')) LIKE '%tous les jours%' THEN 'daily'
          WHEN lower(coalesce(frequency,'')) LIKE '%1 fois par semaine%' OR lower(coalesce(frequency,'')) LIKE '%une fois par semaine%' THEN 'weekly'
          WHEN lower(coalesce(frequency,'')) LIKE '%plusieurs fois par semaine%' THEN 'weekly-multi'
          WHEN lower(coalesce(frequency,'')) LIKE '%1 fois par mois%' OR lower(coalesce(frequency,'')) LIKE '%une fois par mois%' THEN 'monthly'
          WHEN lower(coalesce(frequency,'')) LIKE '%plusieurs fois par mois%' THEN 'monthly-multi'
          ELSE 'custom'
        END
        WHERE frequency_type IS NULL AND frequency IS NOT NULL
      `;
      console.log('✅ Habits table backfilled from "frequency" column');
    } else {
      console.log('ℹ️ No source frequency column ("frequence" or "frequency") found — skipping backfill');
    }

    console.log('✅ Habits table backfilled successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }

  //drop frequency column
  await sql`ALTER TABLE habits DROP COLUMN IF EXISTS frequency`;

  console.log('✅ Legacy frequency columns dropped if they existed');
}

setupDatabase();