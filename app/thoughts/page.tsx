"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Background from "@/components/Background";
import Navigation from "@/components/Navigation";

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

export default function ThoughtsPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<ViewMode>("list");
  const [current, setCurrent] = useState<Partial<Note>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hyeonho-thoughts-v1");
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem("hyeonho-thoughts-v1", JSON.stringify(updated));
  };

  const newNote = () => {
    setCurrent({ title: "", body: "" });
    setView("edit");
  };

  const openNote = (note: Note) => {
    setCurrent({ ...note });
    setView("edit");
  };

  const saveNote = () => {
    const title = current.title?.trim() || "";
    const body = current.body?.trim() || "";
    if (!title && !body) return;
    const now = new Date().toISOString();
    if (current.id) {
      saveNotes(
        notes.map((n) =>
          n.id === current.id ? { ...n, title: title || "제목 없음", body, updatedAt: now } : n
        )
      );
    } else {
      saveNotes([
        { id: Date.now(), title: title || "제목 없음", body, createdAt: now, updatedAt: now },
        ...notes,
      ]);
    }
    setView("list");
  };

  const deleteNote = (id: number) => {
    saveNotes(notes.filter((n) => n.id !== id));
    setConfirmDelete(null);
    if (current.id === id) setView("list");
  };

  const wordCount = (current.body ?? "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;

  return (
    <main className="relative min-h-screen">
      <Background />
      <Navigation />
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 pt-24 pb-16">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
          <div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-2 inline-block">
              ← 홈으로
            </Link>
            <h1 className="text-4xl font-bold text-white">💭 나의 생각</h1>
            {view === "list" && (
              <p className="text-gray-500 text-sm mt-1">
                {notes.length}개의 글
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-2">
            {view === "edit" && (
              <button
                onClick={() => setView("list")}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  minHeight: 44,
                  touchAction: "manipulation",
                }}
                className="px-5 py-2 rounded-xl text-sm text-gray-300 transition-all hover:bg-white/10 active:scale-95"
              >
                목록으로
              </button>
            )}
            {view === "edit" && current.id && (
              <button
                onClick={() => setConfirmDelete(current.id!)}
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  minHeight: 44,
                  touchAction: "manipulation",
                }}
                className="px-4 py-2 rounded-xl text-sm text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
              >
                삭제
              </button>
            )}
            {view === "edit" ? (
              <button
                onClick={saveNote}
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#db2777)",
                  minHeight: 44,
                  touchAction: "manipulation",
                }}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              >
                저장
              </button>
            ) : (
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
            )}
          </div>
        </div>

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
            {/* Date info */}
            {current.id && (
              <div
                className="px-8 pt-5 pb-0 text-xs text-gray-600"
              >
                {current.updatedAt ? `마지막 수정: ${formatDateFull(current.updatedAt)}` : "새 글"}
              </div>
            )}

            {/* Title input */}
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

            {/* Body textarea */}
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

            {/* Footer: word count + save */}
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
    </main>
  );
}
