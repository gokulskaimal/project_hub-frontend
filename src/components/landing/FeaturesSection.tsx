import React from 'react';

export default function FeaturesSection() {
  const featureItems = [
    { t: 'Automated Efficiency', items: ['Automatic task creation','Risk identification','Smart suggestions'] },
    { t: 'Plan, Track, Collaborate', items: ['Break down ideas','Polish tasks','Keep teams aligned'] },
    { t: 'Stay in Sync', items: ['Daily summaries','Surface related work','Align to goals'] },
    { t: 'Customizable Workflows', items: ['Team-specific flows','Templates','Approvals'] },
  ];
  return (
    <section id="features" className="py-20 bg-gray-50/40 border-t">
      <div className="container max-w-[1400px] mx-auto px-8">
        <div className="text-center mb-10">
          <div className="text-sm font-semibold text-[#2463EB] tracking-wider uppercase mb-2">Why Project Hub</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Efficiency for real work</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Let automation handle the busywork so your team can focus on outcomes.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureItems.map(({t,items}) => (
            <div key={t} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-[#2463EB]/10 flex items-center justify-center ring-1 ring-[#2463EB]/20 mb-4">
                <svg className="h-5 w-5 text-[#2463EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t}</h3>
              <ul className="space-y-2 text-sm text-gray-600">{items.map(i => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}