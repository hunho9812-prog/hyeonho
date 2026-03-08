"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Status = "checking" | "ok" | "error";

export default function SyncStatus() {
  const [status, setStatus] = useState<Status>("checking");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrMsg("연결 시간 초과 - Vercel 환경변수와 재배포를 확인하세요");
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

  const dotStyle = (color: string): React.CSSProperties => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: color,
    display: "inline-block",
    flexShrink: 0,
  });

  const wrapStyle = (color: string, cursor?: string): React.CSSProperties => ({
    fontSize: 11,
    color,
    display: "flex",
    alignItems: "center",
    gap: 5,
    whiteSpace: "nowrap",
    cursor: cursor ?? "default",
    padding: "4px 8px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${color}33`,
  });

  if (status === "checking") {
    return (
      <span style={wrapStyle("#94a3b8")} title="Supabase 연결 확인 중...">
        <span style={dotStyle("#94a3b8")} />
        확인 중
      </span>
    );
  }

  if (status === "error") {
    return (
      <span
        style={wrapStyle("#f87171", "help")}
        title={`연결 실패: ${errMsg}\n\n해결 방법:\n1. Vercel → Settings → Environment Variables에서\n   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 확인\n2. Vercel → Deployments → Redeploy`}
      >
        <span style={dotStyle("#f87171")} />
        동기화 오류
      </span>
    );
  }

  return (
    <span style={wrapStyle("#34d399")} title="Supabase 연결됨 - 기기간 동기화 활성화">
      <span style={dotStyle("#34d399")} />
      동기화 중
    </span>
  );
}
