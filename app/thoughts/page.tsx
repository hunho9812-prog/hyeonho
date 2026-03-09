"use client";

import { useState, useEffect } from "react";
import Background from "@/components/Background";
import Navigation from "@/components/Navigation";
import { supabase } from "@/lib/supabase";
import { migrateThoughts } from "@/lib/migrate";

interface Note {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

type ViewMode = "list" | "edit";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

function formatDateFull(iso: string) {
  const d = new Date(iso);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

// DB row → Note 변환
function rowToNote(row: Record<string, unknown>): Note {
  return {
    id: row.id as number,
    title: row.title as string,
    body: row.body as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export default function ThoughtsPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<ViewMode>("list");
  const [current, setCurrent] = useState<Partial<Note>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ── 초기 로드: 마이그레이션 후 Supabase에서 불러오기 ──
  useEffect(() => {
    async function init() {
      await migrateThoughts();
      const { data } = await supabase
        .from("thoughts")
        .select("*")
        .order("updated_at", { ascending: false });
      if (data) {
        setNotes(data.map(rowToNote));
      }
      setLoading(false);
    }
    init();
  }, []);

  // ── Realtime: 다른 기기에서 변경 시 자동 반영 ──
  useEffect(() => {
    const channel = supabase
      .channel("realtime:thoughts")
      .on("postgres_changes", { event: "*", schema: "public", table: "thoughts" }, async () => {
        const { data } = await supabase
          .from("thoughts")
          .select("*")
          .order("updated_at", { ascending: false });
        if (data) setNotes(data.map(rowToNote));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const newNote = () => {
    setCurrent({ title: "", body: "" });
    setView("edit");
  };

  const openNote = (note: Note) => {
    setCurrent({ ...note });
    setView("edit");
  };

  const saveNote = async () => {
    const title = current.title?.trim() || "";
    const body = current.body?.trim() || "";
    if (!title && !body) return;
    const now = new Date().toISOString();

    if (current.id) {
      // 기존 노트 수정
      const updated: Note = {
        id: current.id,
        title: title || "제목 없음",
        body,
        createdAt: current.createdAt!,
        updatedAt: now,
      };
      setNotes((prev) => prev.map((n) => (n.id === current.id ? updated : n)));
      await supabase
        .from("thoughts")
        .update({
          title: updated.title,
          body: updated.body,
          updated_at: updated.updatedAt,
        })
        .eq("id", updated.id);
    } else {
      // 새 노트 추가
      const newN: Note = {
        id: Date.now(),
        title: title || "제목 없음",
        body,
        createdAt: now,
        updatedAt: now,
      };
      setNotes((prev) => [newN, ...prev]);
      await supabase.from("thoughts").insert({
        id: newN.id,
        title: newN.title,
        body: newN.body,
        created_at: newN.createdAt,
        updated_at: newN.updatedAt,
      });
    }
    setView("list");
  };

  const deleteNote = async (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setConfirmDelete(null);
    if (current.id === id) setView("list");
    await supabase.from("thoughts").delete().eq("id", id);
  };

  const wordCount = (current.body ?? "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;

  return (
    <main className="relative min-h-screen">
      <Background />
      <Navigation />
      <div className="relative z-10 flex flex-col items-center px-4 pt-24 pb-16">

        {/* ── Centered header ── */}
        <div className="text-center mb-6 w-full max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-2">💭 나의 생각</h1>
          {view === "list" && !loading && (
            <p className="text-gray-500 text-sm mb-4">{notes.length}개의 글</p>
          )}
          {view === "list" && (
            <div className="flex gap-2 justify-center mt-4">
              <button
                onClick={newNote}
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#db2777)",
                  minHeight: 44,
                  touchAction: "manipulation",
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 hover:scale-105"
              >
                + 새 글 작성
              </button>
            </div>
          )}
        </div>

        {/* ── Centered content ── */}
        <div className="w-full max-w-4xl">

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-gray-500 text-sm">불러오는 중...</div>
          </div>
        ) : (
          <>
          {/* ── List view ── */}
          {view === "list" && (
            <>
              {notes.length === 0 ? (
                <div
                  className="text-center py-32 rounded-3xl"
                  style={{
                    background: "rgba(10,10,15,0.6)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="text-6xl mb-4">💭</div>
                  <p className="text-gray-500 mb-2 font-medium">아직 작성한 글이 없어요</p>
                  <p className="text-gray-700 text-sm">첫 번째 생각을 기록해보세요</p>
                  <button
                    onClick={newNote}
                    style={{
                      background: "linear-gradient(135deg,#7c3aed,#db2777)",
                      minHeight: 44,
                      touchAction: "manipulation",
                    }}
                    className="mt-6 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                  >
                    + 첫 글 쓰기
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-2xl p-6 group transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                      style={{
                        background: "rgba(10,10,15,0.7)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                      onClick={() => openNote(note)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-white font-semibold text-base leading-snug flex-1 line-clamp-2">
                          {note.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(note.id);
                          }}
                          style={{ minWidth: 36, minHeight: 36, touchAction: "manipulation" }}
                          className="text-gray-700 hover:text-red-400 transition-colors flex items-center justify-center text-xl opacity-0 group-hover:opacity-100 flex-shrink-0 rounded-lg hover:bg-red-500/10"
                        >
                          ×
                        </button>
                      </div>
                      {note.body && (
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-3">
                          {note.body}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-gray-700 text-xs">{formatDate(note.updatedAt)}</p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}
                        >
                          읽기 →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Edit view ── */}
          {view === "edit" && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(10,10,15,0.7)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* 에디터 상단 액션 바 */}
              <div
                className="flex items-center justify-between px-6 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView("list")}
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      minHeight: 36,
                      touchAction: "manipulation",
                    }}
                    className="px-4 py-1.5 rounded-lg text-sm text-gray-300 transition-all hover:bg-white/10 active:scale-95"
                  >
                    ← 목록으로
                  </button>
                  {current.id && (
                    <button
                      onClick={() => setConfirmDelete(current.id!)}
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.25)",
                        minHeight: 36,
                        touchAction: "manipulation",
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
                    >
                      삭제
                    </button>
                  )}
                </div>
                {current.id && current.updatedAt && (
                  <span className="text-xs text-gray-600">
                    {formatDateFull(current.updatedAt)}
                  </span>
                )}
              </div>

              <input
                value={current.title ?? ""}
                onChange={(e) => setCurrent({ ...current, title: e.target.value })}
                placeholder="제목을 입력하세요"
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  background: "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "white",
                }}
                className="w-full px-8 py-6 outline-none placeholder-gray-700"
              />

              <textarea
                value={current.body ?? ""}
                onChange={(e) => setCurrent({ ...current, body: e.target.value })}
                placeholder="오늘의 생각을 자유롭게 적어보세요&#10;&#10;아이디어, 배운 것, 느낀 것 무엇이든 괜찮아요."
                style={{
                  fontSize: 15,
                  background: "transparent",
                  resize: "none",
                  minHeight: "60vh",
                  color: "#e2e8f0",
                  lineHeight: 1.8,
                }}
                className="w-full px-8 py-6 outline-none placeholder-gray-700"
              />

              <div
                className="flex items-center justify-between px-8 py-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-gray-700 text-xs">{wordCount} 단어</span>
                <button
                  onClick={saveNote}
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#db2777)",
                    minHeight: 40,
                    touchAction: "manipulation",
                  }}
                  className="px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                >
                  저장
                </button>
              </div>
            </div>
          )}
          </>
        )}

        {/* ── Delete confirm modal ── */}
        {confirmDelete !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative rounded-2xl p-8 w-full max-w-sm text-center"
              style={{ background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-white font-bold text-lg mb-2">글을 삭제할까요?</h3>
              <p className="text-gray-500 text-sm mb-6">삭제된 글은 복구할 수 없습니다.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    minHeight: 44,
                    touchAction: "manipulation",
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm text-gray-300 transition-all hover:bg-white/10"
                >
                  취소
                </button>
                <button
                  onClick={() => deleteNote(confirmDelete)}
                  style={{
                    background: "rgba(239,68,68,0.2)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    minHeight: 44,
                    touchAction: "manipulation",
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 transition-all hover:bg-red-500/30"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
