CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(80) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  age INTEGER NOT NULL CHECK (age BETWEEN 18 AND 100),
  occupation VARCHAR(120) NOT NULL,
  bio TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  move_in_date DATE NOT NULL,
  budget_min INTEGER NOT NULL CHECK (budget_min >= 0),
  budget_max INTEGER NOT NULL CHECK (budget_max >= budget_min),
  avatar_url TEXT NOT NULL,
  interests TEXT[] NOT NULL DEFAULT '{}',
  sleep_schedule SMALLINT NOT NULL CHECK (sleep_schedule BETWEEN 1 AND 5),
  cleanliness SMALLINT NOT NULL CHECK (cleanliness BETWEEN 1 AND 5),
  social_level SMALLINT NOT NULL CHECK (social_level BETWEEN 1 AND 5),
  noise_tolerance SMALLINT NOT NULL CHECK (noise_tolerance BETWEEN 1 AND 5),
  guest_frequency SMALLINT NOT NULL CHECK (guest_frequency BETWEEN 1 AND 5),
  smoking BOOLEAN NOT NULL DEFAULT FALSE,
  pets BOOLEAN NOT NULL DEFAULT FALSE,
  work_from_home BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swiper_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  swiped_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  decision VARCHAR(10) NOT NULL CHECK (decision IN ('like', 'pass')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (swiper_id, swiped_id),
  CHECK (swiper_id <> swiped_id)
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  compatibility_score NUMERIC(5,2) NOT NULL CHECK (compatibility_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_a_id, user_b_id),
  CHECK (user_a_id <> user_b_id)
);

CREATE INDEX IF NOT EXISTS users_city_idx ON users (LOWER(city));
CREATE INDEX IF NOT EXISTS users_budget_idx ON users (budget_min, budget_max);
CREATE INDEX IF NOT EXISTS swipes_swiper_idx ON swipes (swiper_id);

INSERT INTO users (
  id, name, email, age, occupation, bio, city, move_in_date,
  budget_min, budget_max, avatar_url, interests, sleep_schedule,
  cleanliness, social_level, noise_tolerance, guest_frequency,
  smoking, pets, work_from_home
) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Maya Patel', 'maya@example.com', 27, 'Product Designer',
   'Weekend hiker, amateur cook, and respectful roommate looking for a calm home base.', 'New York', '2026-08-01',
   1500, 2200, 'https://source.unsplash.com/900x900/?indian,woman,professional,portrait&sig=7',
   ARRAY['hiking','cooking','design','yoga'], 3, 5, 3, 2, 2, FALSE, TRUE, TRUE),
  ('22222222-2222-4222-8222-222222222222', 'Jordan Lee', 'jordan@example.com', 29, 'Software Engineer',
   'Early riser, coffee enthusiast, and tidy remote engineer who enjoys exploring the city.', 'New York', '2026-07-15',
   1600, 2300, 'https://source.unsplash.com/900x900/?indian,man,portrait,professional&sig=1',
   ARRAY['coffee','running','technology','cooking'], 2, 5, 3, 2, 2, FALSE, FALSE, TRUE),
  ('33333333-3333-4333-8333-333333333333', 'Sofia Martinez', 'sofia@example.com', 26, 'Marketing Strategist',
   'Friendly creative who loves live music, dinner parties, and keeping shared spaces welcoming.', 'New York', '2026-08-10',
   1400, 2100, 'https://source.unsplash.com/900x900/?indian,woman,portrait,professional&sig=2',
   ARRAY['music','art','cooking','travel'], 4, 4, 5, 4, 4, FALSE, FALSE, FALSE),
  ('44444444-4444-4444-8444-444444444444', 'Ethan Williams', 'ethan@example.com', 31, 'Financial Analyst',
   'Quiet, organized, and active. Usually at the gym after work and outdoors on weekends.', 'New York', '2026-09-01',
   1800, 2600, 'https://source.unsplash.com/900x900/?south-asian,man,portrait&sig=3',
   ARRAY['fitness','finance','hiking','reading'], 2, 5, 2, 1, 1, FALSE, FALSE, FALSE),
  ('55555555-5555-4555-8555-555555555555', 'Priya Shah', 'priya@example.com', 28, 'UX Researcher',
   'Curious researcher, plant parent, and vegetarian cook seeking a considerate roommate.', 'Boston', '2026-08-01',
   1300, 2000, 'https://source.unsplash.com/900x900/?indian,woman,portrait&sig=4',
   ARRAY['plants','cooking','design','reading'], 3, 4, 3, 2, 2, FALSE, FALSE, TRUE)
ON CONFLICT (email) DO NOTHING;
