// Mock data for the AI Chat Portfolio — re-exports from structured data files.
// This file maintains backward compatibility for existing imports.

import profileData from "./data/profile.json";
import socialsData from "./data/socials.json";
import experienceData from "./data/experience.json";
import projectsData from "./data/projects.json";
import skillsData from "./data/skills.json";
import achievementsData from "./data/achievements.json";
import quickPromptsData from "./data/quick-prompts.json";

export const profile = profileData;
export const socials = socialsData;
export const experience = experienceData;
export const projects = projectsData;
export const skills = skillsData;
export const achievements = achievementsData;
export const quickPrompts = quickPromptsData;

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
        "I've spent the last few years shipping production ML — fine-tuning LLMs, building RAG pipelines that don't hallucinate, and packaging models into low-latency inference services using Triton. I care more about evals and reliability than benchmarks. Recent work: MaaS platform with Triton Inference Server, synthetic dataset generation with multi-model orchestration, RAG-based automation pipelines, and on-device AI chatbots with BLIP vision models.",
    };
  }

  if (/(project|build|built|portfolio of work|github|best work)/.test(q)) {
    return {
      kind: "text",
      text:
        "A few favourites: CTI Threat Analyser — automated Cyber Threat Intelligence ingestion with MITRE ATT&CK mapping and LLM-powered chatbot. Image Recognition Chatbot — on-device AI with Llama 3.1:7b + BLIP for electronics domain (70% accuracy). MaaS Platform — Triton Inference Server for cross-team model serving. Autotask-Datto RMM Automation — FastAPI pipeline with RAG-based SOP retrieval. For the full breakdown, hit the Projects card on the left.",
    };
  }

  if (/(skill|stack|tech|language|framework|tool)/.test(q)) {
    return {
      kind: "text",
      text:
        "Day-to-day: Python, JavaScript/TypeScript, Go, Rust. ML stack: PyTorch, TensorFlow, LangChain, LangGraph, Transformers, Triton. Frameworks: FastAPI, React, Next.js, React-Native, Express, Flask. Databases: PostgreSQL, Redis, MongoDB, Pinecone, ChromaDB, DynamoDB, MySQL. Cloud: AWS, GCP, Docker, Kubernetes. Open the Skills card on the left for honest levels and a few I'm still learning.",
    };
  }

  if (/(experience|work|job|company|career|intern)/.test(q)) {
    return {
      kind: "text",
      text:
        "Currently: SDE Intern at Amazon (Alexa+), working on error classification models, MCP AddOn delegation for Spotify, and Echo Show hardware acceleration. Previous: AI Engineering Intern at Detect Technologies (MaaS platform with Triton), Intern at Smilo Data Consultancy (RAG automation pipeline), Project Intern at HCLTech (LSTM Voice Emotion Recognition, 30% latency reduction). The Experience card has the full story.",
    };
  }

  if (/(achievement|award|recognit|certif|patent|talk|speak|leetcode|hackathon|scholarship)/.test(q)) {
    return {
      kind: "text",
      text:
        "LeetCode 50-day streak (250+ problems), Open Weaver Make-a-thon winner, Chancellor's Merit Scholarship, WARTECH Python contest winner, IEEE Xplore publication on Agentic AI (pending), NPTEL/IIT Madras & Coursera/IBM certifications. The Achievements card has the rest.",
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