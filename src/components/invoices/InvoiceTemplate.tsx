import React from "react";
import { Invoice } from "@/types/invoice";
import { Printer } from "lucide-react";

export default function InvoiceTemplate({ invoice }: { invoice: Invoice }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Action Bar - Hidden during print */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-end gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
        >
          <Printer size={16} /> Print Full Invoice
        </button>
      </div>

      {/* Printable Area */}
      <div className="relative p-10 md:p-14 space-y-8 print:p-0 print:border-none print:shadow-none bg-white min-h-[600px]">
        {/* Status Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden pr-20">
          <span
            className={`text-[120px] font-black uppercase tracking-[0.2em] -rotate-12 opacity-[0.03] select-none ${
              invoice.status === "PAID" ? "text-green-600" : "text-gray-400"
            }`}
          >
            {invoice.status}
          </span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-blue-600 tracking-tight">
              Project Hub
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Enterprise Subscription Services
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900 tracking-wide">
              INVOICE
            </h2>
            <p className="text-gray-500 font-mono text-sm mt-1">
              #{invoice.id.slice(-8).toUpperCase()}
            </p>
            <span
              className={`inline-block mt-3 px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full border ${
                invoice.status === "PAID"
                  ? "bg-green-50 text-green-600 border-green-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 pt-8 border-t border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Billed To
            </p>
            <h3 className="text-lg font-bold text-gray-900">
              {invoice.orgName || "Your Organization"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Plan: <span className="font-semibold">{invoice.planName}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Invoice Details
            </p>
            <div className="space-y-1.5 text-sm">
              <p className="flex justify-end gap-3">
                <span className="text-gray-500">Date Issued:</span>{" "}
                <span className="font-medium text-gray-900">
                  {invoice.createdAt
                    ? new Date(invoice.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </p>
              <p className="flex justify-end gap-3">
                <span className="text-gray-500">Due Date:</span>{" "}
                <span className="font-medium text-gray-900">
                  {invoice.createdAt
                    ? new Date(
                        new Date(invoice.createdAt).setDate(
                          new Date(invoice.createdAt).getDate() + 14,
                        ),
                      ).toLocaleDateString()
                    : "N/A"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="py-6 px-6 text-sm text-gray-900 font-medium">
                  Project Hub - {invoice.planName} Platform Subscription
                </td>
                <td className="py-6 px-6 text-sm font-bold text-gray-900 text-right">
                  ₹{invoice.amount.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-6">
          <div className="w-80 space-y-4">
            <div className="flex justify-between text-sm text-gray-500 px-2">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">
                ₹{invoice.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xl font-black text-blue-600 bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
              <span>Total Due</span>
              <span>₹{invoice.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
