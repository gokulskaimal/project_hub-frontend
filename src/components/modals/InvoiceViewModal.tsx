"use client";

import { X } from "lucide-react";
import InvoiceTemplate from "@/components/invoices/InvoiceTemplate";
import { Invoice } from "@/types/invoice";

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export default function InvoiceViewModal({
  isOpen,
  onClose,
  invoice,
}: InvoiceViewModalProps) {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto modal-surface animate-in zoom-in-95 duration-200">
        {/* Header - Hidden during print */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-card border-b border-border/50 print:hidden">
          <h2 className="text-xl font-black text-foreground uppercase tracking-tighter">
            Operational Invoice
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Invoice Area */}
        <div className="p-4 md:p-8">
          <InvoiceTemplate invoice={invoice} />
        </div>
      </div>
    </div>
  );
}
