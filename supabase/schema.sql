-- CrowdSphere / m-glow Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- ── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Venues ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venues (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'club' CHECK (type IN ('club','restaurant','event')),
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,
  address       TEXT NOT NULL,
  price_level   INTEGER NOT NULL DEFAULT 2 CHECK (price_level IN (1,2,3)),
  elegance      DOUBLE PRECISION DEFAULT 0.7,
  phone         TEXT,
  website       TEXT,
  tz            TEXT DEFAULT 'Asia/Kolkata',
  owner_user_id UUID,
  is_verified   BOOLEAN DEFAULT false,
  open_hours    TEXT,
  hero_image_url TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE venues DISABLE ROW LEVEL SECURITY;

-- ── Posts (live owner uploads) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id         UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  uploader_id      UUID,
  media_url        TEXT NOT NULL,
  thumb_url        TEXT,
  media_type       TEXT DEFAULT 'image' CHECK (media_type IN ('image','video')),
  has_faces        BOOLEAN DEFAULT false,
  faces_blurred    BOOLEAN DEFAULT true,
  faces_detected   INTEGER DEFAULT 0,
  status           TEXT DEFAULT 'approved' CHECK (status IN ('approved','pending','rejected')),
  moderation_flag  TEXT DEFAULT 'none' CHECK (moderation_flag IN ('none','nsfw','other')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  expires_at       TIMESTAMPTZ NOT NULL
);
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- ── Favorites ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL,
  venue_id   UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;

-- ── Crowd snapshots ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crowd_snapshots (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id  UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  level     TEXT NOT NULL DEFAULT 'none' CHECK (level IN ('quiet','moderate','busy','none')),
  score     DOUBLE PRECISION DEFAULT 0,
  at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE crowd_snapshots DISABLE ROW LEVEL SECURITY;

-- ── Chats ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chats (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id       UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  guest_user_id  UUID,
  status         TEXT DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  last_msg_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;

-- ── Messages ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id    UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  sender     TEXT NOT NULL CHECK (sender IN ('guest','owner','bot')),
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- ── FAQs ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faqs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id   UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  q_key      TEXT NOT NULL,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;

-- ── Events ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id    UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  start_at    TIMESTAMPTZ NOT NULL,
  end_at      TIMESTAMPTZ NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- ── Storage buckets (run separately if needed) ───────────────────────────────
-- In Supabase Dashboard → Storage → Create bucket:
--   1. "post-media"    (public: true)
--   2. "venue-photos"  (public: true)

-- ── Seed venues ──────────────────────────────────────────────────────────────
INSERT INTO venues (id, name, type, lat, lng, address, price_level, elegance, phone, tz, is_verified, open_hours, hero_image_url) VALUES
  ('00000000-0000-0000-0000-000000000001','Skybar Lounge','club',19.0760,72.8777,'BKC, Mumbai',3,0.9,'+91 98765 43210','Asia/Kolkata',true,'Today 7 PM - 2 AM','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'),
  ('00000000-0000-0000-0000-000000000002','The Underground','club',19.0728,72.8826,'Lower Parel, Mumbai',2,0.7,'+91 98765 43211','Asia/Kolkata',true,'Today 8 PM - 3 AM','https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop'),
  ('00000000-0000-0000-0000-000000000003','Rooftop Republic','restaurant',19.0896,72.8656,'Andheri West, Mumbai',2,0.8,'+91 98765 43212','Asia/Kolkata',true,'Today 6 PM - 1 AM','https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop'),
  ('00000000-0000-0000-0000-000000000004','Neon Nights','club',19.0544,72.8320,'Colaba, Mumbai',3,0.95,'+91 98765 43213','Asia/Kolkata',true,'Today 9 PM - 4 AM','https://images.unsplash.com/photo-1571266028243-d220c8b0b7b8?w=800&h=600&fit=crop'),
  ('00000000-0000-0000-0000-000000000005','Social House','restaurant',19.0330,72.8570,'Worli, Mumbai',2,0.6,'+91 98765 43214','Asia/Kolkata',true,'Today 5 PM - 12 AM','https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop'),
  ('00000000-0000-0000-0000-000000000006','Electric Dreams','club',19.1197,72.9081,'Powai, Mumbai',2,0.75,'+91 98765 43215','Asia/Kolkata',true,'Today 8 PM - 2 AM','https://images.unsplash.com/photo-1574391884720-bbc8673de6fa?w=800&h=600&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- ── Seed FAQs ─────────────────────────────────────────────────────────────────
INSERT INTO faqs (venue_id, q_key, question, answer) VALUES
  ('00000000-0000-0000-0000-000000000001','PARKING','Is parking available?','Yes, valet parking available after 7 PM. ₹200 for cars.'),
  ('00000000-0000-0000-0000-000000000001','COVER_CHARGE','What are the entry charges?','₹1500 weekdays, ₹2500 weekends'),
  ('00000000-0000-0000-0000-000000000001','HOURS','What are your hours?','Today 7 PM - 2 AM'),
  ('00000000-0000-0000-0000-000000000001','DRESS_CODE','What is the dress code?','Smart formal - no shorts, flip-flops or sportswear'),
  ('00000000-0000-0000-0000-000000000001','PAYMENT','What payment methods do you accept?','UPI, Cards, and Cash accepted'),
  ('00000000-0000-0000-0000-000000000002','PARKING','Is parking available?','Yes, valet parking available after 7 PM. ₹200 for cars.'),
  ('00000000-0000-0000-0000-000000000002','COVER_CHARGE','What are the entry charges?','₹800 weekdays, ₹1200 weekends'),
  ('00000000-0000-0000-0000-000000000002','HOURS','What are your hours?','Today 8 PM - 3 AM'),
  ('00000000-0000-0000-0000-000000000002','DRESS_CODE','What is the dress code?','Smart casual'),
  ('00000000-0000-0000-0000-000000000002','PAYMENT','What payment methods do you accept?','UPI, Cards, and Cash accepted')
ON CONFLICT DO NOTHING;
