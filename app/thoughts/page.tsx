"use client";

import { useState, useEffect, useMemo } from "react";
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
type SortKey = "newest" | "oldest" | "alpha";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateFull(iso: string) {
  const d = new Date(iso);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function rowToNote(row: Record<string, unknown>): Note {
  return {
    id: row.id as number,
    title: row.title as string,
    body: row.body as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

const SORT_LABELS: Record<SortKey, string> = {
  newest: "최신순",
  oldest: "오래된순",
  alpha: "제목순",
};

export default function ThoughtsPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<ViewMode>("list");
  const [current, setCurrent] = useState<Partial<Note>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  // ── 초기 로드 ──
  useEffect(() => {
    async function init() {
      await migrateThoughts();
      const { data } = await supabase
        .from("thoughts")
        .select("*")
        .order("updated_at", { ascending: false });
      if (data) setNotes(data.map(rowToNote));
      setLoading(false);
    }
    init();
  }, []);

  // ── Realtime ──
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

  // ── 검색 + 정렬 ──
  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? notes.filter(n =>
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q)
        )
      : notes;

    return [...filtered].sort((a, b) => {
      if (sort === "newest") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sort === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return a.title.localeCompare(b.title, "ko");
    });
  }, [notes, search, sort]);

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
      const updated: Note = {
        id: current.id,
        title: title || "제목 없음",
        body,
        createdAt: current.createdAt!,
        updatedAt: now,
      };
      setNotes(prev => prev.map(n => (n.id === current.id ? updated : n)));
      await supabase
        .from("thoughts")
        .update({ title: updated.title, body: updated.body, updated_at: updated.updatedAt })
        .eq("id", updated.id);
    } else {
      const newN: Note = {
        id: Date.now(),
        title: title || "제목 없음",
        body,
        createdAt: now,
        updatedAt: now,
      };
      setNotes(prev => [newN, ...prev]);
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
    setNotes(prev => prev.filter(n => n.id !== id));
    setConfirmDelete(null);
    if (current.id === id) setView("list");
    await supabase.from("thoughts").delete().eq("id", id);
  };

  const wordCount = (current.body ?? "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;

  return (
    <main className="relative min-h-screen">
      <Background />
      <Navigation />

      {/* ── Page Header Bar ── */}
      <div
        className="relative z-10 pt-16"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="w-full max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">💭 나의 생각</h1>
            {view === "list" && !loading && (
              <p className="text-gray-500 text-sm mt-0.5">총 {notes.length}개의 글</p>
            )}
            {view === "edit" && (
              <p className="text-gray-500 text-sm mt-0.5">글 편집 중</p>
            )}
          </div>
          {view === "list" && (
            <button
              onClick={newNote}
              style={{
                background: "linear-gradient(135deg,#7c3aed,#db2777)",
                minHeight: 40,
                touchAction: "manipulation",
                flexShrink: 0,
              }}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            >
              + 새 글 작성
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 pb-16">
        <div className="w-full max-w-4xl mx-auto px-6 pt-6">

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-gray-500 text-sm">불러오는 중...</div>
            </div>
          ) : (
            <>
              {/* ── List view ── */}
              {view === "list" && (
                <div>
                  {/* 검색 + 정렬 */}
                  <div className="flex gap-3 mb-5 flex-wrap">
                    {/* 검색 */}
                    <div
                      className="flex-1 min-w-[200px] flex items-center gap-2 rounded-xl px-4"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        height: 42,
                      }}
                    >
                      <span className="text-gray-500 text-sm flex-shrink-0">🔍</span>
                      <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="제목 또는 내용으로 검색"
                        style={{
                          background: "transparent",
                          color: "#e2e8f0",
                          fontSize: 14,
                          outline: "none",
                          width: "100%",
                        }}
                        className="placeholder-gray-600"
                      />
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="text-gray-500 hover:text-gray-300 flex-shrink-0 text-lg leading-none"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* 정렬 */}
                    <div className="flex gap-1">
                      {(["newest", "oldest", "alpha"] as SortKey[]).map(s => (
                        <button
                          key={s}
                          onClick={() => setSort(s)}
                          style={{
                            background: sort === s ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)",
                            border: sort === s ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.1)",
                            color: sort === s ? "#c4b5fd" : "#9ca3af",
                            height: 42,
                            touchAction: "manipulation",
                          }}
                          className="px-3 rounded-xl text-xs font-medium transition-all hover:bg-white/10"
                        >
                          {SORT_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 📚 글 목록 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-gray-400">📚 글 목록</span>
                    {search.trim() && (
                      <span className="text-xs text-purple-400">
                        {filteredNotes.length}개 검색됨
                      </span>
                    )}
                  </div>

                  {notes.length === 0 ? (
                    /* 글 없음 */
                    <div
                      className="text-center py-24 rounded-2xl"
                      style={{
                        background: "rgba(10,10,15,0.6)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="text-5xl mb-4">💭</div>
                      <p className="text-gray-500 mb-1 font-medium">아직 작성한 글이 없어요</p>
                      <p className="text-gray-700 text-sm mb-6">첫 번째 생각을 기록해보세요</p>
                      <button
                        onClick={newNote}
                        style={{
                          background: "linear-gradient(135deg,#7c3aed,#db2777)",
                          minHeight: 44,
                          touchAction: "manipulation",
                        }}
                        className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                      >
                        + 첫 글 쓰기
                      </button>
                    </div>
                  ) : filteredNotes.length === 0 ? (
                    /* 검색 결과 없음 */
                    <div
                      className="text-center py-16 rounded-2xl"
                      style={{
                        background: "rgba(10,10,15,0.6)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <p className="text-gray-500 text-sm">
                        &ldquo;{search}&rdquo; 에 해당하는 글이 없습니다
                      </p>
                    </div>
                  ) : (
                    /* 글 목록 */
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{
                        background: "rgba(10,10,15,0.7)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      {filteredNotes.map((note, i) => (
                        <div
                          key={note.id}
                          className="flex items-center gap-4 px-5 py-4 group hover:bg-white/[0.03] transition-colors cursor-pointer"
                          style={{
                            borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                          }}
                          onClick={() => openNote(note)}
                        >
                          {/* 순번 */}
                          <span className="text-gray-700 text-xs w-5 text-right flex-shrink-0 select-none">
                            {i + 1}
                          </span>

                          {/* 제목 + 미리보기 */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {note.title}
                            </p>
                            {note.body && (
                              <p className="text-gray-600 text-xs truncate mt-0.5">
                                {note.body.replace(/\n/g, " ").slice(0, 70)}
                              </p>
                            )}
                          </div>

                          {/* 날짜 */}
                          <span className="text-gray-600 text-xs whitespace-nowrap flex-shrink-0">
                            {formatDate(note.updatedAt)}
                          </span>

                          {/* 액션 버튼 */}
                          <div
                            className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <button
                              onClick={e => { e.stopPropagation(); openNote(note); }}
                              style={{
                                background: "rgba(124,58,237,0.15)",
                                border: "1px solid rgba(124,58,237,0.3)",
                                minHeight: 32,
                                touchAction: "manipulation",
                              }}
                              className="px-3 py-1 rounded-lg text-xs text-purple-400 hover:bg-purple-500/25 transition-colors"
                            >
                              열기
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); setConfirmDelete(note.id); }}
                              style={{
                                background: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.2)",
                                minHeight: 32,
                                touchAction: "manipulation",
                              }}
                              className="px-3 py-1 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                    onChange={e => setCurrent({ ...current, title: e.target.value })}
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
                    onChange={e => setCurrent({ ...current, body: e.target.value })}
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
                onClick={e => e.stopPropagation()}
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
