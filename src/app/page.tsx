import Footer from '@/components/Footer';
import Header from '@/components/Header';


export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header/>

      <main className="flex-1">
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

            <div className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex items-center gap-8 rounded-xl bg-gray-50/60 p-4">
                  <div className="flex items-center gap-3">
                    <svg className="h-6 w-6 text-[#2463EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Plan, track, collaborate</div>
                      <div className="text-xs text-gray-600">Break down ideas, polish tasks, and keep everything in sync.</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8 rounded-xl bg-gray-50/60 p-4">
                  <div className="flex items-center gap-3">
                    <svg className="h-6 w-6 text-[#2463EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zM9 7H4l5-5v5zM15 7h5l-5-5v5z"/></svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Stay in sync</div>
                      <div className="text-xs text-gray-600">Summaries, related work surfacing, and goal alignment.</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8 rounded-xl bg-gray-50/60 p-4">
                  <div className="flex items-center gap-3">
                    <svg className="h-6 w-6 text-[#2463EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Custom workflows</div>
                      <div className="text-xs text-gray-600">Tailor project management to every team.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-1 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <div className="ml-3 text-xs text-gray-600">Project overview</div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-1">
                    <div className="h-40 rounded-lg bg-gradient-to-br from-[#2463EB]/10 to-[#7750E2]/10 border border-black/5 mb-4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-4/5" />
                    </div>
                  </div>
                  <div className="w-80">
                    <div className="text-sm font-medium text-gray-900 text-center mb-3">This week</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-900"><svg className="h-4 w-4 text-[#2463EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>12 tasks completed</div>
                      <div className="flex items-center gap-2 text-sm text-gray-900"><svg className="h-4 w-4 text-[#2463EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>3 projects updated</div>
                      <div className="flex items-center gap-2 text-sm text-gray-900"><svg className="h-4 w-4 text-[#2463EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>2 releases shipped</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-gray-50/40 border-t">
          <div className="container max-w-[1400px] mx-auto px-8">
            <div className="text-center mb-10">
              <div className="text-sm font-semibold text-[#2463EB] tracking-wider uppercase mb-2">Why Project Hub</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Efficiency for real work</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Let automation handle the busywork so your team can focus on outcomes.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { t: 'Automated Efficiency', items: ['Automatic task creation','Risk identification','Smart suggestions'] },
                { t: 'Plan, Track, Collaborate', items: ['Break down ideas','Polish tasks','Keep teams aligned'] },
                { t: 'Stay in Sync', items: ['Daily summaries','Surface related work','Align to goals'] },
                { t: 'Customizable Workflows', items: ['Team-specific flows','Templates','Approvals'] },
              ].map(({t,items}) => (
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

        <section id="testimonials" className="py-16 bg-gray-50/40 border-b">
          <div className="container max-w-4xl mx-auto px-8 text-center">
            <div className="text-sm font-semibold text-[#2463EB] tracking-wider uppercase mb-9">What customers say</div>
            <blockquote className="text-3xl font-semibold text-gray-900 leading-tight mb-4">“Project Hub transformed our productivity, making teamwork smarter and faster.”</blockquote>
            <cite className="text-sm text-gray-600">— Customer Name</cite>
          </div>
        </section>

        <section id="leadership" className="py-20">
          <div className="container max-w-[1400px] mx-auto px-8">
            <div className="text-center mb-10">
              <div className="text-sm font-semibold text-[#2463EB] tracking-wider uppercase mb-2">For leadership</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">See the big picture</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Timeline views, dependencies, and company-wide goals—all connected.</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6"><span className="text-sm text-gray-600">Q3 roadmap</span><span className="text-xs text-gray-500">Timeline</span></div>
                <div className="space-y-6">
                  {[
                    { name: 'Onboarding', depends: 'Depends on Design', progress: 80 },
                    { name: 'Design', depends: 'Depends on Research', progress: 60 },
                    { name: 'API & backend', depends: 'Depends on Design', progress: 40 },
                    { name: 'Web app', depends: 'Depends on API', progress: 90 },
                  ].map((item, index) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-900">{item.name}</span><span className="text-xs text-gray-500">{item.depends}</span></div>
                      <div className="flex gap-1">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-full rounded ${i < item.progress/5 ? (index===0?'bg-[#2463EB]/60':index===1?'bg-[#7750E2]/60':index===2?'bg-[#2463EB]/50':'bg-[#2463EB]/40'):'bg-gray-100'}`}
                          />  
                        ))} 
                      </div>
                    </div> 
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Company impact</h4>
                <div className="space-y-3">
                  {[{metric:'Release velocity',value:'+23%'},{metric:'Cycle time',value:'-18%'},{metric:'On-time delivery',value:'+31%'},{metric:'Alignment',value:'↑ Strong'}].map(m=>(
                    <div key={m.metric} className="flex items-center justify-between"><span className="text-sm text-gray-600">{m.metric}</span><span className="rounded-lg bg-[#2463EB]/10 px-2 py-1 text-sm text-[#2463EB]">{m.value}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="container max-w-[1400px] mx-auto px-8">
            <div className="text-center mb-8">
              <div className="text-sm font-semibold text-[#2463EB] tracking-wider uppercase mb-2">Subscriptions</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Choose a plan that grows with your team.</p>
            </div>
            <div className="flex justify-center mb-8">
              <div className="flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                <button className="rounded-full px-6 py-2 text-sm text-gray-600">Monthly</button>
                <button className="rounded-full bg-[#2463EB] px-6 py-2 text-sm text-white">Yearly <span className="ml-2 text-xs opacity-80">Save 20%</span></button>
              </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4"><h3 className="text-lg font-semibold text-gray-900">Starter</h3><p className="text-sm text-gray-600">For individuals and small projects</p></div>
                <div className="mb-6"><span className="text-3xl font-bold text-gray-900">&#8377;0</span></div>
                <ul className="space-y-2 mb-6 text-sm text-gray-900"><li>Unlimited projects</li><li>Kanban & timeline</li><li>Basic integrations</li></ul>
                <button className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-900 hover:bg-gray-50">Get Started</button>
              </div>
              <div className="rounded-2xl border-2 border-[#2463EB] bg-white p-6 shadow-lg relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-[#326DEC] to-[#8D65F1] px-3 py-1 text-xs font-medium text-white shadow-lg">Most popular</span>
                </div>
                <div className="mb-4"><h3 className="text-lg font-semibold text-gray-900">Team</h3><p className="text-sm text-gray-600">Best for growing teams</p></div>
                <div className="mb-6 flex items-end gap-1"><span className="text-3xl font-bold text-gray-900">&#8377;10</span><span className="text-sm text-gray-600">/user/mo</span></div>
                <ul className="space-y-2 mb-6 text-sm text-gray-900"><li>Everything in Starter</li><li>Advanced reports</li><li>Priority support</li></ul>
                <button className="w-full rounded-lg bg-gradient-to-r from-[#326DEC] to-[#8D65F1] py-3 text-sm font-medium text-white shadow-lg hover:shadow-xl">Subscribe</button>
                <p className="text-center text-xs text-gray-600 mt-2">Billed Yearly</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4"><h3 className="text-lg font-semibold text-gray-900">Business</h3><p className="text-sm text-gray-600">For large orgs and compliance</p></div>
                <div className="mb-6"><span className="text-2xl font-semibold text-gray-900">Custom</span></div>
                <ul className="space-y-2 mb-6 text-sm text-gray-900"><li>SSO & role-based access</li><li>Custom workflows</li><li>Uptime SLA</li></ul>
                <button className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-900 hover:bg-gray-50">Contact Sales</button>
              </div>
            </div>
            <div className="mt-8 text-center">
              <div className="rounded-xl border border-gray-200 bg-white p-4 max-w-3xl mx-auto">
                <p className="text-sm text-gray-600">Free forever for individuals • 14‑day Team trial • Cancel anytime • No credit card required for Starter</p>
              </div>
            </div>
          </div>
        </section>

        <section id="cta" className="py-20 bg-gradient-to-b from-transparent to-[#2463EB]/5">
          <div className="container max-w-[1400px] mx-auto px-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to transform the way your team works?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">Sign up free to get started in minutes, or request a demo to see Project Hub in action.</p>
            <div className="flex items-center justify-center gap-3">
              <a href="#pricing" className="rounded-lg bg-[#2463EB] px-8 py-3 text-white font-medium hover:bg-[#2463EB]/90">Sign Up Free</a>
              <a href="#" className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-gray-900 font-medium hover:bg-gray-50">Request Demo</a>
            </div>
          </div>
        </section>
      </main>


      <Footer/>
    </div>
  );
}
