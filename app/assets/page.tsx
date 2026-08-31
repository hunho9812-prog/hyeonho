"use client";

import Background from "@/components/Background";
import Navigation from "@/components/Navigation";

export default function AssetsPage() {
  return (
    <main className="relative min-h-screen">
      <Background />
      <Navigation />
      <div className="h-16" />

      {/* ── Page Header Bar ── */}
      <div
        className="relative z-10"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">💰 자산 관리</h1>
            <p className="text-gray-500 text-sm mt-0.5">준비 중인 기능입니다</p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 pb-16">
        <div className="w-full max-w-6xl mx-auto px-6 pt-8 flex flex-col items-center">
          <div
            className="w-full rounded-2xl flex flex-col items-center justify-center text-center py-32"
            style={{
              background: "rgba(15,15,25,0.7)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
              style={{
                background: "rgba(124,58,237,0.25)",
                border: "1px solid rgba(124,58,237,0.25)",
              }}
            >
              💰
            </div>
            <h2 className="text-xl font-bold text-white mb-2">자산 관리 기능 준비 중</h2>
            <p className="text-gray-400 text-sm">곧 이곳에서 자산 현황을 관리할 수 있게 됩니다.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
