import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import HireForm from "./HireForm";

export default function HireFormModal({ open, onClose }) {
  return (
    <Dialog open={!!open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md w-[92vw] max-h-[85vh] max-h-[85dvh] p-0 gap-0 flex flex-col bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display font-semibold text-lg text-neutral-900 dark:text-neutral-50">Get in Touch</DialogTitle>
            <DialogDescription className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1">
              Fill out the form below and I&apos;ll get back to you within 48 hours.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex-1 overflow-y-auto thin-scroll p-6 min-h-0">
          <HireForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
