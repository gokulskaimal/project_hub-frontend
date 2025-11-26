"use client";
import React, { useState } from 'react';

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  
  const price = billingCycle === 'yearly' ? 10 : 12; // Placeholder logic
  const yearlySavings = billingCycle === 'yearly' ? 20 : 0;

  return (
    <section id="pricing" className="py-20">
      <div className="container max-w-[1400px] mx-auto px-8">
        <div className="text-center mb-8">
          <div className="text-sm font-semibold text-[#2463EB] tracking-wider uppercase mb-2">Subscriptions</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Choose a plan that grows with your team.</p>
        </div>
        <div className="flex justify-center mb-8">
          <div className="flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <button 
              onClick={() => setBillingCycle('monthly')} 
              className={`rounded-full px-6 py-2 text-sm transition-colors ${billingCycle === 'monthly' ? 'bg-[#2463EB] text-white' : 'text-gray-600'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`rounded-full px-6 py-2 text-sm transition-colors ${billingCycle === 'yearly' ? 'bg-[#2463EB] text-white' : 'text-gray-600'}`}
            >
              Yearly 
              {yearlySavings > 0 && <span className="ml-2 text-xs opacity-80">Save {yearlySavings}%</span>}
            </button>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Starter Plan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4"><h3 className="text-lg font-semibold text-gray-900">Starter</h3><p className="text-sm text-gray-600">For individuals and small projects</p></div>
            <div className="mb-6"><span className="text-3xl font-bold text-gray-900">₹0</span></div>
            <ul className="space-y-2 mb-6 text-sm text-gray-900"><li>Unlimited projects</li><li>Kanban & timeline</li><li>Basic integrations</li></ul>
            <button className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-900 hover:bg-gray-50">Get Started</button>
          </div>
          {/* Team Plan */}
          <div className="rounded-2xl border-2 border-[#2463EB] bg-white p-6 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-gradient-to-r from-[#326DEC] to-[#8D65F1] px-3 py-1 text-xs font-medium text-white shadow-lg">Most popular</span>
            </div>
            <div className="mb-4"><h3 className="text-lg font-semibold text-gray-900">Team</h3><p className="text-sm text-gray-600">Best for growing teams</p></div>
            <div className="mb-6 flex items-end gap-1"><span className="text-3xl font-bold text-gray-900">₹{price}</span><span className="text-sm text-gray-600">/user/mo</span></div>
            <ul className="space-y-2 mb-6 text-sm text-gray-900"><li>Everything in Starter</li><li>Advanced reports</li><li>Priority support</li></ul>
            <button className="w-full rounded-lg bg-gradient-to-r from-[#326DEC] to-[#8D65F1] py-3 text-sm font-medium text-white shadow-lg hover:shadow-xl">Subscribe</button>
            <p className="text-center text-xs text-gray-600 mt-2">{billingCycle === 'yearly' ? 'Billed Yearly' : 'Billed Monthly'}</p>
          </div>
          {/* Business Plan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4"><h3 className="text-lg font-semibold text-gray-900">Business</h3><p className="text-sm text-gray-600">For large orgs and compliance</p></div>
            <div className="mb-6"><span className="text-2xl font-semibold text-gray-900">Custom</span></div>
            <ul className="space-y-2 mb-6 text-sm text-gray-900"><li>SSO & role-based access</li><li>Custom workflows</li><li>Uptime SLA</li></ul>
            <button className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-900 hover:bg-gray-50">Contact Sales</button>
          </div>
        </div>
      </div>
    </section>
  );
}