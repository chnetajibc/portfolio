import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import { generateReply, quickPrompts } from "../mock";
import { ChatCards } from "./ChatCards";

function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 px-3 py-2 rounded-2xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur border border-neutral-200/80 dark:border-neutral-700/80">
      <span className="dot h-1.5 w-1.5 rounded-full bg-neutral-500" />
      <span className="dot h-1.5 w-1.5 rounded-full bg-neutral-500" />
      <span className="dot h-1.5 w-1.5 rounded-full bg-neutral-500" />
    </div>
  );
}

// AI bubble — left aligned, with a sharp pointy corner at bottom-left (WhatsApp-style).
function AiBubble({ children }) {
  return (
    <div className="relative max-w-[92%]">
      <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-white/80 dark:bg-neutral-900/70 backdrop-blur border border-neutral-200/80 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-100 text-[14.5px] leading-relaxed whitespace-pre-line shadow-[0_8px_24px_-12px_rgba(0,0,0,0.22)]">
        {children}
      </div>
    </div>
  );
}

// User bubble — right aligned, with a sharp pointy corner at bottom-right.
function UserBubble({ children }) {
  return (
    <div className="relative max-w-[85%]">
      <div
        className="px-4 py-3 rounded-2xl rounded-br-none text-white text-[14.5px] leading-snug shadow-[0_8px_24px_-12px_rgba(37,99,235,0.55)]"
        style={{
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e3a8a 100%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function ChatArea({ active, onActivate, big = false }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);

  const handleSend = (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text) return;
    if (!active) onActivate?.();
    const userMsg = { id: Date.now(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateReply(text);
      setMessages((m) => [...m, { id: Date.now() + 1, role: "ai", ...reply }]);
      setIsTyping(false);
    }, 650 + Math.random() * 400);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const lastAi = [...messages].reverse().find((m) => m.role === "ai");

  const showSendButton = input.trim().length > 0;
  const promptsToShow = active ? quickPrompts.filter((p) => p.keep) : quickPrompts;

  // Initial — heading + suggestions + input clustered in the middle.
  if (!active) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[640px] flex flex-col items-center"
        >
          <motion.h2
            layout
            className="font-display font-semibold text-center text-neutral-900 dark:text-neutral-50 leading-[1.05] tracking-tight"
            style={{ fontSize: big ? "clamp(40px, 4.6vw, 64px)" : "clamp(30px, 3.4vw, 44px)" }}
          >
            Talk to me here.
          </motion.h2>
          <motion.p
            layout
            className="mt-3 max-w-md text-center text-neutral-600 dark:text-neutral-400 leading-relaxed"
            style={{ fontSize: big ? "16px" : "14.5px" }}
          >
            This page is a conversation, not a résumé. Ask about my work, my
            stack, or how to hire me.
          </motion.p>

          <div className="mt-7 flex flex-wrap gap-1.5 justify-center max-w-[520px]">
            {promptsToShow.map((p, i) => (
              <motion.button
                key={p.id}
                onClick={() => handleSend(p.label)}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className={
                  p.highlight
                    ? "text-[12.5px] px-3 py-1.5 rounded-full text-white font-medium shadow-[0_6px_18px_-6px_rgba(37,99,235,0.55)] transition-shadow hover:shadow-[0_8px_22px_-6px_rgba(37,99,235,0.75)]"
                    : "text-[12.5px] px-3 py-1.5 rounded-full bg-white/70 dark:bg-neutral-900/60 backdrop-blur border border-neutral-200 dark:border-neutral-700 hover:border-neutral-900/40 dark:hover:border-neutral-300/40 hover:bg-white dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-200 transition-colors"
                }
                style={
                  p.highlight
                    ? {
                        background:
                          "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e3a8a 100%)",
                      }
                    : undefined
                }
              >
                {p.label}
              </motion.button>
            ))}
          </div>

          <div className="mt-4 w-full max-w-[560px]">
            <div className="relative flex items-center rounded-full bg-white/85 dark:bg-neutral-900/70 backdrop-blur border border-neutral-200 dark:border-neutral-700 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] focus-within:border-blue-700/50 dark:focus-within:border-blue-500/50 focus-within:shadow-[0_10px_36px_-10px_rgba(37,99,235,0.35)] transition-all">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a message to start the conversation…"
                className="flex-1 bg-transparent outline-none px-5 py-3 text-[14px] text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400"
              />
              <AnimatePresence>
                {showSendButton && (
                  <motion.button
                    key="send"
                    initial={{ scale: 0.6, opacity: 0, x: 6 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    exit={{ scale: 0.6, opacity: 0, x: 6 }}
                    transition={{ type: "spring", stiffness: 280, damping: 20 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleSend()}
                    aria-label="Send message"
                    className="mr-1.5 h-9 w-9 rounded-full text-white flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e3a8a 100%)" }}
                  >
                    <Send className="h-4 w-4" strokeWidth={2.4} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active — fills the right column vertically; user Q on top, AI response below, suggestions+input at bottom.
  return (
    <div className="flex flex-col h-full w-full">
      {/* Conversation surface — flex-grows to fill column */}
      <div className="flex-1 min-h-0 flex flex-col gap-4 pt-2">
        {lastUser && (
          <motion.div
            key={lastUser.id}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-end"
          >
            <UserBubble>{lastUser.text}</UserBubble>
          </motion.div>
        )}

        <div className="flex-1 min-h-0 flex flex-col">
          {isTyping ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex">
              <TypingIndicator />
            </motion.div>
          ) : lastAi ? (
            <motion.div
              key={lastAi.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col"
            >
              <AiBubble>{lastAi.text}</AiBubble>
              <ChatCards reply={lastAi} />
            </motion.div>
          ) : null}
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-4 flex flex-wrap gap-1.5 justify-center lg:justify-start">
        <AnimatePresence mode="popLayout">
          {promptsToShow.map((p, i) => (
            <motion.button
              key={p.id}
              layout
              onClick={() => handleSend(p.label)}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -4, opacity: 0 }}
              transition={{ delay: 0.05 + i * 0.03 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className={
                p.highlight
                  ? "text-[12.5px] px-3 py-1.5 rounded-full text-white font-medium shadow-[0_6px_18px_-6px_rgba(37,99,235,0.55)] transition-shadow hover:shadow-[0_8px_22px_-6px_rgba(37,99,235,0.75)]"
                  : "text-[12.5px] px-3 py-1.5 rounded-full bg-white/70 dark:bg-neutral-900/60 backdrop-blur border border-neutral-200 dark:border-neutral-700 hover:border-neutral-900/40 dark:hover:border-neutral-300/40 hover:bg-white dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-200 transition-colors"
              }
              style={
                p.highlight
                  ? {
                      background:
                        "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e3a8a 100%)",
                    }
                  : undefined
              }
            >
              {p.label}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="mt-3">
        <div className="relative flex items-center rounded-full bg-white/85 dark:bg-neutral-900/70 backdrop-blur border border-neutral-200 dark:border-neutral-700 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] focus-within:border-blue-700/50 dark:focus-within:border-blue-500/50 focus-within:shadow-[0_10px_36px_-10px_rgba(37,99,235,0.35)] transition-all">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Continue the conversation…"
            className="flex-1 bg-transparent outline-none px-5 py-3 text-[14px] text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400"
          />
          <AnimatePresence>
            {showSendButton && (
              <motion.button
                key="send"
                initial={{ scale: 0.6, opacity: 0, x: 6 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0.6, opacity: 0, x: 6 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleSend()}
                aria-label="Send message"
                className="mr-1.5 h-9 w-9 rounded-full text-white flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e3a8a 100%)" }}
              >
                <Send className="h-4 w-4" strokeWidth={2.4} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
