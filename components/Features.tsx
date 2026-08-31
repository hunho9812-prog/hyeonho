"use client";

import Link from "next/link";

interface FeatureCard {
  emoji: string;
  title: string;
  description: string;
  tags: string[];
  href?: string;
  comingSoon?: boolean;
  gradient: { from: string; to: string; accent: string };
}

interface SiteLink {
  emoji: string;
  title: string;
  subtitle: string;
  url: string;
  color: string;
}

const features: FeatureCard[] = [
  {
    emoji: "💰",
    title: "자산 관리",
    description: "자산 현황을 기록하고 관리하는 공간입니다. 상세 기능은 준비 중입니다.",
    tags: ["자산 관리"],
    href: "/assets",
    comingSoon: true,
    gradient: { from: "#7c3aed", to: "#2563eb", accent: "rgba(124,58,237,0.25)" },
  },
  {
    emoji: "📆",
    title: "달력",
    description:
      "월별 캘린더로 일정을 한눈에 확인하고 날짜별로 메모를 기록하세요. 색상으로 일정을 구분할 수 있습니다.",
    tags: ["일정 관리", "월간 계획"],
    href: "/calendar",
    gradient: { from: "#0891b2", to: "#0e7490", accent: "rgba(8,145,178,0.25)" },
  },
  {
    emoji: "✅",
    title: "TO DO LIST",
    description:
      "오늘의 할 일을 계획하고 체크하세요. Brain Dump, Big 3 우선순위, 타임박스로 하루를 알차게 채워보세요.",
    tags: ["할 일 관리", "일일 플래너"],
    href: "/todo",
    gradient: { from: "#059669", to: "#0891b2", accent: "rgba(5,150,105,0.2)" },
  },
  {
    emoji: "💭",
    title: "나의 생각",
    description:
      "블로그처럼 생각과 아이디어를 기록하세요. 제목과 본문으로 글을 작성하고 저장된 글을 목록으로 관리할 수 있습니다.",
    tags: ["노트 작성", "아이디어 기록"],
    href: "/thoughts",
    gradient: { from: "#7c3aed", to: "#db2777", accent: "rgba(124,58,237,0.2)" },
  },
];

const siteLinks: SiteLink[] = [
  {
    emoji: "💻",
    title: "온라인 학습",
    subtitle: "eClass 강의 수강 및 과제 제출",
    url: "https://eclass3.cau.ac.kr/",
    color: "rgba(37,99,235,0.2)",
  },
  {
    emoji: "🏫",
    title: "중앙대 포탈",
    subtitle: "학생 종합 포탈 서비스",
    url: "https://mportal.cau.ac.kr",
    color: "rgba(124,58,237,0.2)",
  },
  {
    emoji: "📆",
    title: "학사일정",
    subtitle: "학기별 주요 학사 일정 확인",
    url: "https://www.cau.ac.kr/cms/FR_CON/index.do?MENU_ID=590",
    color: "rgba(5,150,105,0.2)",
  },
  {
    emoji: "⚡",
    title: "에시공 홈페이지",
    subtitle: "에너지시스템공학부 공식 사이트",
    url: "https://ese.cau.ac.kr",
    color: "rgba(217,119,6,0.2)",
  },
];

export default function Features() {
  return (
    <section id="features" className="pt-4 pb-24 px-6 flex flex-col items-center">
      <div className="w-full" style={{ maxWidth: "64rem" }}>

        {/* ── 기능 섹션 ── */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">
            기능을 <span className="gradient-text">선택</span>하세요
          </h2>
          <p className="text-gray-400 text-lg">
            공부와 일상을 더 효율적으로 관리할 수 있는 도구들
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-24">
          {features.map((feat, idx) => (
            <div
              key={feat.title}
              className={`rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                idx === features.length - 1 && features.length % 2 !== 0
                  ? "md:col-span-2 md:max-w-sm md:mx-auto md:w-full"
                  : ""
              }`}
              style={{
                background: "rgba(15,15,25,0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
                style={{
                  background: feat.gradient.accent,
                  border: `1px solid ${feat.gradient.accent}`,
                }}
              >
                {feat.emoji}
              </div>

              {/* Title + coming soon */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <h3 className="text-xl font-bold text-white">{feat.title}</h3>
                {feat.comingSoon && (
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#94a3b8",
                    }}
                  >
                    준비 중
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-5 flex-1">
                {feat.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {feat.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      background: feat.gradient.accent,
                      color: "#e2e8f0",
                      border: `1px solid ${feat.gradient.accent}`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA button */}
              {feat.href ? (
                <Link
                  href={feat.href}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white text-center transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${feat.gradient.from}, ${feat.gradient.to})`,
                    boxShadow: `0 4px 16px ${feat.gradient.accent}`,
                  }}
                >
                  {feat.title} 바로가기 →
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-xl text-sm font-semibold cursor-not-allowed"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#475569",
                  }}
                >
                  준비 중...
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ── 관련 사이트 섹션 ── */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            관련 <span className="gradient-text">사이트</span>
          </h2>
          <p className="text-gray-400">자주 가는 학교 사이트 바로가기</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {siteLinks.map((site) => (
            <a
              key={site.title}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl group"
              style={{
                background: "rgba(15,15,25,0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: site.color }}
              >
                {site.emoji}
              </div>
              <p className="text-white font-semibold text-sm mb-1">{site.title}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{site.subtitle}</p>
              <div
                className="mt-4 text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: site.color, color: "#e2e8f0" }}
              >
                바로가기 ↗
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
