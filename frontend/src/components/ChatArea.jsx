import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { quickPrompts } from "../mock";
import useChat from "../hooks/useChat";
import { ChatCards } from "./ChatCards";
import HireForm from "./HireForm";

function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 px-3 py-2 rounded-2xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur border border-neutral-200/80 dark:border-neutral-700/80">
      <span className="dot h-1.5 w-1.5 rounded-full bg-neutral-500" />
      <span className="dot h-1.5 w-1.5 rounded-full bg-neutral-500" />
      <span className="dot h-1.5 w-1.5 rounded-full bg-neutral-500" />
    </div>
  );
}

function AiBubble({ children }) {
  return (
    <div className="relative max-w-[92%] lg:max-w-[92%]">
      <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-white/80 dark:bg-neutral-900/70 backdrop-blur border border-neutral-200/80 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-100 text-[14px] lg:text-[14.5px] leading-relaxed shadow-[0_8px_24px_-12px_rgba(0,0,0,0.22)]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-neutral-900 dark:text-neutral-50">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300">
                {children}
              </a>
            ),
            code: ({ inline, children }) =>
              inline ? (
                <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[13px] font-mono">{children}</code>
              ) : (
                <code className="block p-2 rounded bg-neutral-100 dark:bg-neutral-800 text-[13px] font-mono whitespace-pre-wrap break-words">{children}</code>
              ),
            pre: ({ children }) => <pre className="my-2 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-x-auto whitespace-pre-wrap break-words">{children}</pre>,
            h1: ({ children }) => <h1 className="text-base font-semibold mt-3 mb-2 text-neutral-900 dark:text-neutral-50">{children}</h1>,
            h2: ({ children }) => <h2 className="text-[15px] font-semibold mt-3 mb-1.5 text-neutral-900 dark:text-neutral-50">{children}</h2>,
            h3: ({ children }) => <h3 className="text-[14px] font-semibold mt-2 mb-1 text-neutral-900 dark:text-neutral-50">{children}</h3>,
            blockquote: ({ children }) => <blockquote className="border-l-2 border-neutral-300 dark:border-neutral-600 pl-3 my-2 italic text-neutral-600 dark:text-neutral-400">{children}</blockquote>,
            hr: () => <hr className="my-3 border-neutral-200 dark:border-neutral-700" />,
          }}
        >
          {typeof children === "string" ? children : String(children ?? "")}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function UserBubble({ children }) {
  return (
    <div className="relative max-w-[85%] lg:max-w-[85%]">
      <div
        className="px-4 py-3 rounded-2xl rounded-br-none text-white text-[14px] lg:text-[14.5px] leading-snug shadow-[0_8px_24px_-12px_rgba(37,99,235,0.55)]"
        style={{
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e3a8a 100%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function ChatArea({ active, onActivate, onPromptAction, big = false }) {
  const {
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
  } = useChat({ active, onActivate, onPromptAction });

  const showSendButton = input.trim().length > 0;
  const promptsToShow = active ? quickPrompts.filter((p) => p.keep) : quickPrompts;

  if (!active) {
    return (
      <div className="flex flex-col w-full items-center justify-center py-8 lg:py-12 px-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[640px] flex flex-col items-center"
        >
          <motion.h2
            layout
            className="font-display font-semibold text-center text-neutral-900 dark:text-neutral-50 leading-[1.05] tracking-tight"
            style={{ fontSize: big ? "clamp(32px, 6vw, 56px)" : "clamp(28px, 5vw, 44px)" }}
          >
            Talk to me here...
          </motion.h2>
          <motion.p
            layout
            className="mt-3 max-w-md text-center text-neutral-600 dark:text-neutral-400 leading-relaxed px-2"
            style={{ fontSize: big ? "15px" : "14px" }}
          >
            This page is a conversation, not a résumé. Ask about my work, my
            stack, or how to hire me.
          </motion.p>
          {/* <motion.p
            layout
            className="mt-3 max-w-md text-center text-neutral-600 dark:text-neutral-400 leading-relaxed px-2"
            style={{ fontSize: big ? "15px" : "14px" }}
          >
            I'm Finetuning the responses. Chat will be available Tomorrow. 
          </motion.p> */}

          <div className="mt-6 flex flex-row flex-wrap gap-2 sm:gap-2.5 justify-center items-center w-full max-w-[520px]">
            {promptsToShow.map((p, i) => (
              <motion.button
                key={p.id}
                onClick={() => handlePromptClick(p)}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className={
                  p.highlight
                    ? "text-[13px] lg:text-[13.5px] px-5 py-2.5 rounded-full text-white font-medium shadow-[0_6px_18px_-6px_rgba(37,99,235,0.55)] transition-shadow hover:shadow-[0_8px_22px_-6px_rgba(37,99,235,0.75)]"
                    : "text-[13px] lg:text-[13.5px] px-5 py-2.5 rounded-full bg-white/70 dark:bg-neutral-900/60 backdrop-blur border border-neutral-200 dark:border-neutral-700 hover:border-neutral-900/40 dark:hover:border-neutral-300/40 hover:bg-white dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-200 transition-colors"
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
                className="flex-1 bg-transparent outline-none px-4 lg:px-5 py-3 text-[13px] lg:text-[14px] text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400"
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

  return (
    <div className="flex flex-col w-full h-auto min-h-[380px] lg:h-[550px] lg:min-h-0 pt-6 lg:pt-8 pb-0">
      <div className="flex-1 min-h-0 flex flex-col gap-3 lg:gap-4 pt-2 lg:overflow-y-auto thin-scroll pr-1">
        {currentUser && (
          <motion.div
            key={currentUser.id}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-end"
          >
            <UserBubble>{currentUser.text}</UserBubble>
          </motion.div>
        )}

        <div className="flex flex-col">
          {isTyping ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex">
              <TypingIndicator />
            </motion.div>
          ) : showHireForm ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <HireForm />
            </motion.div>
          ) : currentAi ? (
            <motion.div
              key={currentAi.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col"
            >
              <AiBubble>{currentAi.text}</AiBubble>
              <ChatCards reply={currentAi} />
            </motion.div>
          ) : null}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2 lg:gap-3 pt-2 lg:pt-3">
        <div className="flex flex-row flex-nowrap gap-1.5 lg:gap-2 justify-center items-center overflow-x-auto">
        <AnimatePresence mode="popLayout">
          {promptsToShow.map((p, i) => (
            <motion.button
              key={p.id}
              layout
              onClick={() => handlePromptClick(p)}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -4, opacity: 0 }}
              transition={{ delay: 0.05 + i * 0.03 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className={
                p.highlight
                  ? "text-[12px] lg:text-[12.5px] px-4 py-2 rounded-full text-white font-medium shadow-[0_6px_18px_-6px_rgba(37,99,235,0.55)] transition-shadow hover:shadow-[0_8px_22px_-6px_rgba(37,99,235,0.75)] whitespace-nowrap"
                  : "text-[12px] lg:text-[12.5px] px-4 py-2 rounded-full bg-white/70 dark:bg-neutral-900/60 backdrop-blur border border-neutral-200 dark:border-neutral-700 hover:border-neutral-900/40 dark:hover:border-neutral-300/40 hover:bg-white dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-200 transition-colors whitespace-nowrap"
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

        <div>
          <div className="relative flex items-center rounded-full bg-white/85 dark:bg-neutral-900/70 backdrop-blur border border-neutral-200 dark:border-neutral-700 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] focus-within:border-blue-700/50 dark:focus-within:border-blue-500/50 focus-within:shadow-[0_10px_36px_-10px_rgba(37,99,235,0.35)] transition-all">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Continue the conversation…"
            className="flex-1 bg-transparent outline-none px-4 lg:px-5 py-3 text-[13px] lg:text-[14px] text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400"
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
    </div>
  );
}
