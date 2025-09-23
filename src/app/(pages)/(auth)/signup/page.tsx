import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";

/* eslint-disable @next/next/no-html-link-for-pages */
export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Header */}
      <Header/>

      <main className="flex-1">
        {/* Sign Up Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-[#EBEFF5]">
          {/* Background Gradients */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-0 h-[512px] w-[512px] rounded-full bg-gradient-to-br from-[#2463EB]/25 to-[#2463EB]/0 blur-[32px]" />
            <div className="absolute top-0 right-0 h-[512px] w-[512px] rounded-full bg-gradient-to-br from-[#8D65F1]/25 to-[#8D65F1]/0 blur-[32px]" />
          </div>
          
          <div className="container max-w-[1400px] mx-auto px-8 py-24">
            <div className="flex items-start gap-12">
              {/* Left side - Sign up form */}
              <div className="flex-1 max-w-2xl">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                  Great outcomes start with{" "}
                  <span className="bg-gradient-to-r from-[#326DEC] to-[#8D65F1] bg-clip-text text-transparent">
                    Project Hub
                  </span>
                </h1>
                
                <p className="text-gray-600 text-base mb-4 max-w-lg">
                  The modern project management tool your team needs to plan and track work across every team.
                </p>
                
                <p className="text-xs text-gray-600 mb-6">
                  Use your work email for the best experience.
                </p>
                
                {/* Sign up form */}
                <div className="flex items-center gap-3 mb-6 max-w-xl">
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 17 17">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" d="M14.9964 5.33655L9.00242 9.15455C8.79902 9.27269 8.56798 9.33492 8.33275 9.33492C8.09753 9.33492 7.86649 9.27269 7.66309 9.15455L1.66309 5.33655"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" d="M13.6631 3.33655H2.99642C2.26004 3.33655 1.66309 3.9335 1.66309 4.66988V12.6699C1.66309 13.4063 2.26004 14.0032 2.99642 14.0032H13.6631C14.3995 14.0032 14.9964 13.4063 14.9964 12.6699V4.66988C14.9964 3.9335 14.3995 3.33655 13.6631 3.33655Z"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                    />
                  </div>
                  <button className="h-10 px-6 rounded-lg bg-[#2463EB] text-white text-sm font-medium hover:bg-[#2463EB]/90">
                    Sign up
                  </button>
                </div>
                
                {/* Divider */}
                <div className="flex items-center gap-3 mb-6 max-w-xl">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-xs text-gray-600">Or continue with</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
                
                {/* Google sign up button */}
                <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M23.7 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.6c-.3 1.4-1.2 2.7-2.4 3.5v3h3.9c2.3-2.1 3.6-5.2 3.6-8.6z" />
                  <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-4.9H1.4v3.1C3.4 21.1 7.4 24 12 24z" />
                  <path fill="#FBBC05" d="M5.3 14.3c-.2-.7-.4-1.4-.4-2.3s.1-1.6.4-2.3V6.6H1.4C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.4l3.9-3.1z" />
                  <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5C18 1.1 15.2 0 12 0 7.4 0 3.4 2.9 1.4 7.1l3.9 3.1c.9-2.8 3.6-4.9 6.7-4.9z" />
                </svg>
                Continue with Google
              </button>
                
                {/* Sign in link */}
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <a href="#" className="text-[#2463EB] hover:underline">Sign in</a>
                </p>
              </div>
              
              {/* Right side - Use case cards */}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4 max-w-2xl">
                  {/* Software Development Card */}
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Use case</div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Software Development</h3>
                    <div className="space-y-2 mb-4">
                      {['Sample workflow', 'Team templates', 'Quick setup'].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <svg className="h-3 w-3 text-[#2463EB]" fill="none" stroke="currentColor" viewBox="0 0 12 13">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.99707 11.3367C8.75849 11.3367 10.9971 9.09809 10.9971 6.33667C10.9971 3.57525 8.75849 1.33667 5.99707 1.33667C3.23565 1.33667 0.99707 3.57525 0.99707 6.33667C0.99707 9.09809 3.23565 11.3367 5.99707 11.3367Z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.49707 6.33667L5.49707 7.33667L7.49707 5.33667"/>
                          </svg>
                          <span className="text-xs text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                    <a href="#" className="flex items-center gap-1 text-xs font-medium text-[#2463EB] hover:underline">
                      Explore
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 12 13">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.49707 6.33667H9.49707"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.99707 2.83667L9.49707 6.33667L5.99707 9.83667"/>
                      </svg>
                    </a>
                  </div>

                  {/* Marketing Card */}
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Use case</div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Marketing</h3>
                    <div className="space-y-2 mb-4">
                      {['Sample workflow', 'Team templates', 'Quick setup'].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <svg className="h-3 w-3 text-[#2463EB]" fill="none" stroke="currentColor" viewBox="0 0 12 13">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.99707 11.3367C8.75849 11.3367 10.9971 9.09809 10.9971 6.33667C10.9971 3.57525 8.75849 1.33667 5.99707 1.33667C3.23565 1.33667 0.99707 3.57525 0.99707 6.33667C0.99707 9.09809 3.23565 11.3367 5.99707 11.3367Z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.49707 6.33667L5.49707 7.33667L7.49707 5.33667"/>
                          </svg>
                          <span className="text-xs text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                    <a href="#" className="flex items-center gap-1 text-xs font-medium text-[#2463EB] hover:underline">
                      Explore
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 12 13">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.49707 6.33667H9.49707"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.99707 2.83667L9.49707 6.33667L5.99707 9.83667"/>
                      </svg>
                    </a>
                  </div>

                  {/* IT, Design, Operations, HR Cards */}
                  {[
                    { title: 'IT', items: ['Sample workflow', 'Team templates', 'Quick setup'] },
                    { title: 'Design', items: ['Sample workflow', 'Team templates', 'Quick setup'] },
                    { title: 'Operations', items: ['Sample workflow', 'Team templates', 'Quick setup'] },
                    { title: 'HR', items: ['Sample workflow', 'Team templates', 'Quick setup'] }
                  ].map((useCase) => (
                    <div key={useCase.title} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Use case</div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">{useCase.title}</h3>
                      <div className="space-y-2 mb-4">
                        {useCase.items.map((item) => (
                          <div key={item} className="flex items-center gap-2">
                            <svg className="h-3 w-3 text-[#2463EB]" fill="none" stroke="currentColor" viewBox="0 0 12 13">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.99707 11.3367C8.75849 11.3367 10.9971 9.09809 10.9971 6.33667C10.9971 3.57525 8.75849 1.33667 5.99707 1.33667C3.23565 1.33667 0.99707 3.57525 0.99707 6.33667C0.99707 9.09809 3.23565 11.3367 5.99707 11.3367Z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.49707 6.33667L5.49707 7.33667L7.49707 5.33667"/>
                            </svg>
                            <span className="text-xs text-gray-600">{item}</span>
                          </div>
                        ))}
                      </div>
                      <a href="#" className="flex items-center gap-1 text-xs font-medium text-[#2463EB] hover:underline">
                        Explore
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 12 13">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.49707 6.33667H9.49707"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.99707 2.83667L9.49707 6.33667L5.99707 9.83667"/>
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}
