// Mock data for the AI Chat Portfolio. Replace with real data later.

export const profile = {
  name: "CH Netaji Bhadraiahnath Chowdary",
  shortName: "Netaji",
  initials: "NBC",
  shortInitial: "N",
  titles: ["Software Developer", "AI Engineer"],
  // Marker tag {blue}...{/blue} flags inline-highlight content for the renderer.
  bio: `I'm a software engineer who lives at the intersection of clean code and curious ideas. I ship production ML systems by day and sketch orbital trajectories by night.\n\nLately I'm obsessed with making AI feel less like a black box and more like a thoughtful colleague — {blue}so this page is a conversation, not a résumé.{/blue}`,
  location: "Chennai, India",
  email: "netaji.chowdary@example.com",
  available: true,
  // Things I love — used as a subtle interest strip
  interests: [
    { icon: "sun", label: "heliophile" },
    { icon: "rocket", label: "space travel" },
    { icon: "orbit", label: "stargazer" },
  ],
  languages: [
    { native: "தமிழ்", roman: "Tamil", note: "love" },
    { native: "తెలుగు", roman: "Telugu", note: "mother tongue" },
    { native: "English", roman: "English" },
  ],
};

export const socials = [
  { id: "github", label: "GitHub", url: "https://github.com", color: "#181717" },
  { id: "linkedin", label: "LinkedIn", url: "https://linkedin.com", color: "#0A66C2" },
  { id: "x", label: "X / Twitter", url: "https://x.com", color: "#0f172a" },
  { id: "mail", label: "Email", url: "mailto:netaji.chowdary@example.com", color: "#1d4ed8" },
  { id: "leetcode", label: "LeetCode", url: "https://leetcode.com", color: "#FFA116" },
  { id: "discord", label: "Discord", url: "https://discord.com", color: "#5865F2" },
];

export const experience = [
  {
    id: "exp1",
    role: "Senior Software Engineer · ML Platform",
    company: "Lumen Labs",
    period: "2023 — Present",
    location: "Remote",
    summary: "Leading a small team building a real-time AI inference platform serving 80M+ requests/month.",
    highlights: [
      "Cut p95 latency 47% by re-architecting the request pipeline around streaming gRPC.",
      "Designed an internal feature flag + experimentation system used across 6 squads.",
      "Mentored 4 engineers; two were promoted within the year.",
    ],
    stack: ["Go", "Python", "PyTorch", "Kubernetes", "Postgres", "Redis"],
  },
  {
    id: "exp2",
    role: "Software Engineer",
    company: "Northwind Cloud",
    period: "2021 — 2023",
    location: "Bengaluru, IN",
    summary: "Built billing, metering and identity services for a multi-tenant cloud product.",
    highlights: [
      "Owned the metering pipeline processing ~2B events/month with five-nines accuracy.",
      "Wrote the OAuth2 + SSO layer adopted by every internal product.",
    ],
    stack: ["TypeScript", "Node.js", "AWS", "DynamoDB"],
  },
  {
    id: "exp3",
    role: "Software Engineer Intern",
    company: "Helio AI",
    period: "Summer 2020",
    location: "Remote",
    summary: "Prototyped an internal LLM evaluation harness still used by the platform team today.",
    highlights: ["Shipped a CLI + dashboard for tracking eval drift across model versions."],
    stack: ["Python", "FastAPI", "React"],
  },
];

