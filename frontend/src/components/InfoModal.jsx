import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Sparkles, MessageSquare, Cpu, Lock } from "lucide-react";

const points = [
  {
    Icon: MessageSquare,
    title: "This page is a chat",
    body: "Instead of scrolling a static résumé, ask anything — about my work, my stack, or how to hire me. Replies render as cards inline.",
  },
  {
    Icon: Sparkles,
    title: "Smart prompts",
    body: "Try 'projects', 'skills', 'experience', 'achievements' or 'how to hire' for rich, structured answers.",
  },
  {
    Icon: Cpu,
    title: "Built with",
    body: "React 19, Tailwind, shadcn/ui, framer-motion, lucide-react. Designed and coded from scratch.",
  },
  {
    Icon: Lock,
    title: "Privacy",
    body: "Nothing you type is stored. The current assistant is offline pattern-matching — a real LLM hookup is optional and toggled by me.",
  },
];

export default function InfoModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl w-[92vw] max-h-[85vh] max-h-[85dvh] lg:max-h-[80vh] lg:max-h-[80dvh] p-0 gap-0 flex flex-col bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
        <div className="shrink-0 px-4 lg:px-6 pt-4 lg:pt-6 pb-3 lg:pb-4 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-white to-blue-50/40 dark:from-neutral-900 dark:to-blue-950/30">
          <DialogHeader>
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-xl bg-blue-700 dark:bg-blue-500 text-white flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(37,99,235,0.55)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-display text-xl lg:text-2xl text-blue-700 dark:text-blue-400 truncate">About this site</DialogTitle>
                <DialogDescription className="text-[12px] lg:text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  A short note from the developer.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>
        <div className="flex-1 overflow-y-auto thin-scroll px-4 lg:px-6 py-4 lg:py-5 space-y-4 min-h-0">
          {points.map(({ Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-semibold text-[14px] lg:text-[14.5px] text-neutral-900 dark:text-neutral-50">{title}</div>
                <p className="text-[12px] lg:text-[13px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 mt-4 text-[11px] lg:text-[12px] text-neutral-500 dark:text-neutral-500 leading-relaxed">
            Designed in Chennai. Coded between coffee, code reviews and the occasional rocket-launch livestream.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}