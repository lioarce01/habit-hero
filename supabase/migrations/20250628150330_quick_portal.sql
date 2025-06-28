/*
  # Habit Hero Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `hero_class` (text)
      - `level` (integer)
      - `total_xp` (integer)
      - `power_stat` (integer)
      - `wisdom_stat` (integer)
      - `vitality_stat` (integer)
      - `spirit_stat` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `difficulty` (integer, 1-3)
      - `stat_type` (text)
      - `current_streak` (integer)
      - `best_streak` (integer)
      - `total_completions` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quest_completions`
      - `id` (uuid, primary key)
      - `quest_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `completed_at` (date)
      - `xp_gained` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid REFERENCES auth.users PRIMARY KEY,
  name text NOT NULL,
  hero_class text NOT NULL CHECK (hero_class IN ('warrior', 'mage', 'paladin', 'ranger')),
  level integer DEFAULT 1,
  total_xp integer DEFAULT 0,
  power_stat integer DEFAULT 10,
  wisdom_stat integer DEFAULT 10,
  vitality_stat integer DEFAULT 10,
  spirit_stat integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  difficulty integer NOT NULL CHECK (difficulty IN (1, 2, 3)),
  stat_type text NOT NULL CHECK (stat_type IN ('power', 'wisdom', 'vitality', 'spirit')),
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  total_completions integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quest completions table
CREATE TABLE IF NOT EXISTS quest_completions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  completed_at date DEFAULT CURRENT_DATE,
  xp_gained integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(quest_id, completed_at)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for quests table
CREATE POLICY "Users can manage own quests"
  ON quests
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for quest_completions table
CREATE POLICY "Users can manage own completions"
  ON quest_completions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at
  BEFORE UPDATE ON quests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();