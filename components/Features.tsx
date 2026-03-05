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

const features: FeatureCard[] = [
  {
    emoji: "📅",
    title: "시간표",
    description:
      "강의 시간을 자유롭게 입력해서 나만의 시간표를 만들 수 있습니다. 11시 45분처럼 분 단위까지 정확하게 설정할 수 있습니다.",
    tags: ["시간 관리", "학사 일정"],
    href: "/timetable",
    gradient: { from: "#7c3aed", to: "#2563eb", accent: "rgba(124,58,237,0.25)" },
  },
  {
    emoji: "✅",
    title: "과제 체크리스트",
    description:
      "해야 할 과제와 마감일을 정리하고 완료 여부를 체크할 수 있습니다. 놓치는 과제 없이 학업을 관리하세요.",
    tags: ["할 일 관리", "마감 관리"],
    comingSoon: true,
    gradient: { from: "#059669", to: "#0891b2", accent: "rgba(5,150,105,0.2)" },
  },
  {
    emoji: "📊",
    title: "성적 계산기",
    description:
      "중간·기말·과제 비중을 입력하면 예상 학점과 최종 성적을 자동으로 계산해드립니다.",
    tags: ["성적 관리", "학점 계산"],
    comingSoon: true,
    gradient: { from: "#d97706", to: "#dc2626", accent: "rgba(217,119,6,0.2)" },
  },
  {
    emoji: "📝",
    title: "강의 노트",
    description:
      "수업별로 노트를 작성하고 정리할 수 있습니다. 과목마다 별도 공간에서 깔끔하게 메모하세요.",
    tags: ["노트 작성", "복습"],
    comingSoon: true,
    gradient: { from: "#7c3aed", to: "#db2777", accent: "rgba(124,58,237,0.2)" },
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">
            기능을 <span className="gradient-text">선택</span>하세요
          </h2>
          <p className="text-gray-400 text-lg">
            공부와 일상을 더 효율적으로 관리할 수 있는 도구들
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="rounded-2xl p-8 flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              style={{
                background: "rgba(15,15,25,0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 self-start"
                style={{ background: feat.gradient.accent, border: `1px solid ${feat.gradient.accent}` }}
              >
                {feat.emoji}
              </div>

              {/* Title + coming soon */}
              <div className="flex items-center gap-3 mb-3">
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
              <div className="flex flex-wrap gap-2 mb-6">
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
      </div>
    </section>
  );
}
