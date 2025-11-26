import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-[#EBEFF5]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 h-[512px] w-[512px] rounded-full bg-gradient-to-br from-[#2463EB]/25 to-[#2463EB]/0 blur-[32px]" />
        <div className="absolute top-0 right-0 h-[512px] w-[512px] rounded-full bg-gradient-to-br from-[#8D65F1]/25 to-[#8D65F1]/0 blur-[32px]" />
      </div>
      <div className="container max-w-[1400px] mx-auto px-8 py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center rounded-full bg-[#2463EB]/10 px-3 py-1 text-xs font-medium text-[#2463EB] ring-1 ring-[#2463EB]/20 mb-8">
          New • Productivity features
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight mb-6 max-w-4xl">Project Hub</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          Focus on outcomes, not admin. Streamlined project management that helps teams plan, track, and collaborate effortlessly.
        </p>
        <div className="flex items-center gap-3 mb-10">
          <a href="#pricing" className="rounded-lg bg-gradient-to-r from-[#326DEC] to-[#8D65F1] px-8 py-3 text-white font-medium shadow-lg hover:shadow-xl">Get Started</a>
          <a href="#features" className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-gray-900 font-medium hover:bg-gray-50">Learn More</a>
        </div>
        
        {/* Placeholder for complex visual element */}
        <div className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="p-6">
            <div className="h-40 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">Dashboard Preview Mockup</div>
          </div>
        </div>
      </div>
    </section>
  );
}