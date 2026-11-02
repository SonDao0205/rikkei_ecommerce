const BG_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB-xUVBKcK_79vlU0-jCp_HgtF6jdC_MaUXGJ4QhfDI2yzlKDtR3E2qZkTltVeraBco2cwpnbj1yy82-XGkgbwHmT_U-Hn5rORhHBZjYGZsWaJ-aeDR2sbEaS5IyM-Rdog8exIgGNShXfWEQayKR7amD4J1hcfermpW92FOeGBOqc8uiqXAi815xMCbAmayptoAeYdq_AJO8ZvR7bIK4z0ryE1ez4j4vF2804RgcLetGhXdOgzp9hHq";

const stats = [
  { value: "4.9/5", label: "Customer Rating" },
  { value: "2.4M+", label: "Orders Delivered" },
  { value: "100%", label: "Buyer Protection" },
];

const LoginHeroPanel = () => {
  return (
    <div className="relative w-full lg:w-1/2 min-h-[260px] sm:min-h-[340px] lg:min-h-screen bg-slate-950 flex flex-col justify-between p-6 sm:p-10 lg:p-16 overflow-hidden">
      {/* Background Image */}
      <img
        src={BG_IMAGE_URL}
        alt="Multi-vendor e-commerce shopping lifestyle"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.82] contrast-[1.08] scale-105 transition-transform duration-1000 ease-out hover:scale-100"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/70 backdrop-blur-[2px]" />

      {/* Top: Brand Logo + Status Pill */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center p-2">
            <svg className="w-6 h-6 text-brand-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">MarketPulse</span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 backdrop-blur-md border border-white/15">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Multi-Store Hub
        </span>
      </div>

      {/* Bottom: Tagline + Stats */}
      <div className="relative z-10 mt-auto pt-8 max-w-lg">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/25 border border-indigo-400/30 text-indigo-200 text-xs font-medium mb-3 backdrop-blur-sm">
          <span>✨ Discover over 12,000+ verified artisan vendors</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug lg:leading-tight">
          Your favorite multi-store shopping destination{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-200 to-pink-200">
            in one place.
          </span>
        </h2>

        <p className="mt-3 text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
          Access thousands of curated independent brands, direct-to-consumer storefronts, and unified cross-vendor
          checkout with single-click tracking.
        </p>

        {/* Stats Bar */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-lg lg:text-xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginHeroPanel;
