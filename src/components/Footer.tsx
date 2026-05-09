export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-8 py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start justify-between">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <span className="text-sm font-black italic">PH</span>
              </div>
              <span className="text-xl font-black text-foreground uppercase tracking-tighter italic">
                Project Hub
              </span>
            </div>
            <p className="max-w-md text-xs font-black text-muted-foreground uppercase tracking-widest opacity-60 leading-relaxed italic">
              Advanced neural infrastructure for high-velocity project
              architecture. Synchronize your collective, dominate the matrix.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            {[
              "Features",
              "Integrations",
              "Security",
              "Pricing",
              "Enterprise",
              "Nexus",
            ].map((item) => (
              <a
                key={item}
                className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] hover:text-primary transition-all duration-300"
                href="#"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
            © 2025 Project Hub. Network Core v4.0.0. All sectors reserved.
          </p>
          <div className="flex gap-8">
            <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] hover:text-primary cursor-pointer transition-all">
              Privacy Policy
            </span>
            <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] hover:text-primary cursor-pointer transition-all">
              Terms of Matrix
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
