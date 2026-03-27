import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white/80">
      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                <span className="text-sm font-bold text-white">PH</span>
              </div>
              <span className="text-base font-semibold text-gray-900">
                Project Hub
              </span>
            </div>
            <p className="max-w-md text-sm text-gray-600">
              Project management that helps teams plan, track, and collaborate
              effortlessly.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 lg:gap-8">
            <a className="text-sm text-gray-600 hover:text-gray-900" href="#">
              Features
            </a>
            <a className="text-sm text-gray-600 hover:text-gray-900" href="#">
              Integrations
            </a>
            <a className="text-sm text-gray-600 hover:text-gray-900" href="#">
              Big Picture
            </a>
            <a className="text-sm text-gray-600 hover:text-gray-900" href="#">
              Pricing
            </a>
            <a className="text-sm text-gray-600 hover:text-gray-900" href="#">
              Customers
            </a>
            <a className="text-sm text-gray-600 hover:text-gray-900" href="#">
              Get Started
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-center text-xs text-gray-500">
            © 2025 Project Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
