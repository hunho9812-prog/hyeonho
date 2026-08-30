"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(searchParams.get("redirect") || "/");
      router.refresh();
    } else {
      setError("비밀번호가 틀렸습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-sm rounded-2xl p-8 flex flex-col gap-5"
      >
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-xl font-bold gradient-text">현호의 비밀공간</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            비밀번호를 입력해주세요
          </p>
        </div>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#e8e8f0",
          }}
        />

        {error && (
          <p className="text-sm text-center" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || password.length === 0}
          className="w-full rounded-lg py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #2563eb)",
            color: "#fff",
          }}
        >
          {loading ? "확인 중..." : "입장하기"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
