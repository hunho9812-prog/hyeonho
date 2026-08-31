"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SyncStatus from "@/components/SyncStatus";

const quickLinks = [
  { href: "/assets", emoji: "💰", label: "자산 관리" },
  { href: "/calendar", emoji: "📆", label: "달력" },
  { href: "/todo", emoji: "✅", label: "TO DO" },
  { href: "/thoughts", emoji: "💭", label: "생각" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10, 10, 15, 0.92)" : "rgba(10,10,15,0.75)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="h-full px-6 flex items-center justify-between gap-4">

        {/* 왼쪽: 브랜드 + 퀵링크 */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            style={{
              color: "#e2e8f0",
              fontSize: "0.95rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            현호의 비밀공간
          </Link>

          <div className="flex gap-1.5 items-center">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background:
                    pathname === link.href
                      ? "rgba(124,58,237,0.25)"
                      : "rgba(255,255,255,0.06)",
                  border:
                    pathname === link.href
                      ? "1px solid rgba(124,58,237,0.5)"
                      : "1px solid rgba(255,255,255,0.1)",
                  color: pathname === link.href ? "#c4b5fd" : "#cbd5e1",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{link.emoji}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 오른쪽: 홈 + 기능 버튼 + 동기화 상태 (한 행) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              color: pathname === "/" ? "#c4b5fd" : "#e2e8f0",
              fontSize: "14px",
              background:
                pathname === "/"
                  ? "rgba(124,58,237,0.2)"
                  : "rgba(255,255,255,0.08)",
              border:
                pathname === "/"
                  ? "1px solid rgba(124,58,237,0.4)"
                  : "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px",
              padding: "10px 18px",
              whiteSpace: "nowrap",
            }}
          >
            🏠 홈
          </Link>

          <a
            href="/#features"
            className="flex items-center gap-1.5 font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              color: "#e2e8f0",
              fontSize: "14px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px",
              padding: "10px 18px",
              whiteSpace: "nowrap",
              textDecoration: "none",
            }}
          >
            ⚙ 기능
          </a>

          {/* 동기화 상태 — 버튼 오른쪽에 작게 */}
          <SyncStatus />

          <button
            onClick={async () => {
              await fetch("/api/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            title="로그아웃"
            className="flex items-center justify-center rounded-lg transition-all hover:scale-105 active:scale-95"
            style={{
              width: "36px",
              height: "36px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#e2e8f0",
              fontSize: "14px",
              flexShrink: 0,
            }}
          >
            🔒
          </button>
        </div>
      </div>
    </nav>
  );
}
