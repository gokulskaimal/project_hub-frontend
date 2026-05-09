"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface EntityCardProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon | React.ReactNode;
  href?: string;
  onClick?: () => void;
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
  onClick,
  status,
  statusColor = "bg-primary/10 text-primary border-primary/20",
  actions,
  footerLeft,
  footerRight,
  sideBorderColor,
  className = "",
  children,
}) => {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    const isInteractive = (e.target as HTMLElement).closest(
      'button, a, [role="button"]',
    );
    if (isInteractive) return;

    if (href) {
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };

  const renderIcon = () => {
    if (!icon)
      return <div className="w-6 h-6 bg-secondary animate-pulse rounded-lg" />;

    if (
      typeof icon === "function" ||
      (typeof icon === "object" && !React.isValidElement(icon))
    ) {
      const Icon = icon as LucideIcon;
      return <Icon size={22} />;
    }

    return icon;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onClick={handleCardClick}
      className={`group relative bg-card border border-border/50 p-5 rounded-2xl shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 ${href || onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {sideBorderColor && (
        <div
          className={`absolute top-0 right-0 w-1 h-full rounded-r-2xl ${sideBorderColor} opacity-50`}
        />
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="p-2.5 bg-secondary/50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 shrink-0 shadow-inner">
          {renderIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="flex-1 text-base font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight tracking-tight">
              {title}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              {status && (
                <span
                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border whitespace-nowrap shadow-sm ${statusColor}`}
                >
                  {status}
                </span>
              )}
            </div>
          </div>
          {subtitle && (
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em] leading-none mb-1">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div
            className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>

      <div className="space-y-1">
        {description && (
          <p className="text-xs font-bold text-muted-foreground group-hover:text-foreground/80 transition-colors line-clamp-2 leading-normal tracking-tight">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div
          className="mt-4 pt-4 border-t border-border/30"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}

      {(footerLeft || footerRight) && (
        <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between gap-4">
          <div className="flex -space-x-2 overflow-hidden items-center text-xs font-black text-muted-foreground">
            {footerLeft}
          </div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            {footerRight}
          </div>
        </div>
      )}
    </motion.div>
  );
};
