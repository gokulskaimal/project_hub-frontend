import React from "react";
import { Invoice } from "@/types/invoice";
import { Printer } from "lucide-react";

export default function InvoiceTemplate({ invoice }: { invoice: Invoice }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto bg-card border border-border shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Action Bar - Hidden during print */}
      <div className="bg-secondary/50 border-b border-border p-4 flex justify-end gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-background text-foreground font-bold rounded-xl border border-border hover:bg-secondary transition-all shadow-sm text-xs uppercase tracking-widest"
        >
          <Printer size={16} /> Print Full Invoice
        </button>
      </div>

      {/* Printable Area */}
      <div className="relative p-10 md:p-14 space-y-8 print:p-0 print:border-none print:shadow-none bg-card min-h-[600px] print:bg-white">
        {/* Status Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden pr-20">
          <span
            className={`text-[120px] font-black uppercase tracking-[0.2em] -rotate-12 opacity-[0.05] select-none ${
              invoice.status === "PAID"
                ? "text-emerald-500"
                : "text-muted-foreground"
            }`}
          >
            {invoice.status}
          </span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-primary tracking-tight uppercase">
              Project Hub
            </h1>
            <p className="text-[10px] text-muted-foreground mt-1 font-black uppercase tracking-widest opacity-60">
              Enterprise Subscription Services
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black text-foreground tracking-tighter uppercase">
              INVOICE
            </h2>
            <p className="text-muted-foreground font-mono text-xs mt-1 uppercase tracking-widest opacity-60">
              #{invoice.id.slice(-8).toUpperCase()}
            </p>
            <span
              className={`inline-block mt-3 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                invoice.status === "PAID"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-500 border-rose-500/20"
              }`}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 pt-8 border-t border-border/50">
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-40">
              Billed To
            </p>
            <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
              {invoice.orgName || "Your Organization"}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1 font-bold uppercase tracking-wide">
              Plan:{" "}
              <span className="font-black text-primary">
                {invoice.planName}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-40">
              Invoice Details
            </p>
            <div className="space-y-2 text-[11px] font-bold uppercase tracking-wider">
              <p className="flex justify-end gap-3">
                <span className="text-muted-foreground">Date Issued:</span>{" "}
                <span className="font-black text-foreground">
                  {invoice.createdAt
                    ? new Date(invoice.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </p>
              <p className="flex justify-end gap-3">
                <span className="text-muted-foreground">Due Date:</span>{" "}
                <span className="font-black text-foreground">
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

        <div className="mt-10 overflow-hidden rounded-xl border border-border/50">
          <table className="w-full text-left border-collapse">
            <thead className="bg-secondary/30">
              <tr>
                <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                  Description
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right opacity-60">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <tr>
                <td className="py-6 px-6 text-xs text-foreground font-black uppercase tracking-tight">
                  Project Hub - {invoice.planName} Platform Subscription
                </td>
                <td className="py-6 px-6 text-sm font-black text-foreground text-right">
                  ₹{invoice.amount.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-6">
          <div className="w-80 space-y-4">
            <div className="flex justify-between text-xs font-black text-muted-foreground px-2 uppercase tracking-widest opacity-60">
              <span>Subtotal</span>
              <span className="text-foreground">
                ₹{invoice.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xl font-black text-primary bg-primary/10 border border-primary/20 p-4 rounded-xl uppercase tracking-tighter">
              <span>Total Due</span>
              <span>₹{invoice.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
