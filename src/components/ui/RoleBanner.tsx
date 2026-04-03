import React from "react";

interface RoleBannerProps {
  roleName: string;
  badgeText: string;
  welcomeMessage: string | React.ReactNode;
  description: string | React.ReactNode;
  gradientFrom?: string; // e.g. blue-600/20
  gradientTo?: string; // e.g. indigo-600/10
}

export const RoleBanner: React.FC<RoleBannerProps> = ({
  roleName,
  badgeText,
  welcomeMessage,
  description,
  gradientFrom = "blue-600/20",
  gradientTo = "indigo-600/10",
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-900 px-6 py-10 sm:px-10 sm:py-16 text-white shadow-2xl">
      {/* Dynamic Gradients */}
      <div
        className={`absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-[${gradientFrom}] blur-3xl`}
        style={{
          backgroundColor: gradientFrom.startsWith("bg-")
            ? undefined
            : gradientFrom,
        }}
      />
      <div
        className={`absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 rounded-full bg-[${gradientTo}] blur-3xl`}
        style={{
          backgroundColor: gradientTo.startsWith("bg-")
            ? undefined
            : gradientTo,
        }}
      />

      {/* Actual Gradient circles with Tailwind standard classes for reliability */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl shadow-[0_0_100px_rgba(37,99,235,0.2)]" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-sm">
            {badgeText}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
          {welcomeMessage}
        </h1>
        <div className="text-gray-400 text-sm sm:text-lg font-medium max-w-2xl leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};
