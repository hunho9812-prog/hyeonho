"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Background from "@/components/Background";
import Navigation from "@/components/Navigation";

const DAYS = ["월", "화", "수", "목", "금"];
const TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30",
];

const ROW_H = 40;        // px per 30-min slot
const START_MIN = 9 * 60; // 09:00
const SLOTS = 20;
const TOTAL_H = ROW_H * SLOTS; // 800px

const COLORS = [
  { bg: "rgba(96, 165, 250, 0.15)",  border: "rgba(96, 165, 250, 0.5)",  text: "#93c5fd", label: "파랑" },
  { bg: "rgba(52, 211, 153, 0.15)",  border: "rgba(52, 211, 153, 0.5)",  text: "#6ee7b7", label: "초록" },
  { bg: "rgba(251, 113, 133, 0.15)", border: "rgba(251, 113, 133, 0.5)", text: "#fda4af", label: "빨강" },
  { bg: "rgba(251, 191, 36, 0.15)",  border: "rgba(251, 191, 36, 0.5)",  text: "#fcd34d", label: "노랑" },
  { bg: "rgba(167, 139, 250, 0.15)", border: "rgba(167, 139, 250, 0.5)", text: "#c4b5fd", label: "보라" },
  { bg: "rgba(251, 146, 60, 0.15)",  border: "rgba(251, 146, 60, 0.5)",  text: "#fdba74", label: "주황" },
];

