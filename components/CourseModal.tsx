"use client";

import { useState } from "react";

// ✏️ 수업 목록을 여기서 자유롭게 추가/수정/삭제하세요
const courses = [
  { name: "수업 이름을 여기에 입력하세요", credit: 3 },
  { name: "예시: 에너지 열역학", credit: 3 },
  { name: "예시: 전력시스템 공학", credit: 3 },
];

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseModal({ isOpen, onClose }: CourseModalProps) {
  if (!isOpen) return null;

  const totalCredits = courses.reduce((sum, c) => sum + c.credit, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative glass-card rounded-3xl p-8 w-full max-w-md"
        style={{ border: "1px solid rgba(139, 92, 246, 0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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

        {/* Course List */}
        <ul className="space-y-3 mb-6">
          {courses.map((course, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
                >
                  {i + 1}
                </span>
                <span className="text-gray-200 text-sm">{course.name}</span>
              </div>
              <span className="text-purple-400 text-xs font-medium">{course.credit}학점</span>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ background: "rgba(124, 58, 237, 0.1)", border: "1px solid rgba(124, 58, 237, 0.2)" }}
        >
          <span className="text-gray-400 text-sm">총 {courses.length}과목</span>
          <span className="text-purple-300 font-bold">{totalCredits}학점</span>
        </div>
      </div>
    </div>
  );
}
