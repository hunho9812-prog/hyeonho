"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Background from "@/components/Background";

const DAYS = ["월", "화", "수", "목", "금"];
const PERIODS = Array.from({ length: 20 }, (_, i) => i + 1);
const TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30",
];

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
  startPeriod: number;
  endPeriod: number;
  colorIndex: number;
}

const emptyForm = {
  name: "",
  professor: "",
  room: "",
  day: 0,
  startPeriod: 1,
  endPeriod: 2,
  colorIndex: 0,
};

export default function TimetablePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [modal, setModal] = useState<Partial<ClassItem> | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hyeonho-timetable");
    if (saved) setClasses(JSON.parse(saved));
  }, []);

  const save = (updated: ClassItem[]) => {
    setClasses(updated);
    localStorage.setItem("hyeonho-timetable", JSON.stringify(updated));
  };

  const openAdd = (day: number, period: number) => {
    setModal({ ...emptyForm, day, startPeriod: period, endPeriod: Math.min(period + 1, 10) });
    setIsNew(true);
  };

  const openEdit = (cls: ClassItem) => {
    setModal({ ...cls });
    setIsNew(false);
  };

  const handleSubmit = () => {
    if (!modal?.name?.trim()) return;
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

  // Build timetable cells with rowspan
  const renderRows = () => {
    const skipped = new Set<string>();

    return PERIODS.map((period, pIdx) => {
      const cells: React.ReactNode[] = [];

      for (let dIdx = 0; dIdx < DAYS.length; dIdx++) {
        const key = `${dIdx}-${period}`;
        if (skipped.has(key)) continue;

        const cls = classes.find((c) => c.day === dIdx && c.startPeriod === period);
        if (cls) {
          const span = cls.endPeriod - cls.startPeriod + 1;
          for (let p = period + 1; p <= cls.endPeriod; p++) {
            skipped.add(`${dIdx}-${p}`);
          }
          const color = COLORS[cls.colorIndex % COLORS.length];
          cells.push(
            <td
              key={key}
              rowSpan={span}
              onClick={() => openEdit(cls)}
              style={{
                background: color.bg,
                borderColor: "rgba(255,255,255,0.06)",
                cursor: "pointer",
                verticalAlign: "top",
                padding: "6px 10px 6px 14px",
                position: "relative",
                overflow: "hidden",
              }}
              className="border hover:brightness-125 transition-all"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
                style={{ background: color.border }}
              />
              <div style={{ color: color.text, fontWeight: 700, fontSize: "0.8rem", marginBottom: "2px" }}>
                {cls.name}
              </div>
              {cls.professor && (
                <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>{cls.professor}</div>
              )}
              {cls.room && (
                <div style={{ color: "#64748b", fontSize: "0.68rem" }}>{cls.room}</div>
              )}
            </td>
          );
        } else {
          cells.push(
            <td
              key={key}
              onClick={() => openAdd(dIdx, period)}
              style={{ borderColor: "rgba(255,255,255,0.06)", cursor: "pointer", height: "40px", maxHeight: "40px" }}
              className="border hover:bg-white/5 transition-colors"
            />
          );
        }
      }

      return (
        <tr key={period} style={{ height: "40px", maxHeight: "40px" }}>
          {/* Period label */}
          <td
            className="border text-center select-none"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              width: "52px",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#6366f1",
              background: "rgba(99,102,241,0.06)",
            }}
          >
            {period}
          </td>
          {cells}
          {/* Time label */}
          <td
            className="border text-center select-none"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              width: "64px",
              fontSize: "0.7rem",
              color: "#475569",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {TIMES[pIdx]}
          </td>
        </tr>
      );
    });
  };

  return (
    <main className="relative min-h-screen">
      <Background />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-2 inline-block"
            >
              ← 홈으로
            </Link>
            <h1 className="text-3xl font-bold text-white">📅 시간표</h1>
          </div>
          <p className="text-gray-500 text-sm">빈 칸을 클릭해서 수업을 추가하세요</p>
        </div>

        {/* Timetable */}
        <div
          className="rounded-2xl overflow-hidden overflow-x-auto"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(10,10,15,0.6)" }}
        >
          <table className="w-full border-collapse" style={{ minWidth: "560px" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                <th
                  className="border py-3 text-xs font-medium"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "#475569", width: "52px" }}
                >
                  교시
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="border py-3 text-sm font-semibold"
                    style={{ borderColor: "rgba(255,255,255,0.06)", color: "#e2e8f0" }}
                  >
                    {day}
                  </th>
                ))}
                <th
                  className="border py-3 text-xs font-medium"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "#475569", width: "64px" }}
                >
                  시간
                </th>
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
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

              {/* Day + Period */}
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
                  <label className="text-xs text-gray-400 mb-1 block">시작</label>
                  <select
                    value={modal.startPeriod ?? 1}
                    onChange={(e) => setModal({ ...modal, startPeriod: Number(e.target.value) })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    {PERIODS.map((p) => <option key={p} value={p}>{TIMES[p - 1]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">종료</label>
                  <select
                    value={modal.endPeriod ?? 1}
                    onChange={(e) => setModal({ ...modal, endPeriod: Number(e.target.value) })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    {PERIODS.filter((p) => p >= (modal.startPeriod ?? 1)).map((p) => (
                      <option key={p} value={p}>{TIMES[p - 1]}</option>
                    ))}
                  </select>
                </div>
              </div>

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
                        outline: modal.colorIndex === i ? `2px solid white` : "none",
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
                disabled={!modal.name?.trim()}
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
