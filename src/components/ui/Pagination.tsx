import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`mt-8 px-6 py-4 bg-card border border-border/50 rounded-2xl shadow-xl flex items-center justify-between ${className}`}
    >
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
        Section {currentPage} / {totalPages} ({totalItems} items)
      </span>
      <div className="flex gap-3">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-6 py-2 bg-secondary/30 border border-border/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-secondary/50 disabled:opacity-30 transition-all active:scale-95 flex items-center gap-2"
        >
          <ChevronLeft className="w-3 h-3" />
          Prev
        </button>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-30 transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
