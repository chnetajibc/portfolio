import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { postContact } from "../lib/api";

export default function HireForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    website: "", // honeypot
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("loading");
    setError("");
    try {
      await postContact(form);
      setStatus("done");
    } catch (err) {
      let msg = "Failed to send. Please try again.";
      if (err.code === "RATE_LIMITED") msg = "You're sending messages too quickly. Please try again later.";
      else if (err.code === "VALIDATION_ERROR") msg = err.message || "Invalid input.";
      else if (err.message) msg = err.message;
      setError(msg);
      setStatus("idle");
    }
  };

  if (status === "done") {
    return (
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-2xl border border-emerald-300/60 dark:border-emerald-700/60 bg-emerald-50/70 dark:bg-emerald-950/40 backdrop-blur p-4 flex items-start gap-3"
      >
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
        <div>
          <div className="font-display font-semibold text-[14.5px] text-emerald-900 dark:text-emerald-100">
            Thanks, {form.name.split(" ")[0]}!
          </div>
          <div className="text-[13px] text-emerald-800/80 dark:text-emerald-200/80 mt-0.5">
            I&apos;ll reply to <span className="font-mono">{form.email}</span> within 48 hours.
          </div>
        </div>
      </motion.div>
    );
  }

  const inputCls =
    "w-full bg-white/70 dark:bg-neutral-900/60 border border-neutral-300/80 dark:border-neutral-700/80 focus:border-blue-700/60 focus:bg-white dark:focus:bg-neutral-900 outline-none rounded-lg px-3 py-2 text-[13px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 transition-colors";

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur border border-neutral-200/80 dark:border-neutral-700/80 p-4 space-y-2.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)]"
    >
      <motion.form onSubmit={submit} className="space-y-2">
        <div>
          <label className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">name</label>
          <input required value={form.name} onChange={update("name")} placeholder="Jane Doe" className={inputCls} />
        </div>
        <div>
          <label className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">email</label>
          <input required type="email" value={form.email} onChange={update("email")} placeholder="jane@company.com" className={inputCls} />
        </div>
        <div>
          <label className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">message</label>
          <textarea
            required
            value={form.message}
            onChange={update("message")}
            rows={3}
            placeholder="A sentence or two about what you'd like to discuss."
            className={`${inputCls} resize-none`}
          />
        </div>
        {/* Honeypot — hidden from users, catches bots */}
        <input
          name="website"
          value={form.website}
          onChange={update("website")}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        {error && (
          <div className="flex items-start gap-2 text-[12px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">⌘ replies within 48 hours</span>
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white px-4 py-2 rounded-lg disabled:opacity-60 transition-opacity"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e3a8a 100%)" }}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending
              </>
            ) : (
              <>
                Send <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
