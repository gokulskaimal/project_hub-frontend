import Link from "next/link";

export default function Header() {
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
            {[
              "Features",
              "Integrations",
              "Pricing",
              "Enterprise",
              "Network",
            ].map((item) => (
              <a
                key={item}
                className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-primary transition-all duration-300"
                href="#"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-6">
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
        </div>
      </div>
    </header>
  );
}
