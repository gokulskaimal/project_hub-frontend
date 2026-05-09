"use client";
import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="container max-w-5xl mx-auto px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="glass-card p-16 rounded-[4rem] border border-white/5 bg-card/40 shadow-2xl relative text-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 shadow-2xl">
            <Quote className="w-8 h-8 text-primary" />
          </div>

          <div className="text-[12px] font-black text-primary tracking-[0.4em] uppercase mb-12 opacity-70 italic">
            Client Testimonial
          </div>

          <blockquote className="text-4xl lg:text-5xl font-black text-foreground leading-[1.1] mb-10 italic uppercase tracking-tighter">
            “Project Hub transformed our productivity, making teamwork{" "}
            <span className="text-gradient">smarter and faster.</span>”
          </blockquote>

          <div className="pt-8 border-t border-white/5 inline-block">
            <cite className="text-[12px] font-black text-foreground uppercase tracking-[0.2em] italic not-italic">
              — Jane Doe
            </cite>
            <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1 opacity-50">
              CTO at Innovate Labs
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