interface ClassItem {
  id: number;
  name: string;
  professor: string;
  room: string;
  day: number;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  colorIndex: number;
}

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const toTime = (totalMin: number) => {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const emptyForm = {
  name: "",
  professor: "",
  room: "",
  day: 0,
  startTime: "09:00",
  endTime: "10:00",
  colorIndex: 0,
};

export default function TimetablePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [modal, setModal] = useState<Partial<ClassItem> | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hyeonho-timetable-v2");
    if (saved) setClasses(JSON.parse(saved));
  }, []);

  const save = (updated: ClassItem[]) => {
    setClasses(updated);
    localStorage.setItem("hyeonho-timetable-v2", JSON.stringify(updated));
  };

  const openAdd = (day: number, clickY: number) => {
    // snap to nearest 30-min slot
    const slot = Math.floor(clickY / ROW_H);
    const startMin = START_MIN + slot * 30;
    const endMin = Math.min(startMin + 60, START_MIN + SLOTS * 30);
    setModal({ ...emptyForm, day, startTime: toTime(startMin), endTime: toTime(endMin) });
    setIsNew(true);
  };

  const openEdit = (cls: ClassItem) => {
    setModal({ ...cls });
    setIsNew(false);
  };

  const handleSubmit = () => {
    if (!modal?.name?.trim()) return;
    if (toMin(modal.startTime!) >= toMin(modal.endTime!)) return;
    if (isNew) {
      save([...classes, { ...(modal as ClassItem), id: Date.now() }]);
    } else {
      save(classes.map((c) => (c.id === modal!.id ? (modal as ClassItem) : c)));
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (!modal?.id) return;
    save(classes.filter((c) => c.id !== modal.id));
    setModal(null);
  };

  const getClassStyle = (cls: ClassItem) => {
    const startOffset = toMin(cls.startTime) - START_MIN;
    const duration = toMin(cls.endTime) - toMin(cls.startTime);
    return {
      top: `${(startOffset / 30) * ROW_H}px`,
      height: `${(duration / 30) * ROW_H}px`,
    };
  };

  return (
    <main className="relative min-h-screen">
      <Background />
      <Navigation />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-2 inline-block"
            >
              ← 홈으로
            </Link>
            <h1 className="text-4xl font-bold text-white">📅 시간표</h1>
          </div>
          <p className="text-gray-500 text-sm">빈 칸을 클릭해서 수업을 추가하세요</p>
        </div>

        {/* Timetable */}
        <div
          className="rounded-2xl overflow-hidden overflow-x-auto"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(10,10,15,0.6)" }}
        >
          {/* Header row */}
          <div
            className="flex"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              minWidth: "560px",
            }}
          >
            <div style={{ width: 52, flexShrink: 0 }} className="py-3 text-center text-xs text-gray-500 border-r border-white/5">
              교시
            </div>
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex-1 py-3 text-center text-sm font-semibold text-gray-200 border-r border-white/5"
              >
                {day}
              </div>
            ))}
            <div style={{ width: 64, flexShrink: 0 }} className="py-3 text-center text-xs text-gray-500">
              시간
            </div>
          </div>

          {/* Grid body */}
          <div className="flex" style={{ minWidth: "560px" }}>
            {/* Left: period numbers */}
            <div style={{ width: 52, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.05)" }}>
              {TIMES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: ROW_H,
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "#6366f1",
                    background: "rgba(99,102,241,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((_, dIdx) => (
              <div
                key={dIdx}
                className="flex-1"
                style={{
                  position: "relative",
                  height: TOTAL_H,
                  borderRight: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {/* Grid lines */}
                {TIMES.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      top: i * ROW_H,
                      left: 0,
                      right: 0,
                      height: ROW_H,
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  />
                ))}

                {/* Clickable background */}
                <div
                  style={{ position: "absolute", inset: 0, zIndex: 1 }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    openAdd(dIdx, e.clientY - rect.top);
                  }}
                />

                {/* Class blocks */}
                {classes
                  .filter((c) => c.day === dIdx)
                  .map((cls) => {
                    const { top, height } = getClassStyle(cls);
                    const color = COLORS[cls.colorIndex % COLORS.length];
                    return (
                      <div
                        key={cls.id}
                        onClick={(e) => { e.stopPropagation(); openEdit(cls); }}
                        style={{
                          position: "absolute",
                          top,
                          height,
                          left: 2,
                          right: 2,
                          zIndex: 2,
                          background: color.bg,
                          border: `1px solid ${color.border}`,
                          borderLeft: `3px solid ${color.border}`,
                          borderRadius: 6,
                          padding: "4px 6px",
                          cursor: "pointer",
                          overflow: "hidden",
                        }}
                        className="hover:brightness-125 transition-all"
                      >
                        <div style={{ color: color.text, fontWeight: 700, fontSize: "0.75rem", lineHeight: 1.3 }}>
                          {cls.name}
                        </div>
                        {cls.professor && (
                          <div style={{ color: "#94a3b8", fontSize: "0.65rem", marginTop: 1 }}>{cls.professor}</div>
                        )}
                        {cls.room && (
                          <div style={{ color: "#64748b", fontSize: "0.62rem" }}>{cls.room}</div>
                        )}
                        <div style={{ color: "#475569", fontSize: "0.6rem", marginTop: 2 }}>
                          {cls.startTime}–{cls.endTime}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}

            {/* Right: time labels */}
            <div style={{ width: 64, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
              {TIMES.map((t, i) => (
                <div
                  key={i}
                  style={{
                    height: ROW_H,
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    fontSize: "0.68rem",
                    color: "#475569",
                    background: "rgba(255,255,255,0.01)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setModal(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative glass-card rounded-3xl p-8 w-full max-w-sm"
            style={{ border: "1px solid rgba(139,92,246,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {isNew ? "수업 추가" : "수업 수정"}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">과목명 *</label>
                <input
                  autoFocus
                  type="text"
                  value={modal.name ?? ""}
                  onChange={(e) => setModal({ ...modal, name: e.target.value })}
                  placeholder="예: 에너지 열역학"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              {/* Professor + Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">교수님</label>
                  <input
                    type="text"
                    value={modal.professor ?? ""}
                    onChange={(e) => setModal({ ...modal, professor: e.target.value })}
                    placeholder="홍길동 교수"
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">강의실</label>
                  <input
                    type="text"
                    value={modal.room ?? ""}
                    onChange={(e) => setModal({ ...modal, room: e.target.value })}
                    placeholder="공학관 301"
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              </div>

              {/* Day + Time */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">요일</label>
                  <select
                    value={modal.day ?? 0}
                    onChange={(e) => setModal({ ...modal, day: Number(e.target.value) })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">시작 시간</label>
                  <input
                    type="time"
                    value={modal.startTime ?? "09:00"}
                    onChange={(e) => setModal({ ...modal, startTime: e.target.value })}
                    min="09:00"
                    max="18:30"
                    className="w-full rounded-xl px-2 py-2.5 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", colorScheme: "dark" }}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">종료 시간</label>
                  <input
                    type="time"
                    value={modal.endTime ?? "10:00"}
                    onChange={(e) => setModal({ ...modal, endTime: e.target.value })}
                    min="09:00"
                    max="19:00"
                    className="w-full rounded-xl px-2 py-2.5 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", colorScheme: "dark" }}
                  />
                </div>
              </div>

              {modal.startTime && modal.endTime && toMin(modal.startTime) >= toMin(modal.endTime) && (
                <p className="text-red-400 text-xs">종료 시간이 시작 시간보다 늦어야 합니다.</p>
              )}

              {/* Color */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">색상</label>
                <div className="flex gap-2">
                  {COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setModal({ ...modal, colorIndex: i })}
                      className="w-8 h-8 rounded-full transition-all hover:scale-110"
                      style={{
                        background: c.border,
                        outline: modal.colorIndex === i ? "2px solid white" : "none",
                        outlineOffset: "2px",
                      }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              {!isNew && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
                >
                  삭제
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!modal.name?.trim() || !modal.startTime || !modal.endTime || toMin(modal.startTime) >= toMin(modal.endTime)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
              >
                {isNew ? "추가" : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
