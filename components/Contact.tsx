export default function Contact() {
  return (
    <section id="contact" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="glass-card rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            함께 만들어요 🤝
          </h2>
          <p className="text-gray-400 mb-12 max-w-md mx-auto leading-relaxed">
            새로운 프로젝트, 협업 제안, 또는 단순한 인사라도 언제든지
            연락주세요!
          </p>

          <a
            href="mailto:rlagusgh1214@naver.com"
            className="inline-block px-10 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              boxShadow: "0 4px 30px rgba(124, 58, 237, 0.4)",
            }}
          >
            📧 rlagusgh1214@naver.com
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>© 2026 김현호. Made with ❤️ and Next.js</p>
        </div>
      </div>
    </section>
  );
}