export const projects = [
  {
    id: "p1",
    name: "Synapse",
    tagline: "A self-hosted vector memory for personal LLM agents.",
    description:
      "Synapse is an open source toolkit that gives any local LLM a long-term memory. It indexes your notes, chats and bookmarks into a hybrid vector + keyword store and exposes a small, sharp API.",
    role: "Creator & maintainer",
    year: 2025,
    stack: ["Rust", "SQLite", "PyO3", "FastAPI"],
    metrics: ["4.2k★ on GitHub", "Used by 700+ devs", "<5ms p50 query"],
    link: "#",
  },
  {
    id: "p2",
    name: "Driftboard",
    tagline: "Observability for ML model regressions.",
    description:
      "A drift-detection dashboard that flags silent model regressions before they hit users. Pluggable into any inference stack via a 12-line client.",
    role: "Lead engineer",
    year: 2024,
    stack: ["Python", "ClickHouse", "Next.js", "D3"],
    metrics: ["Caught 14 production regressions in pilot", "Adopted by 3 teams"],
    link: "#",
  },
  {
    id: "p3",
    name: "Heliograph",
    tagline: "A real-time visualizer for solar weather.",
    description:
      "A side project I built because I love the sun. Pulls NOAA data and renders the solar wind as an interactive 3D orbit map.",
    role: "Solo project",
    year: 2024,
    stack: ["React", "Three.js", "WebGL"],
    metrics: ["Featured on Hacker News front page"],
    link: "#",
  },
  {
    id: "p4",
    name: "Grain",
    tagline: "Tiny static site generator written in Go.",
    description: "~600 LOC, no plugins, brutally fast. Powers this very portfolio.",
    role: "Author",
    year: 2023,
    stack: ["Go"],
    metrics: ["<40ms full rebuild"],
    link: "#",
  },
];

export const skills = [
  {
    group: "AI / ML",
    items: [
      { name: "PyTorch", level: 88 },
      { name: "Transformers / LLMs", level: 90 },
      { name: "RAG & Vector DBs", level: 92 },
      { name: "MLOps", level: 84 },
      { name: "ONNX / Triton", level: 78 },
    ],
  },
  {
    group: "Languages",
    items: [
      { name: "Python", level: 95 },
      { name: "Go", level: 88 },
      { name: "TypeScript", level: 90 },
      { name: "Rust", level: 70 },
      { name: "SQL", level: 92 },
    ],
  },
  {
    group: "Infra & Cloud",
    items: [
      { name: "AWS", level: 88 },
      { name: "Kubernetes", level: 84 },
      { name: "Postgres", level: 90 },
      { name: "Redis / Kafka", level: 80 },
    ],
  },
];

export const achievements = [
  {
    id: "a1",
    title: "Speaker — PyCon India 2024",
    detail: "Talk: 'Boring infra for exciting LLMs' — top-10 most attended talk of the conference.",
    year: 2024,
  },
  {
    id: "a2",
    title: "GitHub Stars Honoree",
    detail: "Recognised for Synapse crossing 4k stars and being featured in GitHub's monthly trends.",
    year: 2024,
  },
  {
    id: "a3",
    title: "AWS Solutions Architect — Professional",
    detail: "Certified with a 92nd percentile score.",
    year: 2023,
  },
  {
    id: "a4",
    title: "Hackathon Winner — TechCrunch Disrupt",
    detail: "Built a real-time accessibility caption tool for live streams in 36 hours.",
    year: 2022,
  },
  {
    id: "a5",
    title: "Patent — Adaptive Inference Routing",
    detail: "Co-inventor on a granted US patent for cost-aware ML model routing.",
    year: 2023,
  },
];

// Initial 5 (3 first row + 2 second row), and a 3-only set when chat is active.
export const quickPrompts = [
  { id: "projects", label: "Tell me about your projects" },
  { id: "stack", label: "What's your tech stack?" },
  { id: "ai", label: "Your AI / ML experience?", keep: true },
  { id: "best", label: "Show me your best work", keep: true },
  { id: "hire", label: "How do I hire you?", highlight: true, keep: true },
];

