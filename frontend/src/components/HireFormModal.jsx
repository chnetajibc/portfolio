import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import HireForm from "./HireForm";

export default function HireFormModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-6">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="h-4 w-4 text-neutral-500" />
              </button>

              {/* Header */}
              <div className="mb-4">
                <h2 className="font-display font-semibold text-lg text-neutral-900 dark:text-neutral-50">
                  Get in Touch
                </h2>
                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Fill out the form below and I'll get back to you within 48 hours.
                </p>
              </div>

              {/* Form */}
              <HireForm />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
