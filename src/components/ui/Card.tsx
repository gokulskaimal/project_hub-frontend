import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  noPadding = false,
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
    >
      <div className={`${noPadding ? "" : "p-6"}`}>{children}</div>
    </div>
  );
};
