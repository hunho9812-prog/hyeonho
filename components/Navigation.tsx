"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { href: "#features", label: "기능" },
  { href: "#contact", label: "연락처" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

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
        background: scrolled ? "rgba(10, 10, 15, 0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="#"
          className="text-xl font-bold gradient-text"
        >
          현호
        </a>
        <ul className="flex gap-8 items-center">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              href="/timetable"
              className="text-sm px-4 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                color: "white",
              }}
            >
              📅 시간표
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
