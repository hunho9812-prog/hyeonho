-- ============================================================
-- Supabase DB 스키마
-- Supabase 대시보드 > SQL Editor에서 이 스크립트를 실행하세요.
-- ============================================================

-- 1. Planner (일별 플래너)
CREATE TABLE IF NOT EXISTS planner (
  date    TEXT PRIMARY KEY,          -- "YYYY-MM-DD"
  data    JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 2. Calendar Events (캘린더 일정)
CREATE TABLE IF NOT EXISTS calendar_events (
  id      BIGINT PRIMARY KEY,
  date    TEXT   NOT NULL,           -- "YYYY-MM-DD"
  text    TEXT   NOT NULL,
  color   TEXT   NOT NULL
);

-- 3. Timetable (시간표)
CREATE TABLE IF NOT EXISTS timetable (
  id           BIGINT PRIMARY KEY,
  name         TEXT NOT NULL,
  professor    TEXT NOT NULL DEFAULT '',
  room         TEXT NOT NULL DEFAULT '',
  day          INT  NOT NULL,        -- 0=월 1=화 2=수 3=목 4=금
  start_time   TEXT NOT NULL,        -- "HH:MM"
  end_time     TEXT NOT NULL,        -- "HH:MM"
  color_index  INT  NOT NULL DEFAULT 0
);

-- 4. Thoughts (나의 생각)
CREATE TABLE IF NOT EXISTS thoughts (
  id          BIGINT       PRIMARY KEY,
  title       TEXT         NOT NULL,
  body        TEXT         NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ  NOT NULL,
  updated_at  TIMESTAMPTZ  NOT NULL
);

-- ============================================================
-- RLS (Row Level Security) 설정 - 개인 프로젝트용
-- anon key로 모든 CRUD 허용
-- ============================================================
ALTER TABLE planner          ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable        ENABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow all" ON planner         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON timetable       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON thoughts        FOR ALL USING (true) WITH CHECK (true);
