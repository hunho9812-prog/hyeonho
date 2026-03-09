export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient orbs */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-[50%] left-[50%] w-[400px] h-[400px] rounded-full opacity-10"
        style={{
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, #059669 0%, transparent 70%)",
        }}
      />
      {/* Grid pattern — masked at top to hide behind header area */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "linear-gradient(to bottom, transparent 0px, transparent 80px, black 120px)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, transparent 80px, black 120px)",
        }}
      />
    </div>
  );
}
