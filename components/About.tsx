const stats = [
  { value: "3+", label: "년 경력" },
  { value: "20+", label: "완료 프로젝트" },
  { value: "∞", label: "커피 잔" },
];

export default function About() {
  return (
    <section id="about" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <h2 className="section-title text-white mb-8">
              저에 대해서
            </h2>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                안녕하세요! 저는 <span className="text-purple-400 font-medium">김현호</span>입니다.
                웹 개발과 소프트웨어 엔지니어링에 열정을 가지고 있습니다.
              </p>
              <p>
                사용자 경험을 최우선으로 생각하며, 깔끔하고 효율적인 코드를
                작성하는 것을 중요하게 여깁니다. 새로운 기술을 배우는 것을
                즐기며, 팀과 협력하여 더 나은 결과를 만들어 냅니다.
              </p>
              <p>
                개발 외에도 음악 감상, 독서, 그리고 새로운 카페를 탐방하는
                것을 즐깁니다.
              </p>
            </div>
          </div>

          {/* Right - Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <div className="text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
            {/* Quote card */}
            <div className="glass-card rounded-2xl p-6 col-span-3">
              <p className="text-gray-300 italic text-center">
                &ldquo;코드는 단순히 기계를 위한 것이 아니라,
                <br />
                사람을 위한 이야기입니다.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
