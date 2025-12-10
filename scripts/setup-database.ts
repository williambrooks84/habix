import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env (not .env.local)
const __dirname = fileURLToPath(new URL('.', import.meta.url));
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

    // Add profile_picture column if it doesn't exist
    await sql`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS profile_picture TEXT
    `;

    console.log('✅ Profile picture column added (or already exists)');

    // Minimal points support: points column (default 0)
    await sql`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 0
    `;

    // Add is_admin column if it doesn't exist
    await sql`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false
    `;

    console.log('✅ Admin column created (or already exists). Removed point_events table.');

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
        ADD COLUMN IF NOT EXISTS next_run TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS color VARCHAR(32)
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

  // Create habit_runs table to track per-day completions
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS habit_runs (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        run_date DATE NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        notes TEXT,
        UNIQUE(habit_id, run_date)
      )
    `;

    // Helpful index for queries by date
    await sql`CREATE INDEX IF NOT EXISTS idx_habit_runs_run_date ON habit_runs (run_date)`;

    // Ensure created_at exists for compatibility with RETURNING clauses
    await sql`
      ALTER TABLE habit_runs
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `;

    console.log('✅ habit_runs table created (or already exists)');
  } catch (err) {
    console.error('❌ Error creating habit_runs table:', err);
    process.exit(1);
  }

  console.log('✅ Legacy frequency columns dropped if they existed');

  //Create recommendations table
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS recommendations (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
  } catch (err) {
    console.error('❌ Error creating recommendations table:', err);
    process.exit(1);
  }

  console.log('✅ recommendations table created (or already exists)');

  // Insert default recommendations if table is empty 
  try {
    await sql`
      INSERT INTO recommendations (title, content) VALUES
        ('Boire 2L d''eau par jour', 'L''hydratation est essentielle pour le bon fonctionnement de votre corps. Essayez de boire régulièrement tout au long de la journée.'),
        ('Méditer 10 minutes chaque matin', 'La méditation matinale aide à réduire le stress et améliore la concentration pour toute la journée.'),
        ('Faire 30 minutes d''exercice', 'L''activité physique régulière renforce votre santé cardiovasculaire et améliore votre humeur.'),
        ('Lire 20 pages par jour', 'La lecture quotidienne stimule votre cerveau, améliore votre vocabulaire et réduit le stress.'),
        ('Écrire dans un journal', 'Tenir un journal aide à clarifier vos pensées, gérer vos émotions et suivre votre évolution personnelle.'),
        ('Dormir 8 heures par nuit', 'Un sommeil suffisant est crucial pour la récupération physique et mentale, ainsi que pour la concentration.'),
        ('Apprendre 10 nouveaux mots dans une langue étrangère', 'L''apprentissage régulier d''une langue stimule votre cerveau et ouvre de nouvelles opportunités.'),
        ('Pratiquer la gratitude', 'Notez 3 choses pour lesquelles vous êtes reconnaissant chaque jour pour améliorer votre bien-être mental.'),
        ('Faire son lit chaque matin', 'Commencer la journée par une petite victoire crée un élan positif pour le reste de la journée.'),
        ('Prendre les escaliers au lieu de l''ascenseur', 'Cette petite habitude augmente votre activité physique quotidienne sans effort supplémentaire.'),
        ('Manger 5 fruits et légumes par jour', 'Une alimentation riche en fruits et légumes fournit les vitamines et minéraux essentiels à votre santé.'),
        ('Se déconnecter des écrans 1h avant le coucher', 'Réduire l''exposition à la lumière bleue améliore la qualité de votre sommeil.'),
        ('Faire des étirements le matin', '10 minutes d''étirements au réveil améliorent votre flexibilité et réduisent les tensions musculaires.'),
        ('Appeler un proche chaque semaine', 'Maintenir des liens sociaux réguliers est essentiel pour votre bien-être émotionnel.'),
        ('Planifier sa journée la veille', 'Préparer votre journée à l''avance réduit le stress et améliore votre productivité.'),
        ('Pratiquer une activité créative', 'Dessiner, peindre ou jouer d''un instrument stimule votre créativité et réduit le stress.'),
        ('Faire une promenade de 15 minutes', 'Une courte marche quotidienne améliore votre humeur et votre santé cardiovasculaire.'),
        ('Limiter le café à 2 tasses par jour', 'Réduire la consommation de caféine améliore la qualité du sommeil et réduit l''anxiété.'),
        ('Écouter un podcast éducatif', 'Apprendre de nouvelles choses pendant vos trajets ou pauses enrichit vos connaissances.'),
        ('Ranger son espace de travail chaque soir', 'Un environnement organisé favorise la concentration et réduit le stress au quotidien.')
      ON CONFLICT DO NOTHING
    `;
    console.log('✅ Default recommendations inserted successfully!');
  } catch (err) {
    console.error('❌ Error inserting recommendations:', err);
    process.exit(1);
  }

  // Create badges table
  await sql`
    CREATE TABLE IF NOT EXISTS badges (
      id VARCHAR(32) PRIMARY KEY,
      name VARCHAR(64) NOT NULL,
      description TEXT NOT NULL,
      points_required INTEGER NOT NULL
    )
  `;

  console.log('✅ Badges table created (or already exists)');

  // Insert default badges
  await sql`
    INSERT INTO badges (id, name, description, points_required) VALUES
      ('bronze',   'Bronze',   '5 points',      5),
      ('silver',   'Argent',   '10 points',     10),
      ('gold',     'Or',       '25 points',     25),
      ('platinum', 'Platine',  '50 points',     50),
      ('diamond',  'Diamant',  '100 points',    100),
      ('master',   'Maître',   '250 points',    250),
      ('legend',   'Légende',  '500 points',    500),
      ('mythic',   'Mythique', '1000 points',   1000)
    ON CONFLICT (id) DO NOTHING
  `;

  console.log('✅ Default badges inserted');

  // Create user_badges join table
  await sql`
    CREATE TABLE IF NOT EXISTS user_badges (
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      badge_id VARCHAR(32) REFERENCES badges(id) ON DELETE CASCADE,
      awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, badge_id)
    )
  `;

  console.log('✅ user_badges table created (or already exists)');
}

setupDatabase();

//npx ts-node scripts/setup-database.ts