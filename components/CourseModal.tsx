"use client";

import { useState, useEffect } from "react";

interface Course {
  id: number;
  name: string;
  credit: number;
  notes: string;
}

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseModal({ isOpen, onClose }: CourseModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [openNoteId, setOpenNoteId] = useState<number | null>(null);

  // localStorage에서 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("hyeonho-courses");
    if (saved) {
      setCourses(JSON.parse(saved));
    }
  }, []);

  // 변경될 때마다 저장
  const save = (updated: Course[]) => {
    setCourses(updated);
    localStorage.setItem("hyeonho-courses", JSON.stringify(updated));
  };

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now(),
      name: "",
      credit: 3,
      notes: "",
    };
    const updated = [...courses, newCourse];
    save(updated);
  };

  const updateCourse = (id: number, field: keyof Course, value: string | number) => {
    save(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const deleteCourse = (id: number) => {
    save(courses.filter((c) => c.id !== id));
    if (openNoteId === id) setOpenNoteId(null);
  };

  const totalCredits = courses.reduce((sum, c) => sum + (Number(c.credit) || 0), 0);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative glass-card rounded-3xl w-full max-w-lg flex flex-col"
        style={{
          border: "1px solid rgba(139, 92, 246, 0.3)",
          maxHeight: "85vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4 shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-white">⚡ 에너지시스템 공학</h3>
            <p className="text-gray-400 text-sm mt-1">수강 중인 과목 목록</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Course List - scrollable */}
        <div className="overflow-y-auto px-8 py-2 flex-1">
          {courses.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-6">
              아직 과목이 없어요. 아래 버튼으로 추가해보세요!
            </p>
          )}

          <ul className="space-y-3">
            {courses.map((course, i) => (
              <li
                key={course.id}
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {/* Course row */}
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  {/* Index badge */}
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
                  >
                    {i + 1}
                  </span>

                  {/* Course name input */}
                  <input
                    type="text"
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                    placeholder="과목명 입력"
                    className="flex-1 bg-transparent text-gray-200 text-sm outline-none placeholder-gray-600"
                  />

                  {/* Credit input */}
                  <input
                    type="number"
                    value={course.credit}
                    onChange={(e) => updateCourse(course.id, "credit", Number(e.target.value))}
                    min={1}
                    max={9}
                    className="w-12 bg-transparent text-purple-400 text-xs font-medium text-right outline-none"
                  />
                  <span className="text-purple-400 text-xs shrink-0">학점</span>

                  {/* Note toggle */}
                  <button
                    onClick={() => setOpenNoteId(openNoteId === course.id ? null : course.id)}
                    title="노트 열기"
                    className="transition-colors shrink-0"
                    style={{ color: openNoteId === course.id ? "#a78bfa" : "#4b5563" }}
                  >
                    📝
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteCourse(course.id)}
                    title="삭제"
                    className="text-gray-600 hover:text-red-400 transition-colors text-sm shrink-0"
                  >
                    ✕
                  </button>
                </div>

                {/* Notes area */}
                {openNoteId === course.id && (
                  <div style={{ background: "rgba(139, 92, 246, 0.05)", borderTop: "1px solid rgba(139, 92, 246, 0.15)" }}>
                    <textarea
                      value={course.notes}
                      onChange={(e) => updateCourse(course.id, "notes", e.target.value)}
                      placeholder={`${course.name || "이 과목"} 노트를 여기에 자유롭게 작성하세요...`}
                      rows={5}
                      className="w-full bg-transparent text-gray-300 text-sm p-4 outline-none resize-none placeholder-gray-600 leading-relaxed"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 shrink-0 space-y-3">
          {/* Add button */}
          <button
            onClick={addCourse}
            className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: "rgba(139, 92, 246, 0.1)",
              border: "1px dashed rgba(139, 92, 246, 0.4)",
              color: "#a78bfa",
            }}
          >
            + 과목 추가
          </button>

          {/* Total */}
          {courses.length > 0 && (
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "rgba(124, 58, 237, 0.1)", border: "1px solid rgba(124, 58, 237, 0.2)" }}
            >
              <span className="text-gray-400 text-sm">총 {courses.length}과목</span>
              <span className="text-purple-300 font-bold">{totalCredits}학점</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
