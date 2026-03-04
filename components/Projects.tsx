const projects = [
  {
    title: "프로젝트 Alpha",
    description:
      "React와 Node.js를 활용한 풀스택 웹 애플리케이션. 사용자 인증, 실시간 데이터 처리, 반응형 UI를 구현했습니다.",
    tags: ["React", "Node.js", "PostgreSQL", "Docker"],
    emoji: "🚀",
    color: "from-purple-500/20 to-blue-500/20",
    border: "border-purple-500/30",
  },
  {
    title: "프로젝트 Beta",
    description:
      "Next.js와 TypeScript로 구축된 고성능 E-commerce 플랫폼. SEO 최적화와 결제 시스템을 통합했습니다.",
    tags: ["Next.js", "TypeScript", "Stripe", "Prisma"],
    emoji: "🛍️",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
  },
  {
    title: "프로젝트 Gamma",
    description:
      "Python FastAPI 기반의 RESTful API 서버. 머신러닝 모델을 통합하여 데이터 분석 기능을 제공합니다.",
    tags: ["Python", "FastAPI", "Redis", "AWS"],
    emoji: "🤖",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="section-title text-white mb-12">프로젝트</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className={`rounded-2xl p-6 border ${project.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
              style={{
                background: `linear-gradient(135deg, ${project.color.split(" ")[0].replace("from-", "").replace("/20", "")}33, ${project.color.split(" ")[1].replace("to-", "").replace("/20", "")}33)`,
                borderWidth: "1px",
              }}
            >
              <div className="text-4xl mb-4">{project.emoji}</div>
              <h3 className="text-xl font-bold text-white mb-3">
                {project.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-8 text-sm">
          * 실제 프로젝트로 업데이트해주세요
        </p>
      </div>
    </section>
  );
}
