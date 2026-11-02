interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StatItem {
  value: string;
  label: string;
}

const features: FeatureItem[] = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Thousands of verified shops",
    description: "Hand-picked independent artisans, designers & local vendors",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Secure payments & COD",
    description: "Unified secure escrow with flexible cash-on-delivery options",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Fast delivery & buyer protection",
    description: "Live package tracking & hassle-free 100% money-back warranty",
  },
];

const stats: StatItem[] = [
  { value: "4.9/5", label: "Customer Rating" },
  { value: "2.4M+", label: "Orders Delivered" },
  { value: "100%", label: "Buyer Protection" },
];

const AuthHeroPanel = () => {
  return (
    <section className="relative lg:col-span-5 xl:col-span-6 bg-slate-950 text-white p-8 lg:p-14 xl:p-16 flex flex-col justify-between overflow-hidden min-h-[640px] lg:min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Happy boutique shopper holding shopping bags"
          className="w-full h-full object-cover object-top opacity-35 filter brightness-90 saturate-110"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV5dpGziMYHyxE2zdk8-54DQuhxG1b7vwlv7aYfFsMk02Ro7vdkplzVZhvXfd_2xdQkCBShW66S1ixybUVBY2GQKNkaMS6mkpj_nMZ0vjNJ7mLRak1nymobmBQH5YhE1dHo70ox7H09fNxIe9UTbku91C8ABGLac6dLEoxvjUnOnFJoVEu_mu546Uo-lQG3zyZumWQbsx-Xm9Yf1nn58R4L-C8mmL4ExW05Xox2iBcCrDC8fl6QVAk"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
      </div>

      {/* Top Branding */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center p-2">
            <svg className="w-6 h-6 text-brand-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">MarketPulse</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Multi-Store Hub</span>
        </div>
      </header>

      {/* Center Copy */}
      <div className="relative z-10 my-auto py-10 max-w-xl">
        <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1 rounded-full text-xs font-semibold text-slate-100 mb-6 shadow-sm">
          <span>✨</span>
          <span>Discover over 12,000+ verified artisan vendors</span>
        </div>

        <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Join MarketPulse <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-indigo-200 to-white">
            in one place.
          </span>
        </h1>

        <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
          Access thousands of curated independent brands, direct-to-consumer storefronts, and unified cross-vendor
          checkout with single-click tracking.
        </p>

        {/* Feature Cards */}
        <div className="mt-8 space-y-3.5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-3.5 p-3 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-sm transition-all hover:bg-white/[0.12]"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 flex items-center justify-center">
                {feature.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{feature.title}</p>
                <p className="text-xs text-slate-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Stats */}
      <footer className="relative z-10 pt-6 border-t border-white/15 grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index}>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">{stat.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </footer>
    </section>
  );
};

export default AuthHeroPanel;
