"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "#features", label: "기능" },
];

const quickLinks = [
  { href: "/timetable", emoji: "📅", label: "시간표" },
  { href: "/calendar", emoji: "📆", label: "달력" },
  { href: "/todo", emoji: "✅", label: "TO DO" },
  { href: "/thoughts", emoji: "💭", label: "생각" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isSubPage = pathname !== "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10, 10, 15, 0.85)" : "rgba(10,10,15,0.4)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="w-full px-6 py-3 flex items-center justify-between gap-4">
        {/* 홈으로 버튼 (서브페이지에서만) */}
        {isSubPage ? (
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              color: "#e2e8f0",
              fontSize: "1rem",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px",
              padding: "8px 18px",
              minHeight: "44px",
              whiteSpace: "nowrap",
            }}
          >
            ← 홈으로
          </Link>
        ) : (
          <div />
        )}

        {/* 우측 링크 */}
        <ul className="flex gap-2 items-center flex-wrap justify-end">
          {!isSubPage && navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200 px-2"
              >
                {link.label}
              </a>
            </li>
          ))}

          {quickLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: pathname === link.href
                    ? "rgba(124,58,237,0.25)"
                    : "rgba(255,255,255,0.06)",
                  border: pathname === link.href
                    ? "1px solid rgba(124,58,237,0.5)"
                    : "1px solid rgba(255,255,255,0.1)",
                  color: pathname === link.href ? "#c4b5fd" : "#cbd5e1",
                }}
              >
                <span>{link.emoji}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