// Lightweight "AI" — keyword-matched responses. We'll swap this for a real model later.
export function generateReply(input) {
  const q = (input || "").toLowerCase().trim();

  if (!q) return { kind: "text", text: "Ask me anything — try one of the prompts below." };

  if (/^(hi|hello|hey|yo|namaste|hola|vanakkam|namaskaram)\b/.test(q)) {
    return {
      kind: "text",
      text: `வணக்கம் 🙏🏼  I'm Netaji. Pick a prompt below or ask me anything.`,
    };
  }

  if (/^(bye|goodbye|cya|see ya|see you|later|adios|ciao|tata|selavu)\b/.test(q)) {
    return {
      kind: "text",
      text: `మళ్ళీ కలుస్తాం 👋  Catch you in the next orbit. If anything sparks later, my inbox is always open — ${profile.email}.`,
    };
  }

  if (/(hire|contact|email|reach|available|freelance|recruit|opportunit|consult|startup)/.test(q)) {
    return {
      kind: "hire-form",
      text: `Happy to hear it. Drop a few details and I'll get back to you...`,
    };
  }

  if (/(ai|ml|machine learning|deep learning|llm|model|neural|nlp|rag)/.test(q)) {
    return {
      kind: "text",
      text:
        "I've spent the last 3 years shipping production ML — fine-tuning small LLMs for retrieval, building RAG pipelines that don't hallucinate, and packaging models into low-latency inference services. I care more about evals and reliability than benchmarks. Recent wins: a 7B fine-tune deflecting 38% of L1 tickets, a hybrid-retrieval RAG with 91% answer-grounded responses, and an open-source vector memory used by 700+ devs.",
    };
  }

  if (/(project|build|built|portfolio of work|github|best work)/.test(q)) {
    return {
      kind: "text",
      text:
        "A few favourites: Synapse — a self-hosted vector memory for personal LLM agents (4.2k★ on GitHub). Driftboard — observability for ML model regressions, used to catch 14 silent regressions in a pilot. Heliograph — a real-time visualizer for solar weather (yes, I really love the sun). For the full breakdown, hit the Projects card on the left.",
    };
  }

  if (/(skill|stack|tech|language|framework|tool)/.test(q)) {
    return {
      kind: "text",
      text:
        "Day-to-day: Python, Go and TypeScript. ML stack: PyTorch, Transformers, vLLM and Triton. Infra: AWS, Kubernetes, Postgres, Redis and Kafka. Open the Skills card on the left for honest levels and a few I'm still learning.",
    };
  }

  if (/(experience|work|job|company|career)/.test(q)) {
    return {
      kind: "text",
      text:
        "Currently leading the ML platform team at Lumen Labs, where we serve 80M+ inferences a month. Before that, I built billing, metering and identity for Northwind Cloud and interned at Helio AI. The Experience card has the full story.",
    };
  }

  if (/(achievement|award|recognit|certif|patent|talk|speak)/.test(q)) {
    return {
      kind: "text",
      text:
        "Spoke at PyCon India 2024, hold an AWS SA-Pro cert, won TechCrunch Disrupt's hackathon in 2022 and co-invented a US patent on adaptive inference routing. The Achievements card has the rest.",
    };
  }

  if (/(space|cosmos|sun|star|nasa|spacex|orbit|rocket|astronom)/.test(q)) {
    return {
      kind: "text",
      text: `Outside of code, the cosmos is my favourite distraction. I read NASA mission updates the way most people read sports — and I built Heliograph, a side project that turns solar-wind data into a live 3D orbit map. If we ever work together, expect at least one analogy involving Lagrange points.`,
    };
  }

  if (/(language|tamil|telugu|speak)/.test(q)) {
    return {
      kind: "text",
      text: `I speak Telugu (mother tongue), Tamil (the love of my life — Chennai will do that to you) and English. Code is the fourth.`,
    };
  }

  if (/(who|about|you|yourself|bio)/.test(q)) {
    return { kind: "text", text: profile.bio.replace(/\{blue\}|\{\/blue\}/g, "") };
  }

  if (/(thank|thanks|cool|nice|awesome|nandri|dhanyavadalu)/.test(q)) {
    return { kind: "text", text: `Anytime. Feel free to ping me directly — ${profile.email}.` };
  }

  return {
    kind: "text",
    text: `Good question. Try one of the prompts below — or ask me about projects, AI/ML, skills, experience, achievements, space, languages, or how to hire me.`,
  };
}
