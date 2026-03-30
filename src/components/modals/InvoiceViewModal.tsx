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
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header - Hidden during print */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-100 print:hidden">
          <h2 className="text-lg font-bold text-gray-900 ml-2">
            Invoice Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
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
