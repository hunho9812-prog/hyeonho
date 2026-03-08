-- ============================================================
-- Hyeonho App - Supabase Database Schema
-- Supabase SQL Editor에서 아래 SQL을 전체 복사해서 실행하세요.
-- ============================================================

-- ── Planner (To Do, 시간표, Brain Dump 등) ──────────────────
create table if not exists planner (
  date    text primary key,           -- "YYYY-MM-DD"
  data    jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ── Calendar Events (달력 일정) ────────────────────────────
create table if not exists calendar_events (
  id      bigint primary key,
  date    text not null,              -- "YYYY-MM-DD"
  text    text not null default '',
  color   text not null default '#60a5fa'
);

-- ── Timetable (강의 시간표) ────────────────────────────────
create table if not exists timetable (
  id          bigint primary key,
  name        text not null default '',
  professor   text not null default '',
  room        text not null default '',
  day         int  not null,          -- 0=일 ~ 6=토
  start_time  text not null default '',
  end_time    text not null default '',
  color_index int  not null default 0
);

-- ── Thoughts (글 작성 / 메모) ──────────────────────────────
create table if not exists thoughts (
  id          bigint primary key,
  title       text not null default '',
  body        text not null default '',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Row Level Security (RLS) ───────────────────────────────
-- anon key로 읽기/쓰기가 모두 가능하도록 설정합니다.
-- (개인 앱이므로 공개 정책 사용. 인증이 필요하면 별도 설정.)

alter table planner          enable row level security;
alter table calendar_events  enable row level security;
alter table timetable        enable row level security;
alter table thoughts         enable row level security;

-- 모든 사용자 허용 정책
create policy "allow all" on planner         for all using (true) with check (true);
create policy "allow all" on calendar_events for all using (true) with check (true);
create policy "allow all" on timetable       for all using (true) with check (true);
create policy "allow all" on thoughts        for all using (true) with check (true);

-- ── Realtime 활성화 ────────────────────────────────────────
-- 기기간 실시간 동기화를 위해 Realtime publication에 테이블 추가
alter publication supabase_realtime add table planner;
alter publication supabase_realtime add table calendar_events;
alter publication supabase_realtime add table timetable;
alter publication supabase_realtime add table thoughts;
