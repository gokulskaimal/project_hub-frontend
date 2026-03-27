"use client";

import { useState } from "react";
import { useGetManagerInvoicesQuery } from "@/store/api/managerApiSlice";
import { Invoice } from "@/types/invoice";
import {
  ReceiptText,
  Download,
  Calendar,
  ArrowRight,
  IndianRupee,
} from "lucide-react";

export default function ManagerBillingPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetManagerInvoicesQuery({ page, limit: 10 });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handlePrint = () => {
    window.print();
  };

  if (selectedInvoice) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-gray-500 mt-1">
              Receipt for your subscription plan
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-blue-600">Project_Hub</h2>
            <p className="text-gray-500 text-sm mt-1">Platform billing</p>
          </div>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Billed To
            </h3>
            <p className="font-medium text-gray-900">Your Organization</p>
            <p className="text-sm text-gray-500">
              Org ID: {selectedInvoice.orgId}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Invoice Details
            </h3>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Invoice ID:</span>{" "}
              {selectedInvoice.id}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Date:</span>{" "}
              {new Date(selectedInvoice.billingDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Transaction:</span>{" "}
              {selectedInvoice.razorpayPaymentId || "N/A"}
            </p>
          </div>
        </div>

        <div className="w-full mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 font-semibold text-gray-700">
                  Description
                </th>
                <th className="py-3 font-semibold text-gray-700 text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-900">
                  <div className="flex items-center gap-2">
                    <span>
                      {selectedInvoice.planName || "Subscription Plan"} (
                      {selectedInvoice.planId})
                    </span>
                    {selectedInvoice.planType && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold tracking-wider">
                        {selectedInvoice.planType}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 text-gray-900 text-right font-medium">
                  {selectedInvoice.currency} {selectedInvoice.amount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center border-t border-gray-200 pt-6">
          <div>
            <span
              className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
                selectedInvoice.status === "PAID"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {selectedInvoice.status}
            </span>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm mb-1">Total Paid</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {selectedInvoice.currency} {selectedInvoice.amount}
            </h3>
          </div>
        </div>

        {/* Action Buttons purely for UI, invisible when printing via CSS */}
        <div className="mt-10 flex gap-4 print:hidden">
          <button
            onClick={() => setSelectedInvoice(null)}
            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            &larr; Back to Billing
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Billing & Invoices
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your subscriptions and payment history
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Plan
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading invoices...
                  </td>
                </tr>
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No payment history found.
                  </td>
                </tr>
              ) : (
                data?.items?.map((invoice: Invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(invoice.billingDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.currency} {invoice.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          invoice.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 truncate max-w-[150px]">
                          {invoice.planName || invoice.planId}
                        </span>
                        {invoice.planType && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                              invoice.planType === "STARTER"
                                ? "bg-gray-100 text-gray-600"
                                : invoice.planType === "PRO"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {invoice.planType}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900"
                      >
                        View <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .max-w-4xl,
          .max-w-4xl * {
            visibility: visible;
          }
          .max-w-4xl {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
