import React from "react";

export default function LeadershipSection() {
  return (
    <section id="leadership" className="py-20">
      <div className="container max-w-[1400px] mx-auto px-8">
        <div className="text-center mb-10">
          <div className="text-sm font-semibold text-[#2463EB] tracking-wider uppercase mb-2">
            For leadership
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            See the big picture
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Timeline views, dependencies, and company-wide goals—all connected.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-600">Q3 roadmap</span>
              <span className="text-xs text-gray-500">Timeline</span>
            </div>
            <div className="space-y-6">
              {[
                {
                  name: "Onboarding",
                  depends: "Depends on Design",
                  progress: 80,
                  color: "bg-[#2463EB]/60",
                },
                {
                  name: "Design",
                  depends: "Depends on Research",
                  progress: 60,
                  color: "bg-[#7750E2]/60",
                },
                {
                  name: "API & backend",
                  depends: "Depends on Design",
                  progress: 40,
                  color: "bg-[#2463EB]/50",
                },
                {
                  name: "Web app",
                  depends: "Depends on API",
                  progress: 90,
                  color: "bg-[#2463EB]/40",
                },
              ].map((item, index) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.depends}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-full rounded ${i < item.progress / 5 ? item.color : "bg-gray-100"}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Company impact
            </h4>
            <div className="space-y-3">
              {[
                { metric: "Release velocity", value: "+23%" },
                { metric: "Cycle time", value: "-18%" },
                { metric: "On-time delivery", value: "+31%" },
                { metric: "Alignment", value: "↑ Strong" },
              ].map((m) => (
                <div
                  key={m.metric}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600">{m.metric}</span>
                  <span className="rounded-xl bg-[#2463EB]/10 px-2 py-1 text-sm text-[#2463EB]">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
