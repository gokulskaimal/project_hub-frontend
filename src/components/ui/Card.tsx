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
      className={`bg-card/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative group transition-all duration-500 hover:shadow-[0_40px_90px_-20px_rgba(0,0,0,0.6)] ${className}`}
    >
      {/* Internal HUD Edge Detail */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-30" />

      <div className={`${noPadding ? "" : "p-6 sm:p-10"}`}>{children}</div>
    </div>
  );
};

// Card Header
export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`mb-6 ${className}`}>{children}</div>
);

// Card Title
export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3
    className={`text-xl font-black text-foreground tracking-tight ${className}`}
  >
    {children}
  </h3>
);

// Card Content
export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);
