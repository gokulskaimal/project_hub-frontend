"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    "Features",
    "Integrations",
    "Pricing",
    "Enterprise",
    "Community",
  ];

  return (
    <header className="sticky top-0 z-[100] border-b border-white/5 bg-background/60 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] border border-primary/20">
              <span className="text-sm font-black text-white italic tracking-tighter">
                PH
              </span>
            </div>
            <Link href="/">
              <span className="text-xl font-black text-foreground uppercase tracking-tighter italic">
                Project Hub
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <a
                key={item}
                className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-primary transition-all duration-300"
                href={`#${item.toLowerCase()}`}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <Link
              className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-foreground transition-all"
              href="/login"
            >
              Sign in
            </Link>
            <Link href="/signup">
              <button className="h-11 rounded-xl bg-primary px-6 text-xs font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/5 bg-background/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="flex flex-col gap-4 p-6">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] hover:text-primary py-2 transition-all"
                >
                  {item}
                </a>
              ))}
              <hr className="border-white/5 my-2" />
              <div className="flex flex-col gap-4">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] hover:text-foreground py-2"
                >
                  Sign in
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <button className="w-full h-12 rounded-xl bg-primary text-[10px] font-black text-white uppercase tracking-[0.3em] shadow-lg shadow-primary/20">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
