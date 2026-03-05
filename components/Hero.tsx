"use client";

import { useEffect, useState } from "react";
import CourseModal from "./CourseModal";

const roles = ["방구석 청년"];

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCourseOpen, setIsCourseOpen] = useState(false);

  useEffect(() => {
    const current = roles[roleIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, displayed.length + 1));
      }, 120);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, displayed.length - 1));
      }, 60);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setRoleIndex((i) => (i + 1) % roles.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, roleIndex]);

  return (
    <section
      id="hero"
      className="flex flex-col items-center justify-center px-6 pt-28 pb-8"
    >
      <div className="w-full text-center" style={{ maxWidth: "64rem" }}>
        {/* Avatar */}
        <div className="mb-8 flex justify-center">
          <div
            className="w-32 h-32 rounded-full animate-float animate-pulse-glow flex items-center justify-center text-5xl"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              fontSize: "3rem",
            }}
          >
            👨‍💻
          </div>
        </div>

        {/* Name */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.2s", opacity: 0 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-4">
            <span className="gradient-text">김현호</span>
          </h1>
          <p className="text-gray-400 text-lg mb-2">Kim Hyeonho</p>
        </div>

        {/* Typewriter */}
        <div
          className="animate-fade-in-up mb-8"
          style={{ animationDelay: "0.4s", opacity: 0 }}
        >
          <div className="text-2xl md:text-3xl font-medium text-gray-200 h-10 flex items-center justify-center gap-1">
            <span>{displayed}</span>
            <span className="animate-blink text-purple-400">|</span>
          </div>
        </div>

        {/* Description */}
        <div
          className="animate-fade-in-up mb-12"
          style={{ animationDelay: "0.6s", opacity: 0 }}
        >
          <p className="text-gray-400 text-lg leading-relaxed text-center">
            사이트를 잘 만들고 싶은 청년입니다.
          </p>
        </div>

        {/* Interest Tags */}
        <div
          className="animate-fade-in-up flex flex-col sm:flex-row gap-4 justify-center"
          style={{ animationDelay: "0.8s", opacity: 0 }}
        >
          <button
            onClick={() => setIsCourseOpen(true)}
            className="px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              boxShadow: "0 4px 20px rgba(124, 58, 237, 0.4)",
            }}
          >
            ⚡ 에너지시스템 공학
          </button>
          <a
            href="https://claude.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 glass-card"
          >
            🤖 클로드 AI
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          className="animate-fade-in-up mt-10"
          style={{ animationDelay: "1.2s", opacity: 0 }}
        >
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <span className="text-sm">스크롤</span>
            <div
              className="w-[1px] h-12 animate-float"
              style={{
                background: "linear-gradient(to bottom, #7c3aed, transparent)",
              }}
            />
          </div>
        </div>
      </div>

      <CourseModal isOpen={isCourseOpen} onClose={() => setIsCourseOpen(false)} />
    </section>
  );
}
