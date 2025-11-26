 import React from 'react';

export default function IntegrationsSection() {
  return (
    <section id="integrations" className="py-20 bg-gray-50/40 border-t border-b">
      <div className="container max-w-[1400px] mx-auto px-8">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold text-[#2463EB] tracking-wider uppercase mb-2">Integrations</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Bring all your teams tools under one roof</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Design, code, and communication—connected with Project Hub.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Popular integrations</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Figma','GitHub','Slack','Jira','Notion'].map(tool => (
                <span key={tool} className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs text-gray-900 shadow-sm">{tool}</span>
              ))}
            </div>
            <p className="text-sm text-gray-600">Connect tools your team already loves. Keep tasks, commits, designs, and conversations in sync.</p>
          </div>
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#2463EB]" /><span className="text-sm text-gray-600">Figma mockup</span></div>
              <span className="text-xs text-gray-500">Live preview</span>
            </div>
            <div className="p-6 flex gap-6">
              <div className="flex-1 rounded-xl border border-gray-200 bg-gradient-to-br from-[#2463EB]/10 to-[#7750E2]/10 p-6">
                <div className="text-sm font-medium text-gray-900 mb-3">Design</div>
                <div className="h-52 rounded-lg bg-white shadow-sm border border-black/5" />
              </div>
              <div className="flex-1 rounded-xl border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-900 mb-3">Auto-create tasks</div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-900">Generate stories from Figma frames</div>
                  <div className="text-sm text-gray-900">Link designs to related issues</div>
                  <div className="text-sm text-gray-900">Keep specs and PRs in sync</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}