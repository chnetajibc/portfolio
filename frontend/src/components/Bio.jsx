import React from "react";
import { motion } from "framer-motion";
import { profile } from "../mock";

function renderBio(text) {
  const parts = text.split(/(\{blue\}[\s\S]*?\{\/blue\})/g);
  return parts.map((p, i) => {
    const m = p.match(/^\{blue\}([\s\S]*)\{\/blue\}$/);
    if (m) {
      return (
        <span key={i} className="text-blue-700 dark:text-blue-400 font-medium">
          {m[1]}
        </span>
      );
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export default function Bio() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.55 }}
      className="mt-5"
    >
      <p className="leading-[1.7] text-neutral-700 dark:text-neutral-300 whitespace-pre-line text-base lg:text-[16px]">
        {renderBio(profile.bio)}
      </p>
    </motion.div>
  );
}
