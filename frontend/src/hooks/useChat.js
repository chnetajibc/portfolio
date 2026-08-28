import { useRef, useState } from "react";
import { postChat } from "../lib/api";
import sectionsData from "../data/sections.json";
import chatConfig from "../data/chat-config.json";

const SMART_PROMPTS = Object.fromEntries(sectionsData.map((s) => [s.id, s.id]));
const HIRE_KEYWORDS = chatConfig.hireKeywords;

export default function useChat({ active, onActivate, onPromptAction }) {
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAi, setCurrentAi] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showHireForm, setShowHireForm] = useState(false);
  const inputRef = useRef(null);

  const checkSmartPrompt = (text) => {
    const lower = text.toLowerCase().trim();
    if (HIRE_KEYWORDS.some((k) => lower.includes(k))) {
      setShowHireForm(true);
      setCurrentAi(null);
      return true;
    }
    for (const [keyword, action] of Object.entries(SMART_PROMPTS)) {
      if (lower === keyword) {
        setShowHireForm(false);
        setCurrentAi(null);
        onPromptAction?.(action);
        return true;
      }
    }
    return false;
  };

  const handleSend = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text) return;
    if (!active) onActivate?.();

    setCurrentUser({ id: Date.now(), text });
    setCurrentAi(null);
    setShowHireForm(false);
    setInput("");

    if (checkSmartPrompt(text)) return;

    setIsTyping(true);
    try {
      const message = await postChat(text);
      setCurrentAi({ id: Date.now() + 1, kind: "text", text: message });
    } catch (err) {
      let msg = "Something went wrong. Please try again later.";
      if (err.code === "DAILY_LIMIT_REACHED") msg = "Daily AI limit reached. Please try again tomorrow.";
      else if (err.code === "RATE_LIMITED") msg = "You're sending messages too quickly. Please try again later.";
      else if (err.code === "VALIDATION_ERROR") msg = err.message || "Invalid message.";
      else if (err.message) msg = err.message;
      setCurrentAi({ id: Date.now() + 1, kind: "text", text: msg });
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptClick = (prompt) => {
    if (prompt.id === chatConfig.hirePromptId) {
      if (!active) onActivate?.();
      setCurrentUser({ id: Date.now(), text: prompt.label });
      setCurrentAi(null);
      setShowHireForm(true);
      return;
    }
    handleSend(prompt.label);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return {
    input,
    setInput,
    currentUser,
    currentAi,
    isTyping,
    showHireForm,
    inputRef,
    handleSend,
    handlePromptClick,
    onKeyDown,
  };
}
