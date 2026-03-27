import React from "react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EntityCardProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon | React.ReactNode;
  href?: string;
  onClick?: () => void; // Added onClick prop
  status?: string;
  statusColor?: string;
  actions?: React.ReactNode;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  sideBorderColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  href,
  onClick, // Destructured onClick
  status,
  statusColor = "bg-blue-50 text-blue-700 border-blue-100",
  actions,
  footerLeft,
  footerRight,
  sideBorderColor,
  className = "",
  children,
}) => {
  const CardWrapper = ({
    children: wrapperChildren,
  }: {
    children: React.ReactNode;
  }) => {
    const wrapperClasses = `group relative bg-white border border-gray-50 p-2.5 sm:p-6 rounded-xl shadow-sm transition-all duration-300 ${className}`;

    if (href) {
      return (
        <Link
          href={href}
          className={`${wrapperClasses} hover:shadow-xl hover:-translate-y-1 block`}
        >
          {wrapperChildren}
        </Link>
      );
    }

    return (
      <div
        className={`${wrapperClasses} hover:shadow-md ${onClick ? "cursor-pointer" : ""}`}
        onClick={onClick} // Applied onClick here
      >
        {wrapperChildren}
      </div>
    );
  };

  const renderIcon = () => {
    if (!icon)
      return (
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 animate-pulse rounded" />
      );

    // If it's a component (function or object with a render method/$$typeof)
    if (
      typeof icon === "function" ||
      (typeof icon === "object" && !React.isValidElement(icon))
    ) {
      const Icon = icon as any;
      return <Icon size={20} className="sm:w-6 sm:h-6" />;
    }

    return icon;
  };

  return (
    <CardWrapper>
      {sideBorderColor && (
        <div
          className={`absolute top-0 right-0 w-1 h-full rounded-r-xl ${sideBorderColor}`}
        />
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className="p-1 sm:p-1 bg-gray-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0 overflow-hidden">
          {renderIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h3 className="text-[13px] sm:text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {title}
            </h3>
            <div className="flex items-center gap-1 shrink-0 overflow-hidden">
              {status && (
                <span
                  className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border whitespace-nowrap ${statusColor}`}
                >
                  {status}
                </span>
              )}
              {actions && (
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  {actions}
                </div>
              )}
            </div>
          </div>
          {subtitle && (
            <p className="text-[8px] sm:text-xs font-bold text-blue-600 uppercase tracking-widest truncate mb-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {description && (
          <p className="text-[10px] sm:text-sm font-bold text-gray-400 group-hover:text-gray-500 transition-colors line-clamp-1 sm:line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {children && <div className="mt-4">{children}</div>}

      {(footerLeft || footerRight) && (
        <div className="mt-3 sm:mt-6 pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
          <div className="flex -space-x-1.5 overflow-hidden">{footerLeft}</div>
          <div className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[50%]">
            {footerRight}
          </div>
        </div>
      )}
    </CardWrapper>
  );
};
