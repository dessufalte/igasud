"use client"

export function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      {/* Top-left violet */}
      <div
        className="ambient-blob animate-float-slow"
        style={{
          top: "-15%",
          left: "-10%",
          width: "55vw",
          height: "55vw",
          background:
            "radial-gradient(circle at center, oklch(0.65 0.25 290 / 0.55), transparent 65%)",
        }}
      />
      {/* Top-right cyan */}
      <div
        className="ambient-blob animate-float-slower"
        style={{
          top: "-5%",
          right: "-15%",
          width: "50vw",
          height: "50vw",
          background:
            "radial-gradient(circle at center, oklch(0.7 0.2 200 / 0.5), transparent 65%)",
        }}
      />
      {/* Bottom warm */}
      <div
        className="ambient-blob animate-float-slow"
        style={{
          bottom: "-20%",
          left: "30%",
          width: "60vw",
          height: "60vw",
          background:
            "radial-gradient(circle at center, oklch(0.75 0.22 60 / 0.4), transparent 65%)",
          animationDelay: "-6s",
        }}
      />
      {/* Subtle grain overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
