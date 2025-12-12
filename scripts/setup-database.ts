import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  console.log('📡 Connecting to database...');
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🚀 Creating database schema...');

    // --------------------------
    // USERS TABLE
    // --------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        profile_picture TEXT,
        points INTEGER NOT NULL DEFAULT 0,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        is_blocked BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ users table created');

    // --------------------------
    // CATEGORIES TABLE
    // --------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ categories table created');

    await sql`
      INSERT INTO categories (name) VALUES
        ('Santé'), ('Productivité'), ('Loisirs'), ('Apprentissage')
      ON CONFLICT (name) DO NOTHING
    `;

    // --------------------------
    // HABITS TABLE
    // --------------------------
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
        color VARCHAR(32),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ habits table created');

    // --------------------------
    // HABIT RUNS TABLE
    // --------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS habit_runs (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        run_date DATE NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(habit_id, run_date)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_habit_runs_run_date ON habit_runs (run_date)`;
    console.log('✅ habit_runs table created');

    // --------------------------
    // RECOMMENDATIONS TABLE
    // --------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS recommendations (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ recommendations table created');

    await sql`
      INSERT INTO recommendations (title, content) VALUES
        ('Boire 2L d''eau par jour', 'L''hydratation est essentielle...'),
        ('Méditer 10 minutes chaque matin', 'La méditation aide à réduire le stress...'),
        ('Faire 30 minutes d''exercice', 'L''activité physique régulière...'),
        ('Lire 20 pages par jour', 'La lecture stimule votre cerveau...'),
        ('Écrire dans un journal', 'Tenir un journal aide à clarifier vos pensées...'),
        ('Dormir 8 heures par nuit', 'Un sommeil suffisant est essentiel...'),
        ('Apprendre des nouveaux mots', 'L''apprentissage régulier stimule votre cerveau...'),
        ('Pratiquer la gratitude', 'Notez 3 choses chaque jour...'),
        ('Faire son lit', 'Commencer la journée par une petite victoire...'),
        ('Prendre les escaliers', 'Une habitude simple pour augmenter l’activité physique...'),
        ('Manger 5 fruits et légumes', 'Une alimentation riche en vitamines...'),
        ('Se déconnecter avant de dormir', 'Réduire les écrans avant le coucher...'),
        ('Faire des étirements', 'Améliore la flexibilité...'),
        ('Appeler un proche', 'Maintenir les liens sociaux...'),
        ('Planifier sa journée', 'Aide à réduire le stress...'),
        ('Pratiquer une activité créative', 'Stimule votre créativité...'),
        ('Faire une promenade', 'Améliore l’humeur et la santé...'),
        ('Limiter le café', 'Réduit l’anxiété...'),
        ('Écouter un podcast éducatif', 'Enrichit vos connaissances...'),
        ('Ranger son espace de travail', 'Un espace ordonné améliore la concentration...')
      ON CONFLICT DO NOTHING
    `;
    console.log('✅ default recommendations inserted');

    // --------------------------
    // BADGES TABLE
    // --------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS badges (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(64) NOT NULL,
        description TEXT NOT NULL,
        points_required INTEGER NOT NULL
      )
    `;
    console.log('✅ badges table created');

    await sql`
      INSERT INTO badges (id, name, description, points_required) VALUES
        ('bronze', 'Bronze', '5 points', 5),
        ('silver', 'Argent', '10 points', 10),
        ('gold', 'Or', '25 points', 25),
        ('platinum', 'Platine', '50 points', 50),
        ('diamond', 'Diamant', '100 points', 100),
        ('master', 'Maître', '250 points', 250),
        ('legend', 'Légende', '500 points', 500),
        ('mythic', 'Mythique', '1000 points', 1000)
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✅ default badges inserted');

    // --------------------------
    // USER BADGES TABLE
    // --------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS user_badges (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        badge_id VARCHAR(32) REFERENCES badges(id) ON DELETE CASCADE,
        awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, badge_id)
      )
    `;
    console.log('✅ user_badges table created');

    // --------------------------
    // NOTIFICATIONS TABLE
    // --------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        body TEXT,
        data JSONB,
        read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✅ notifications table created');

    console.log('🎉 All database tables installed successfully!');

  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

setupDatabase();

//npx ts-node scripts/setup-database.ts