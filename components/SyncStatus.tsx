"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Status = "checking" | "ok" | "error";

export default function SyncStatus() {
  const [status, setStatus] = useState<Status>("checking");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    async function check() {
      // 단순 연결 테스트: planner 테이블에서 1행 조회
      const { error } = await supabase
        .from("planner")
        .select("date")
        .limit(1);

      if (error) {
        setErrMsg(error.message);
        setStatus("error");
      } else {
        setStatus("ok");
      }
    }
    check();
  }, []);

  if (status === "checking") {
    return (
      <span
        title="Supabase 연결 확인 중..."
        style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
        동기화 확인 중
      </span>
    );
  }

  if (status === "error") {
    return (
      <span
        title={`Supabase 연결 실패: ${errMsg}\n\nVercel 환경변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)를 확인하고 재배포하세요.`}
        style={{ fontSize: 11, color: "#f87171", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", cursor: "help" }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f87171", display: "inline-block" }} />
        동기화 오류
      </span>
    );
  }

  return (
    <span
      title="Supabase 연결됨 - 기기간 동기화 활성화"
      style={{ fontSize: 11, color: "#34d399", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
      동기화 중
    </span>
  );
}
