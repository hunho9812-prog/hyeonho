"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Background from "@/components/Background";
import Navigation from "@/components/Navigation";
import { supabase } from "@/lib/supabase";
import { migratePlanner } from "@/lib/migrate";

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

const defaultDay = (): DayData => ({
  todos: [],
  brainDump: [],
  big3: ["", "", ""],
  timeBlocks: {},
  vision: "",
  gratitude: "",
  feedStart: "",
  feedMid: "",
  feedEnd: "",
});

const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5 ~ 23
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none";
const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.1)",
  fontSize: 16,
};
const cardStyle: React.CSSProperties = {
  background: "rgba(10,10,15,0.7)",
  border: "1px solid rgba(255,255,255,0.07)",
};

export default function TodoPage() {
  const [date, setDate] = useState(() => toDateStr(new Date()));
  const [data, setData] = useState<DayData>(defaultDay());
  const [todoInput, setTodoInput] = useState("");
  const [brainInput, setBrainInput] = useState("");
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const migratedRef = useRef(false);

  // ── Supabase 저장 (debounced) ──
  const persistToSupabase = useCallback(
    async (targetDate: string, updated: DayData) => {
      await supabase
        .from("planner")
        .upsert({ date: targetDate, data: updated }, { onConflict: "date" });
    },
    []
  );

  const save = useCallback(
    (updated: DayData, targetDate = date) => {
      setData(updated);
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        persistToSupabase(targetDate, updated);
      }, 500);
    },
    [date, persistToSupabase]
  );

  // ── 날짜별 데이터 로드 ──
  useEffect(() => {
    async function loadDate() {
      setLoading(true);

      // 최초 로드 시 localStorage → Supabase 마이그레이션
      if (!migratedRef.current) {
        await migratePlanner();
        migratedRef.current = true;
      }

      const { data: row } = await supabase
        .from("planner")
        .select("data")
        .eq("date", date)
        .maybeSingle();

      setData(row ? (row.data as DayData) : defaultDay());
      setLoading(false);
    }
    loadDate();
  }, [date]);

  // ── Todo helpers ──
  const addTodo = () => {
    if (!todoInput.trim()) return;
    save({ ...data, todos: [...data.todos, { id: Date.now(), text: todoInput.trim(), done: false }] });
    setTodoInput("");
  };
  const toggleTodo = (id: number) =>
    save({ ...data, todos: data.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });
  const delTodo = (id: number) =>
    save({ ...data, todos: data.todos.filter((t) => t.id !== id) });

  // ── Brain dump helpers ──
  const addBrain = () => {
    if (!brainInput.trim()) return;
    save({ ...data, brainDump: [...data.brainDump, { id: Date.now(), text: brainInput.trim(), done: false }] });
    setBrainInput("");
  };
  const toggleBrain = (id: number) =>
    save({ ...data, brainDump: data.brainDump.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });
  const delBrain = (id: number) =>
    save({ ...data, brainDump: data.brainDump.filter((t) => t.id !== id) });

  // ── Big 3 ──
  const setBig3 = (i: number, v: string) => {
    const b3 = [...data.big3] as [string, string, string];
    b3[i] = v;
    save({ ...data, big3: b3 });
  };

  // ── Time box ──
  const setBlock = (h: number, v: string) =>
    save({ ...data, timeBlocks: { ...data.timeBlocks, [h]: v } });

  // ── Date nav ──
  const goDay = (n: number) => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + n);
    setDate(toDateStr(d));
  };
  const goToday = () => setDate(toDateStr(new Date()));

  const dObj = new Date(date + "T00:00:00");
  const displayDate = `${dObj.getMonth() + 1}월 ${dObj.getDate()}일 (${DAY_NAMES[dObj.getDay()]})`;
  const isToday = date === toDateStr(new Date());

  return (
    <main className="relative min-h-screen">
      <Background />
      <Navigation />
      <div className="relative z-10 flex flex-col items-center px-4 pt-24 pb-16">

        {/* ── Centered header ── */}
        <div className="text-center mb-8 w-full max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-4">✅ TO DO LIST</h1>

          {/* Date navigator centered */}
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={() => goDay(-1)}
              style={{ minWidth: 44, minHeight: 44, touchAction: "manipulation" }}
              className="rounded-xl text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-xl transition-all active:scale-90"
            >
              ‹
            </button>
            <button
              onClick={goToday}
              style={{ minHeight: 44, touchAction: "manipulation", ...cardStyle }}
              className="px-5 rounded-xl text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
            >
              {displayDate}
              {isToday && <span className="ml-2 text-purple-400 text-xs">오늘</span>}
            </button>
            <button
              onClick={() => goDay(1)}
              style={{ minWidth: 44, minHeight: 44, touchAction: "manipulation" }}
              className="rounded-xl text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-xl transition-all active:scale-90"
            >
              ›
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-gray-500 text-sm">불러오는 중...</div>
          </div>
        ) : (
        /* ── Centered 3-column layout ── */
        <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5">

          {/* ═══ Col 1: 미래 시각화 + TO DO + 감사일기 ═══ */}
          <div className="space-y-5">

            {/* 미래 시각화 */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-xs font-bold text-purple-400 mb-3 uppercase tracking-widest">미래 시각화</h3>
              <textarea
                value={data.vision}
                onChange={(e) => save({ ...data, vision: e.target.value })}
                placeholder="오늘 이루고 싶은 것들을 자유롭게 써보세요..."
                rows={5}
                style={{ ...inputStyle, resize: "none" }}
                className={inputCls}
              />
            </div>

            {/* TO DO LIST */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-xs font-bold text-green-400 mb-3 uppercase tracking-widest">✅ To Do List</h3>
              <div className="flex gap-2 mb-3">
                <input
                  value={todoInput}
                  onChange={(e) => setTodoInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  placeholder="할 일 추가..."
                  style={inputStyle}
                  className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                />
                <button
                  onClick={addTodo}
                  style={{
                    minWidth: 44,
                    minHeight: 44,
                    touchAction: "manipulation",
                    background: "linear-gradient(135deg,#059669,#0891b2)",
                  }}
                  className="rounded-xl text-white font-bold text-xl flex items-center justify-center transition-all active:scale-90 hover:opacity-90"
                >
                  +
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {data.todos.length === 0 && (
                  <p className="text-gray-600 text-xs text-center py-4">아직 할 일이 없어요</p>
                )}
                {data.todos.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <button
                      onClick={() => toggleTodo(t.id)}
                      style={{
                        minWidth: 28,
                        minHeight: 28,
                        flexShrink: 0,
                        background: t.done ? "rgba(5,150,105,0.3)" : "rgba(255,255,255,0.05)",
                        border: t.done ? "1px solid rgba(5,150,105,0.6)" : "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 6,
                        touchAction: "manipulation",
                      }}
                      className="flex items-center justify-center text-green-400 text-sm transition-all active:scale-90"
                    >
                      {t.done ? "✓" : ""}
                    </button>
                    <span
                      className={`flex-1 text-sm break-all ${
                        t.done ? "line-through text-gray-600" : "text-gray-200"
                      }`}
                    >
                      {t.text}
                    </span>
                    <button
                      onClick={() => delTodo(t.id)}
                      style={{ minWidth: 32, minHeight: 32, touchAction: "manipulation" }}
                      className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 감사일기 */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-xs font-bold text-yellow-400 mb-3 uppercase tracking-widest">감사일기</h3>
              <textarea
                value={data.gratitude}
                onChange={(e) => save({ ...data, gratitude: e.target.value })}
                placeholder="오늘 감사한 것들을 적어보세요..."
                rows={4}
                style={{ ...inputStyle, resize: "none" }}
                className={inputCls}
              />
            </div>
          </div>

          {/* ═══ Col 2: Brain Dump + Big 3 + Feedback ═══ */}
          <div className="space-y-5">

            {/* Brain Dump */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-widest">Brain Dump</h3>
              <p className="text-gray-600 text-xs mb-3">머릿속에 있는 것을 전부 꺼내세요</p>
              <div className="flex gap-2 mb-3">
                <input
                  value={brainInput}
                  onChange={(e) => setBrainInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addBrain()}
                  placeholder="생각 적기..."
                  style={inputStyle}
                  className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                />
                <button
                  onClick={addBrain}
                  style={{
                    minWidth: 44,
                    minHeight: 44,
                    touchAction: "manipulation",
                    background: "rgba(96,165,250,0.15)",
                    border: "1px solid rgba(96,165,250,0.3)",
                  }}
                  className="rounded-xl text-blue-400 font-bold text-xl flex items-center justify-center transition-all active:scale-90"
                >
                  +
                </button>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {data.brainDump.length === 0 && (
                  <p className="text-gray-600 text-xs text-center py-3">생각나는 것을 적어보세요</p>
                )}
                {data.brainDump.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <button
                      onClick={() => toggleBrain(t.id)}
                      style={{
                        minWidth: 24,
                        minHeight: 24,
                        flexShrink: 0,
                        background: t.done ? "rgba(96,165,250,0.2)" : "transparent",
                        border: t.done ? "1px solid rgba(96,165,250,0.5)" : "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 4,
                        touchAction: "manipulation",
                      }}
                      className="flex items-center justify-center text-blue-400 text-xs transition-all active:scale-90"
                    >
                      {t.done ? "✓" : ""}
                    </button>
                    <span
                      className={`flex-1 text-sm break-all ${
                        t.done ? "line-through text-gray-600" : "text-gray-300"
                      }`}
                    >
                      {t.text}
                    </span>
                    <button
                      onClick={() => delBrain(t.id)}
                      style={{ minWidth: 28, minHeight: 28, touchAction: "manipulation" }}
                      className="text-gray-600 hover:text-red-400 transition-colors text-base flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Big 3 */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-xs font-bold text-orange-400 mb-1 uppercase tracking-widest">Big 3</h3>
              <p className="text-gray-600 text-xs mb-3">오늘 반드시 해야 할 3가지</p>
              {([0, 1, 2] as const).map((i) => (
                <div key={i} className="flex items-center gap-3 mb-2">
                  <span className="text-orange-400 font-bold text-base w-6 flex-shrink-0 text-center">
                    {["①", "②", "③"][i]}
                  </span>
                  <input
                    value={data.big3[i]}
                    onChange={(e) => setBig3(i, e.target.value)}
                    placeholder={`${i + 1}순위 목표`}
                    style={{ ...inputStyle, minHeight: 44 }}
                    className="flex-1 rounded-xl px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="text-xs font-bold text-pink-400 mb-3 uppercase tracking-widest">Feedback</h3>
              {(
                [
                  { label: "시작", key: "feedStart" as const, color: "text-blue-400" },
                  { label: "중간", key: "feedMid" as const, color: "text-yellow-400" },
                  { label: "마무리", key: "feedEnd" as const, color: "text-green-400" },
                ] as const
              ).map(({ label, key, color }) => (
                <div key={key} className="mb-3">
                  <p className={`text-xs font-semibold mb-1.5 ${color}`}>- {label}:</p>
                  <textarea
                    value={data[key]}
                    onChange={(e) => save({ ...data, [key]: e.target.value })}
                    placeholder={`${label} 피드백...`}
                    rows={2}
                    style={{ ...inputStyle, resize: "none" }}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ═══ Col 3: Time Box ═══ */}
          <div
            className="rounded-2xl p-5 md:col-span-2 lg:col-span-1"
            style={cardStyle}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest">Time Box</h3>
              <span className="text-xs text-gray-600">시간별 계획</span>
            </div>
            <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 680 }}>
              {HOURS.map((h) => (
                <div key={h} className="flex items-center gap-2">
                  <span
                    className="text-xs text-gray-500 flex-shrink-0 text-right font-mono"
                    style={{ width: 28 }}
                  >
                    {h}
                  </span>
                  <div
                    className="flex-1 rounded-lg overflow-hidden"
                    style={{
                      background: data.timeBlocks[h] ? "rgba(20,184,166,0.08)" : "rgba(255,255,255,0.03)",
                      border: data.timeBlocks[h]
                        ? "1px solid rgba(20,184,166,0.2)"
                        : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <input
                      value={data.timeBlocks[h] ?? ""}
                      onChange={(e) => setBlock(h, e.target.value)}
                      style={{
                        background: "transparent",
                        fontSize: 13,
                        minHeight: 34,
                        touchAction: "manipulation",
                      }}
                      className="w-full px-2 py-1.5 text-xs text-gray-200 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
        )}
      </div>
    </main>
  );
}
