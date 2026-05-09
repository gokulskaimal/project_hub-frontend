"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes = [
    { name: "light", icon: Sun },
    { name: "dark", icon: Moon },
    { name: "system", icon: Monitor },
  ];

  return (
    <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border/50 backdrop-blur-sm">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.name;

        return (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className={`relative p-2 rounded-lg transition-all duration-300 ${
              isActive
                ? "text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={`Switch to ${t.name} theme`}
          >
            {isActive && (
              <motion.div
                layoutId="active-theme"
                className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon size={16} className="relative z-10" />
          </button>
        );
      })}
    </div>
  );
}
