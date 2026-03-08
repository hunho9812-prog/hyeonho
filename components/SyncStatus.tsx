"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Status = "checking" | "ok" | "error";

export default function SyncStatus() {
  const [status, setStatus] = useState<Status>("checking");
  const [errMsg, setErrMsg] = useState("");
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrMsg("연결 시간 초과 — Vercel 환경변수 확인 후 재배포 필요");
      setStatus("error");
    }, 5000);

    async function check() {
      try {
        const { error } = await supabase
          .from("planner")
          .select("date")
          .limit(1);

        clearTimeout(timer);
        if (error) {
          setErrMsg(error.message);
          setStatus("error");
        } else {
          setStatus("ok");
        }
      } catch (e) {
        clearTimeout(timer);
        setErrMsg(String(e));
        setStatus("error");
      }
    }
    check();

    return () => clearTimeout(timer);
  }, []);

  if (status === "checking") {
    return (
      <span
        style={{
          fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center",
          gap: 5, whiteSpace: "nowrap", padding: "4px 8px", borderRadius: 8,
          background: "rgba(255,255,255,0.05)", border: "1px solid #94a3b833",
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
        확인 중
      </span>
    );
  }

  if (status === "error") {
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          onClick={() => setShowDetail((v) => !v)}
          style={{
            fontSize: 11, color: "#f87171", display: "flex", alignItems: "center",
            gap: 5, whiteSpace: "nowrap", cursor: "pointer", padding: "4px 8px",
            borderRadius: 8, background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.3)", outline: "none",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171", display: "inline-block", flexShrink: 0 }} />
          동기화 오류 (클릭)
        </button>

        {showDetail && (
          <div
            style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "#1a1a2e", border: "1px solid rgba(248,113,113,0.4)",
              borderRadius: 10, padding: "12px 14px", zIndex: 9999,
              minWidth: 280, maxWidth: 360, fontSize: 12, color: "#fca5a5",
              lineHeight: 1.6, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ color: "#f87171", fontWeight: 600, marginBottom: 6 }}>
              연결 실패 오류 메시지:
            </div>
            <div style={{
              background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: "6px 8px",
              fontFamily: "monospace", fontSize: 11, color: "#fcd34d",
              wordBreak: "break-all", marginBottom: 10,
            }}>
              {errMsg}
            </div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>
              해결 방법:<br />
              1. Vercel → Settings → Environment Variables<br />
              &nbsp;&nbsp;→ NEXT_PUBLIC_SUPABASE_URL ✓<br />
              &nbsp;&nbsp;→ NEXT_PUBLIC_SUPABASE_ANON_KEY ✓<br />
              2. Vercel → Deployments → Redeploy
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <span
      style={{
        fontSize: 11, color: "#34d399", display: "flex", alignItems: "center",
        gap: 5, whiteSpace: "nowrap", padding: "4px 8px", borderRadius: 8,
        background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.3)",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
      동기화 중
    </span>
  );
}
