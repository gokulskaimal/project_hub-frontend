import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

// Basic Card Container
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

// Card Header
export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

// Card Title
export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
);

// Card Content
export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

