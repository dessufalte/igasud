"use client"

const TECHS = [
  "TypeScript",
  "Next.js 16",
  "React 19",
  "Tailwind CSS 4",
  "Prisma",
  "shadcn/ui",
  "Framer Motion",
  "Edge Runtime",
  "Zustand",
  "TanStack Query",
  "Vitest",
  "Playwright",
  "Zod",
  "tRPC",
  "Storybook",
  "Figma",
]

export function TechMarquee() {
  // Duplicate the list so the marquee loops seamlessly
  const items = [...TECHS, ...TECHS]
  return (
    <div
      className="marquee py-3 select-none"
      aria-hidden="true"
    >
      <div className="marquee-track">
        {items.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap"
          >
            <span className="h-1 w-1 rounded-full bg-foreground/30" />
            <span className="font-medium tracking-tight">{t}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
