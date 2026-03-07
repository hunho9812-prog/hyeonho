/**
 * localStorage → Supabase DB 마이그레이션 유틸리티
 *
 * 각 페이지 로드 시 호출됩니다.
 * localStorage에 데이터가 있으면 Supabase DB로 업로드하고 localStorage를 삭제합니다.
 * 이후 모든 읽기/쓰기는 Supabase DB에서만 수행됩니다.
 */

import { supabase } from "./supabase";

// ─── 타입 정의 ─────────────────────────────────────────────
interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}

interface DayData {
  todos: TodoItem[];
  brainDump: TodoItem[];
  big3: [string, string, string];
  timeBlocks: Record<number, string>;
  vision: string;
  gratitude: string;
  feedStart: string;
  feedMid: string;
  feedEnd: string;
}

interface CalendarEvent {
  id: number;
  date: string;
  text: string;
  color: string;
}

interface ClassItem {
  id: number;
  name: string;
  professor: string;
  room: string;
  day: number;
  startTime: string;
  endTime: string;
  colorIndex: number;
}

interface Note {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Planner 병합 로직 ─────────────────────────────────────
// PC와 노트북 양쪽에 같은 날짜 데이터가 있을 경우 병합합니다.
function mergeDayData(existing: DayData, local: DayData): DayData {
  // todos / brainDump: id 기준 합집합
  const todoMap = new Map<number, TodoItem>();
  [...existing.todos, ...local.todos].forEach((t) => todoMap.set(t.id, t));

  const brainMap = new Map<number, TodoItem>();
  [...existing.brainDump, ...local.brainDump].forEach((t) =>
    brainMap.set(t.id, t)
  );

  // big3: 빈 항목이면 상대방 값 사용
  const big3: [string, string, string] = [
    existing.big3[0] || local.big3[0],
    existing.big3[1] || local.big3[1],
    existing.big3[2] || local.big3[2],
  ];

  // timeBlocks: 두 기기 값을 병합, 기존 DB 값 우선
  const timeBlocks: Record<number, string> = { ...local.timeBlocks };
  for (const [h, v] of Object.entries(existing.timeBlocks)) {
    if (v) timeBlocks[Number(h)] = v;
  }

  // 텍스트 필드: 더 긴(내용이 많은) 쪽 선택
  const pick = (a: string, b: string) => (a.length >= b.length ? a : b);

  return {
    todos: Array.from(todoMap.values()),
    brainDump: Array.from(brainMap.values()),
    big3,
    timeBlocks,
    vision: pick(existing.vision, local.vision),
    gratitude: pick(existing.gratitude, local.gratitude),
    feedStart: pick(existing.feedStart, local.feedStart),
    feedMid: pick(existing.feedMid, local.feedMid),
    feedEnd: pick(existing.feedEnd, local.feedEnd),
  };
}

// ─── Planner 마이그레이션 ───────────────────────────────────
export async function migratePlanner(): Promise<void> {
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith("hyeonho-planner-")
  );
  if (keys.length === 0) return;

  for (const key of keys) {
    const date = key.replace("hyeonho-planner-", "");
    let local: DayData;
    try {
      local = JSON.parse(localStorage.getItem(key)!);
    } catch {
      localStorage.removeItem(key);
      continue;
    }

    // Supabase에 기존 데이터가 있으면 병합
    const { data: existing } = await supabase
      .from("planner")
      .select("data")
      .eq("date", date)
      .maybeSingle();

    const finalData = existing ? mergeDayData(existing.data as DayData, local) : local;

    const { error } = await supabase
      .from("planner")
      .upsert({ date, data: finalData }, { onConflict: "date" });

    // upsert 성공 시에만 localStorage 삭제 (실패 시 데이터 보존)
    if (!error) {
      localStorage.removeItem(key);
    }
  }
}

// ─── Calendar 마이그레이션 ──────────────────────────────────
export async function migrateCalendar(): Promise<void> {
  const raw = localStorage.getItem("hyeonho-calendar-v1");
  if (!raw) return;

  let events: CalendarEvent[];
  try {
    events = JSON.parse(raw);
  } catch {
    localStorage.removeItem("hyeonho-calendar-v1");
    return;
  }

  if (events.length > 0) {
    // 기존 DB에 없는 id만 삽입 (중복 방지)
    const { error } = await supabase.from("calendar_events").upsert(
      events.map((e) => ({
        id: e.id,
        date: e.date,
        text: e.text,
        color: e.color,
      })),
      { onConflict: "id", ignoreDuplicates: true }
    );
    if (error) return; // 실패 시 localStorage 보존
  }

  localStorage.removeItem("hyeonho-calendar-v1");
}

// ─── Timetable 마이그레이션 ─────────────────────────────────
export async function migrateTimetable(): Promise<void> {
  const raw = localStorage.getItem("hyeonho-timetable-v3");
  if (!raw) return;

  let classes: ClassItem[];
  try {
    classes = JSON.parse(raw);
  } catch {
    localStorage.removeItem("hyeonho-timetable-v3");
    return;
  }

  if (classes.length > 0) {
    const { error } = await supabase.from("timetable").upsert(
      classes.map((c) => ({
        id: c.id,
        name: c.name,
        professor: c.professor,
        room: c.room,
        day: c.day,
        start_time: c.startTime,
        end_time: c.endTime,
        color_index: c.colorIndex,
      })),
      { onConflict: "id" }
    );
    if (error) return; // 실패 시 localStorage 보존
  }

  localStorage.removeItem("hyeonho-timetable-v3");
}

// ─── Thoughts 마이그레이션 ──────────────────────────────────
export async function migrateThoughts(): Promise<void> {
  const raw = localStorage.getItem("hyeonho-thoughts-v1");
  if (!raw) return;

  let notes: Note[];
  try {
    notes = JSON.parse(raw);
  } catch {
    localStorage.removeItem("hyeonho-thoughts-v1");
    return;
  }

  if (notes.length > 0) {
    const { error } = await supabase.from("thoughts").upsert(
      notes.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        created_at: n.createdAt,
        updated_at: n.updatedAt,
      })),
      { onConflict: "id", ignoreDuplicates: true }
    );
    if (error) return; // 실패 시 localStorage 보존
  }

  localStorage.removeItem("hyeonho-thoughts-v1");
}
