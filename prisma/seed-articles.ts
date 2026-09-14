import { db } from "../src/lib/db"

async function main() {
  await db.article.deleteMany()

  const articles = [
    {
      slug: "calm-interfaces",
      title: "On building calm interfaces",
      excerpt:
        "The best software disappears when you're in flow. Here's how I design for calm — reducing cognitive load, respecting attention, and earning trust through consistency.",
      tag: "Essay",
      readingMins: 4,
      publishedAt: new Date("2024-11-15"),
      body: `# On building calm interfaces

The best software disappears when you're in flow. You don't notice the interface — you only notice the work you're doing. This is the goal: **interfaces that reduce cognitive load, never add to it.**

## What "calm" means

Calm is not minimal. Minimal is an aesthetic; calm is a feeling. A calm interface can be dense (a spreadsheet) or sparse (a meditation app) — what matters is that every element earns its place.

Three properties define calm software:

1. **Predictability** — the same action always produces the same result
2. **Reversibility** — every action can be undone without panic
3. **Progressive disclosure** — complexity reveals itself only when needed

## Earning attention

Attention is the scarcest resource your users have. Every animation, every notification, every modal is a withdrawal from that account. Spend it wisely.

> A notification that isn't actionable is just noise wearing a badge.

## The cost of surprise

Surprises break flow. When a button moves, when a shortcut changes, when a dialog appears unexpectedly — the user has to rebuild their mental model. This is expensive.

The fix is boring: **consistency**. The same spacing, the same timing, the same language, everywhere. Boring is a feature.

## Practice

I try to ask three questions before shipping any interface:

- Can a new user figure out the primary action in under 5 seconds?
- Can an experienced user complete it without looking?
- If they make a mistake, can they recover without data loss?

If the answer to any is "no," it's not ready.`,
    },
    {
      slug: "edge-first-architecture",
      title: "Edge-first architecture, explained simply",
      excerpt:
        "Why I run code at the edge instead of a central server — and what it costs. A practical guide to latency, data locality, and the tradeoffs of distributed compute.",
      tag: "Writing",
      readingMins: 5,
      publishedAt: new Date("2024-09-20"),
      body: `# Edge-first architecture, explained simply

Running code at the edge means executing it close to the user — in dozens or hundreds of locations worldwide — instead of in a single central data center. The payoff is latency; the cost is complexity.

## The latency math

A request from London to a server in Virginia takes ~70ms round-trip (RTT) at the speed of light. A request to a London edge node takes ~5ms. That 65ms difference is the difference between "instant" and "snappy."

\`\`\`
User (London) ──5ms──> Edge (London) ──70ms──> Origin (Virginia)
                                              ──70ms──> User
\`\`\`

With edge compute, the request never leaves London:

\`\`\`
User (London) ──5ms──> Edge (London) ──5ms──> User
\`\`\`

## What belongs at the edge

- **Read-heavy data** with eventual consistency (analytics, feature flags)
- **Session handling** (auth tokens, A/B assignments)
- **Personalization** (locale, theme, content variants)
- **Static transforms** (image resizing, redirects)

## What doesn't

- **Multi-region writes** with strong consistency requirements
- **Long-running computations** (>50ms CPU)
- **Heavy stateful sessions** (unless you have a distributed store)

## The tradeoff

Edge compute gives you speed but takes away simplicity. You can't rely on a single database connection. You can't use long-lived in-memory state. You have to design for failure — because any individual edge node might be down.

The rule I follow: **edge for reads, origin for writes, queue for reconciliation.**`,
    },
    {
      slug: "design-tokens-practical",
      title: "Design tokens that actually scale",
      excerpt:
        "Most token systems break at scale. Here's the layering strategy I use — from primitive to semantic to component — that has survived three product rebrands without tears.",
      tag: "Writing",
      readingMins: 6,
      publishedAt: new Date("2024-06-10"),
      body: `# Design tokens that actually scale

Most token systems break at scale because they confuse *what* a token represents with *where* it's used. The fix is layering: primitive → semantic → component.

## The three layers

### 1. Primitive tokens (raw values)

These are your raw materials. They have no meaning beyond their value.

\`\`\`css
--color-violet-500: oklch(0.55 0.22 280);
--color-cyan-500: oklch(0.65 0.2 200);
--space-4: 1rem;
--radius-md: 0.5rem;
\`\`\`

**Rule:** Never use primitive tokens directly in components.

### 2. Semantic tokens (meaning)

These describe *what* a value is for, not *what* it is.

\`\`\`css
--color-primary: var(--color-violet-500);
--color-accent: var(--color-cyan-500);
--space-card-padding: var(--space-4);
--radius-card: var(--radius-md);
\`\`\`

**Rule:** Components consume semantic tokens. Rebranding swaps the mapping.

### 3. Component tokens (context)

Optional, but useful for complex components.

\`\`\`css
--button-bg: var(--color-primary);
--button-radius: var(--radius-card);
--card-bg: var(--color-surface);
\`\`\`

## Why this works

When you rebrand, you change **one layer** (semantic → primitive mapping). Components don't change. Tests don't change. Documentation doesn't change.

| Change | Primitive-only | Layered |
|---|---|---|
| Rebrand | Update every component | Update semantic layer |
| Dark mode | Duplicate every value | Swap semantic mapping |
| New theme | Start from scratch | Add a semantic mapping |

## The anti-pattern

The most common mistake is skipping the semantic layer:

\`\`\`css
/* Bad: component tied to primitive */
.button { background: var(--color-violet-500); }

/* Good: component tied to semantic */
.button { background: var(--color-primary); }
\`\`\`

The first version means a rebrand requires touching every button. The second means a rebrand is one line.`,
    },
    {
      slug: "shipping-small",
      title: "Ship small, ship often",
      excerpt:
        "The single best engineering habit I've developed: shipping tiny changes frequently. Why small PRs beat big branches, and how to make review painless.",
      tag: "Note",
      readingMins: 2,
      publishedAt: new Date("2024-03-05"),
      body: `# Ship small, ship often

The single best engineering habit I've developed: **shipping tiny changes frequently.**

## Why small

A 20-line PR gets reviewed in 5 minutes. A 200-line PR sits for 2 days. A 2000-line PR sits until someone feels guilty, then gets a rubber-stamp merge with a comment that says "lgtm."

Small PRs are:

- **Easier to review** — a reviewer can hold the whole change in their head
- **Easier to revert** — if something breaks, rollback is surgical
- **Easier to write** — the author doesn't lose context between sessions
- **Easier to test** — fewer moving parts means fewer edge cases

## How small

If your PR touches more than 3 files, ask: *can this be two PRs?* Usually, yes.

- Refactor first, feature second
- Backend first, frontend second
- Migration first, usage second

## The habit

Open a draft PR the moment you start. Even if it's empty. This forces you to think about the shape of the change before you're deep in it.

> The best time to write a PR description is before you write the code.`,
    },
  ]

  for (const a of articles) {
    await db.article.create({ data: a })
  }

  console.log(`Seeded ${articles.length} articles.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
