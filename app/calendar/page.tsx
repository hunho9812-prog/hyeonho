"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Background from "@/components/Background";

interface CalendarEvent {
  id: number;
  date: string; // "YYYY-MM-DD"
  text: string;
  color: string;
}

const EVENT_COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#f87171", "#fbbf24", "#fb923c"];

const MONTH_NAMES = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const DAY_NAMES = ["일","월","화","수","목","금","토"];

function dateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
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

  useEffect(() => {
    const saved = localStorage.getItem("hyeonho-calendar-v1");
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  const save = (updated: CalendarEvent[]) => {
    setEvents(updated);
    localStorage.setItem("hyeonho-calendar-v1", JSON.stringify(updated));
  };

  const addEvent = () => {
    if (!inputText.trim()) return;
    save([...events, { id: Date.now(), date: selected, text: inputText.trim(), color: EVENT_COLORS[colorIdx] }]);
    setInputText("");
  };

  const deleteEvent = (id: number) => save(events.filter((e) => e.id !== id));

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

  const selectedObj = new Date(selected + "T00:00:00");
  const displaySelected = `${selectedObj.getMonth() + 1}월 ${selectedObj.getDate()}일 (${DAY_NAMES[selectedObj.getDay()]})`;

  return (
    <main className="relative min-h-screen">
      <Background />
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-2 inline-block">
            ← 홈으로
          </Link>
          <h1 className="text-3xl font-bold text-white">📆 달력</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Calendar */}
          <div
            className="md:col-span-2 rounded-2xl p-6"
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
                return (
                  <button
                    key={d}
                    onClick={() => setSelected(ds)}
                    style={{
                      minHeight: 60,
                      background: isSel
                        ? "rgba(124,58,237,0.3)"
                        : isToday
                        ? "rgba(124,58,237,0.12)"
                        : "transparent",
                      border: isSel
                        ? "1px solid rgba(124,58,237,0.6)"
                        : isToday
                        ? "1px solid rgba(124,58,237,0.3)"
                        : "1px solid transparent",
                      touchAction: "manipulation",
                    }}
                    className="rounded-xl p-1 flex flex-col items-center transition-all active:scale-95 hover:bg-white/5"
                  >
                    <span
                      className={`text-sm font-medium ${
                        isToday
                          ? "text-purple-400"
                          : dow === 0
                          ? "text-red-400"
                          : dow === 6
                          ? "text-blue-400"
                          : "text-gray-300"
                      }`}
                    >
                      {d}
                    </span>
                    <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: ev.color }}
                        />
                      ))}
                    </div>
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
            <h3 className="text-base font-bold text-white mb-4">{displaySelected}</h3>

            {/* Add event input */}
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

            {/* Color picker */}
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

            {/* Add button */}
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

            {/* Events list */}
            <div className="flex-1 space-y-2 overflow-y-auto">
              {selectedEvents.length === 0 ? (
                <p className="text-gray-600 text-xs text-center py-8">일정 없음</p>
              ) : (
                selectedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderLeft: `3px solid ${ev.color}`,
                    }}
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
    </main>
  );
}
