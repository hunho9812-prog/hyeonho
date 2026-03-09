"use client";

import { useState, useEffect } from "react";
import Background from "@/components/Background";
import Navigation from "@/components/Navigation";
import { supabase } from "@/lib/supabase";
import { migrateCalendar } from "@/lib/migrate";

interface CalendarEvent {
  id: number;
  date: string; // "YYYY-MM-DD"
  text: string;
  color: string;
}

const EVENT_COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#f87171", "#fbbf24", "#fb923c"];
const MONTH_NAMES = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const DAY_NAMES = ["일","월","화","수","목","금","토"];

// ── 대한민국 공휴일 ──────────────────────────────────────────
const HOLIDAYS: Record<string, string> = {
  "01-01": "신정",
  "03-01": "삼일절",
  "05-01": "근로자의 날",
  "05-05": "어린이날",
  "06-06": "현충일",
  "08-15": "광복절",
  "10-03": "개천절",
  "10-09": "한글날",
  "12-25": "크리스마스",
  // 2025
  "2025-01-28": "설날",
  "2025-01-29": "설날 연휴",
  "2025-01-30": "설날 연휴",
  "2025-05-06": "어린이날 대체",
  "2025-05-15": "부처님오신날",
  "2025-10-05": "추석 연휴",
  "2025-10-06": "추석 연휴",
  "2025-10-07": "추석",
  "2025-10-08": "추석 연휴",
  // 2026
  "2026-02-17": "설날 연휴",
  "2026-02-18": "설날",
  "2026-02-19": "설날 연휴",
  "2026-02-20": "설날 대체",
  "2026-03-02": "삼일절 대체",
  "2026-05-24": "부처님오신날",
  "2026-09-24": "추석 연휴",
  "2026-09-25": "추석",
  "2026-09-26": "추석 연휴",
};

// ── 시험 기간 ────────────────────────────────────────────────
const EXAM_PERIODS = [
  { start: "2026-04-13", end: "2026-04-17", label: "중간고사", bg: "rgba(251,146,60,0.18)", border: "rgba(251,146,60,0.5)", text: "#fb923c" },
  { start: "2026-06-15", end: "2026-06-19", label: "기말고사", bg: "rgba(251,113,133,0.18)", border: "rgba(251,113,133,0.5)", text: "#f87171" },
];

function dateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function getHoliday(ds: string): string | null {
  if (HOLIDAYS[ds]) return HOLIDAYS[ds];
  const mmdd = ds.slice(5);
  return HOLIDAYS[mmdd] ?? null;
}

function getExamPeriod(ds: string) {
  return EXAM_PERIODS.find((ep) => ds >= ep.start && ds <= ep.end) ?? null;
}

