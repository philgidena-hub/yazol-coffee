import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yazol Coffee — Coming Soon",
  description:
    "Something special is brewing. Yazol Coffee is coming soon to Danforth Ave, Toronto.",
};

export default function ComingSoonPage() {
  return (
    <main className="relative min-h-svh flex flex-col items-center justify-center overflow-hidden px-5">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8e8d8] via-[#faf0e8] to-[#e8f0e8]" />

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-pink-200/40 to-purple-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-tl from-green-100/30 to-teal-100/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brown/10 bg-white/60 backdrop-blur-sm shadow-sm mb-6">
          <svg
            className="w-3.5 h-3.5 text-gold"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
          </svg>
          <span className="text-brown/70 text-xs font-body tracking-wide">
            Ethiopian Heritage, Modern Experience
          </span>
        </div>

        {/* Brand */}
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl text-plum mb-3">
          Yazol
        </h1>
        <h2 className="font-display text-xl sm:text-2xl text-brown mb-6">
          Coffee &amp; Scoop Stop
        </h2>

        {/* Coming Soon */}
        <div className="inline-block px-6 py-2.5 rounded-full bg-gold/10 border border-gold/20 mb-6">
          <span className="font-display text-sm sm:text-base text-gold tracking-wide">
            Coming Soon
          </span>
        </div>

        <p className="text-brown/50 text-sm sm:text-base font-body leading-relaxed mb-10">
          Something special is brewing. We&apos;re bringing authentic Ethiopian
          coffee and artisan ice cream to Danforth Ave, Toronto.
        </p>

        {/* Location & Hours */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-brown/40">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-xs sm:text-sm font-body">
              2857 Danforth Ave, Toronto
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
