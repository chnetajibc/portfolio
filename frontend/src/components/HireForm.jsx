import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

export default function HireForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    type: "Full-time",
    budget: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("loading");
    setTimeout(() => setStatus("done"), 900);
  };

  if (status === "done") {
    return (
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-3 rounded-2xl border border-emerald-300/60 dark:border-emerald-700/60 bg-emerald-50/70 dark:bg-emerald-950/40 backdrop-blur p-4 flex items-start gap-3"
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

  const types = ["Full-time", "Startup", "Freelance"];

  return (
    <motion.form
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onSubmit={submit}
      className="mt-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 bg-white/70 dark:bg-neutral-900/60 backdrop-blur p-4 space-y-2.5"
    >
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">name</label>
          <input required value={form.name} onChange={update("name")} placeholder="Jane Doe" className={inputCls} />
        </div>
        <div>
          <label className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">email</label>
          <input required type="email" value={form.email} onChange={update("email")} placeholder="jane@company.com" className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">company</label>
          <input value={form.company} onChange={update("company")} placeholder="Acme Inc." className={inputCls} />
        </div>
        <div>
          <label className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">budget (optional)</label>
          <input value={form.budget} onChange={update("budget")} placeholder="$ / month or project" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">engagement</label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {types.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setForm({ ...form, type: t })}
              className={`text-[12px] px-2.5 py-1 rounded-full border transition-colors ${
                form.type === t
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                  : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-neutral-900/40 dark:hover:border-neutral-300/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">what you&apos;re building</label>
        <textarea
          required
          value={form.message}
          onChange={update("message")}
          rows={2}
          placeholder="A sentence or two about the project, role, or problem."
          className={`${inputCls} resize-none`}
        />
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">⌘ replies within 48 hours</span>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white px-3.5 py-2 rounded-lg disabled:opacity-60 transition-opacity"
          style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e3a8a 100%)" }}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending
            </>
          ) : (
            <>
              Send request <Send className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