export default function CalendarPage() {
  const todayObj = new Date();
  const todayStr = dateStr(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate());

  const [year, setYear] = useState(todayObj.getFullYear());
  const [month, setMonth] = useState(todayObj.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selected, setSelected] = useState<string>(todayStr);
  const [inputText, setInputText] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── 초기 로드: 마이그레이션 후 Supabase에서 불러오기 ──
  useEffect(() => {
    async function init() {
      await migrateCalendar();
      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .order("id");
      if (data) {
        setEvents(data as CalendarEvent[]);
      }
      setLoading(false);
    }
    init();
  }, []);

  // ── Realtime: 다른 기기에서 변경 시 자동 반영 ──
  useEffect(() => {
    const channel = supabase
      .channel("realtime:calendar_events")
      .on("postgres_changes", { event: "*", schema: "public", table: "calendar_events" }, async () => {
        const { data } = await supabase
          .from("calendar_events")
          .select("*")
          .order("id");
        if (data) setEvents(data as CalendarEvent[]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addEvent = async () => {
    if (!inputText.trim()) return;
    const newEvent: CalendarEvent = {
      id: Date.now(),
      date: selected,
      text: inputText.trim(),
      color: EVENT_COLORS[colorIdx],
    };
    setEvents((prev) => [...prev, newEvent]);
    setInputText("");
    await supabase.from("calendar_events").insert({
      id: newEvent.id,
      date: newEvent.date,
      text: newEvent.text,
      color: newEvent.color,
    });
  };

  const deleteEvent = async (id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await supabase.from("calendar_events").delete().eq("id", id);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const selectedEvents = events.filter((e) => e.date === selected);
  const selectedHoliday = getHoliday(selected);
  const selectedExam = getExamPeriod(selected);

  const selectedObj = new Date(selected + "T00:00:00");
  const displaySelected = `${selectedObj.getMonth() + 1}월 ${selectedObj.getDate()}일 (${DAY_NAMES[selectedObj.getDay()]})`;

  return (
    <main className="relative min-h-screen">
      <Background />
      <Navigation />
      <div className="relative z-10 flex flex-col items-center px-4 pt-28 pb-16">

        {/* ── Centered header ── */}
        <div className="text-center mb-8 w-full max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-3">📆 달력</h1>
          <p className="text-gray-400 text-sm">월별 캘린더로 일정을 확인하고 날짜별 메모를 기록하세요</p>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(251,146,60,0.4)", border: "1px solid rgba(251,146,60,0.7)" }} />
              <span className="text-orange-400">중간고사 (4/13~17)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(251,113,133,0.4)", border: "1px solid rgba(251,113,133,0.7)" }} />
              <span className="text-red-400">기말고사 (6/15~19)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "#f87171" }} />
              <span className="text-gray-400">공휴일</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-gray-500 text-sm">불러오는 중...</div>
          </div>
        ) : (
        /* ── Centered content ── */
        <div className="w-full max-w-6xl">
        <div className="grid xl:grid-cols-4 md:grid-cols-3 gap-6">
          {/* Calendar */}
          <div
            className="xl:col-span-3 md:col-span-2 rounded-2xl p-6"
            style={{ background: "rgba(10,10,15,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {/* Month nav */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                style={{ minWidth: 44, minHeight: 44, touchAction: "manipulation" }}
                className="rounded-xl text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-2xl transition-all active:scale-90"
              >
                ‹
              </button>
              <h2 className="text-xl font-bold text-white">
                {year}년 {MONTH_NAMES[month]}
              </h2>
              <button
                onClick={nextMonth}
                style={{ minWidth: 44, minHeight: 44, touchAction: "manipulation" }}
                className="rounded-xl text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-2xl transition-all active:scale-90"
              >
                ›
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map((d, i) => (
                <div
                  key={d}
                  className={`text-center text-xs font-bold py-2 ${
                    i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-500"
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`pad${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const ds = dateStr(year, month, d);
                const dayEvents = events.filter((e) => e.date === ds);
                const isToday = ds === todayStr;
                const isSel = ds === selected;
                const dow = (firstDay + i) % 7;
                const holiday = getHoliday(ds);
                const exam = getExamPeriod(ds);
                const isHoliday = !!holiday || dow === 0;

                let bg = "transparent";
                let border = "1px solid transparent";
                if (isSel) {
                  bg = "rgba(124,58,237,0.35)";
                  border = "1px solid rgba(124,58,237,0.7)";
                } else if (exam) {
                  bg = exam.bg;
                  border = `1px solid ${exam.border}`;
                } else if (isToday) {
                  bg = "rgba(124,58,237,0.12)";
                  border = "1px solid rgba(124,58,237,0.3)";
                }

                return (
                  <button
                    key={d}
                    onClick={() => setSelected(ds)}
                    style={{ minHeight: 64, background: bg, border, touchAction: "manipulation" }}
                    className="rounded-xl p-1 flex flex-col items-center transition-all active:scale-95 hover:brightness-125"
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color: isToday
                          ? "#a78bfa"
                          : isHoliday
                          ? "#f87171"
                          : dow === 6
                          ? "#93c5fd"
                          : "#d1d5db",
                      }}
                    >
                      {d}
                    </span>

                    {holiday && (
                      <span
                        className="text-center leading-tight mt-0.5"
                        style={{ fontSize: 9, color: "#fca5a5", lineHeight: 1.2 }}
                      >
                        {holiday}
                      </span>
                    )}

                    {exam && ds === exam.start && (
                      <span
                        className="rounded px-0.5 mt-0.5"
                        style={{ fontSize: 8, background: exam.bg, color: exam.text, border: `1px solid ${exam.border}` }}
                      >
                        {exam.label}
                      </span>
                    )}

                    {dayEvents.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <div key={ev.id} className="w-1.5 h-1.5 rounded-full" style={{ background: ev.color }} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event sidebar */}
          <div
            className="rounded-2xl p-5 flex flex-col min-h-[400px]"
            style={{ background: "rgba(10,10,15,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h3 className="text-base font-bold text-white mb-1">{displaySelected}</h3>

            {selectedHoliday && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-2 self-start"
                style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.35)", color: "#fca5a5" }}
              >
                🎌 {selectedHoliday}
              </div>
            )}

            {selectedExam && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-2 self-start"
                style={{ background: selectedExam.bg, border: `1px solid ${selectedExam.border}`, color: selectedExam.text }}
              >
                📝 {selectedExam.label} 기간
              </div>
            )}

            <div className="border-t border-white/5 mt-1 mb-3" />

            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEvent()}
              placeholder="일정 추가..."
              style={{
                fontSize: 16,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              className="w-full rounded-xl px-3 py-3 text-sm text-white outline-none mb-2"
            />

            <div className="flex gap-2 mb-3">
              {EVENT_COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setColorIdx(i)}
                  style={{
                    background: c,
                    width: 28,
                    height: 28,
                    outline: colorIdx === i ? "2px solid white" : "none",
                    outlineOffset: 2,
                    touchAction: "manipulation",
                  }}
                  className="rounded-full transition-all active:scale-90 hover:scale-110"
                />
              ))}
            </div>

            <button
              onClick={addEvent}
              style={{
                background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                minHeight: 44,
                touchAction: "manipulation",
              }}
              className="w-full rounded-xl text-sm font-semibold text-white mb-4 transition-all active:scale-95 hover:opacity-90"
            >
              + 추가
            </button>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {selectedEvents.length === 0 ? (
                <p className="text-gray-600 text-xs text-center py-8">일정 없음</p>
              ) : (
                selectedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                    style={{ background: "rgba(255,255,255,0.04)", borderLeft: `3px solid ${ev.color}` }}
                  >
                    <span className="flex-1 text-sm text-gray-200 break-all">{ev.text}</span>
                    <button
                      onClick={() => deleteEvent(ev.id)}
                      style={{ minWidth: 32, minHeight: 32, touchAction: "manipulation" }}
                      className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        </div>
        )}
      </div>
    </main>
  );
}
