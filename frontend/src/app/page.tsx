"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/api";
import { useTheme } from "@/lib/theme";

/* ─── Icons ─── */
const IconArrowRight = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-5 h-5 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

/* ─── Data ─── */
const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Reddit Discovery",
    desc: "Monitors trending discussions from the subreddits that matter in your niche.",
    tint: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: "AI Generation",
    desc: "Claude reads discussions and writes original tweets in your voice -- not rephrased copies.",
    tint: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "One-Click Posting",
    desc: "API-powered posting. No browser automation, no CAPTCHAs. Approve and it goes live.",
    tint: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Human-in-the-Loop",
    desc: "Every tweet needs your approval. Edit, reject, or approve. You stay in control.",
    tint: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Topic Intelligence",
    desc: "Track multiple niches simultaneously. AI adapts tone and style for each topic.",
    tint: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Daily Automation",
    desc: "Set your schedule. Fresh content generated daily with zero manual effort.",
    tint: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
];

const steps = [
  {
    num: "01",
    title: "Pick Your Topics",
    desc: "Choose your niches and add subreddits.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Reddit Scrapes Daily",
    desc: "Top posts and engagement scores pulled automatically.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "AI Generates Tweets",
    desc: "Claude writes original tweets in your tone.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "You Approve & Post",
    desc: "Review, edit, approve. Live on Twitter instantly.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const pricingFree = [
  "3 topics",
  "10 generated tweets/day",
  "Manual Reddit scraping",
  "Tweet approval dashboard",
  "Basic analytics",
];

const pricingPro = [
  "Unlimited topics",
  "50 generated tweets/day",
  "Automated daily scraping",
  "Priority Claude AI generation",
  "Advanced analytics",
  "Telegram notifications",
  "API access",
  "Priority support",
];

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  };

  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text-hero">
            TweetAgent
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={cycleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
              title={`Theme: ${theme}`}
            >
              {theme === "light" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : theme === "dark" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-violet-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Subtle gradient mesh -- dark mode only */}
        <div className="absolute inset-0 hidden dark:block" style={{
          backgroundImage: `
            radial-gradient(at 20% 20%, rgba(139, 92, 246, 0.12) 0px, transparent 50%),
            radial-gradient(at 80% 20%, rgba(6, 182, 212, 0.10) 0px, transparent 50%),
            radial-gradient(at 50% 80%, rgba(52, 211, 153, 0.08) 0px, transparent 50%)
          `,
          backgroundColor: '#020617'
        }} />
        {/* Light mode subtle bg */}
        <div className="absolute inset-0 dark:hidden" style={{
          backgroundImage: `
            radial-gradient(at 20% 20%, rgba(139, 92, 246, 0.06) 0px, transparent 50%),
            radial-gradient(at 80% 20%, rgba(6, 182, 212, 0.05) 0px, transparent 50%),
            radial-gradient(at 50% 80%, rgba(52, 211, 153, 0.04) 0px, transparent 50%)
          `,
        }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-32 pb-20">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2.5 animate-pulse" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Used by 500+ creators</span>
          </div>

          <h1 className="animate-fade-in-up delay-100 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1]">
            Your AI-powered
            <br />
            <span className="gradient-text-hero">Reddit-to-Twitter</span>
            <br />
            pipeline
          </h1>

          <p className="animate-fade-in-up delay-200 mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            TweetAgent monitors Reddit discussions in your niche, generates original
            tweets in your voice, and posts them — with your approval.
          </p>

          <div className="animate-fade-in-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-violet-500/25 text-lg"
            >
              Start Free
              <IconArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center px-8 py-4 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-lg"
            >
              See How It Works
            </a>
          </div>

          {/* Dashboard mockup */}
          <div className="animate-fade-in-up delay-500 mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-none">
              <div className="bg-white dark:bg-slate-900 p-6">
                {/* Browser chrome */}
                <div className="flex items-center space-x-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="ml-4 flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-md" />
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "Pending", val: "12", color: "text-amber-500 dark:text-amber-400" },
                    { label: "Posted", val: "847", color: "text-emerald-500 dark:text-emerald-400" },
                    { label: "Generated", val: "2.4K", color: "text-violet-500 dark:text-violet-400" },
                    { label: "Topics", val: "8", color: "text-cyan-500 dark:text-cyan-400" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                      <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
                      <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Tweet cards */}
                <div className="space-y-3">
                  {[
                    { topic: "AI & Startups", text: "AI is transforming how we build products. Here's what most founders miss about the current wave..." },
                    { topic: "Machine Learning", text: "The gap between research and production ML is shrinking fast. Three trends making it happen:" },
                  ].map((t, i) => (
                    <div key={i} className="border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4 flex items-start justify-between">
                      <div>
                        <span className="text-xs bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 px-2 py-0.5 rounded-full font-medium">{t.topic}</span>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t.text}</p>
                      </div>
                      <div className="flex space-x-2 shrink-0 ml-4">
                        <div className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-md font-medium">Approve</div>
                        <div className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-md font-medium">Edit</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-28 bg-white dark:bg-slate-950 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              From Reddit to Twitter in four steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <div key={s.num} className="relative group">
                <div className="rounded-2xl p-6 h-full flex flex-col border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:-translate-y-1">
                  {/* Number + icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-extrabold text-slate-200 dark:text-slate-800/80">{s.num}</span>
                    <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      {s.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex-1">{s.desc}</p>
                </div>

                {/* Arrow connector */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-28 bg-slate-50 dark:bg-slate-900/30 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              The full content pipeline, automated
            </h2>
            <p className="mt-5 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From Reddit discovery to one-click posting. Everything runs on your schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-8 flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${f.tint} flex items-center justify-center mb-5`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed flex-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-28 bg-white dark:bg-slate-950 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Start free.{" "}
              <span className="gradient-text-hero">Scale when ready.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl p-8 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Free</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="ml-2 text-slate-500">/month</span>
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Perfect for getting started and testing the waters.</p>
              <Link
                href="/register"
                className="mt-8 block w-full text-center py-3 px-4 rounded-xl border-2 border-violet-500/50 text-violet-600 dark:text-violet-400 font-semibold hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:border-violet-500 transition-all"
              >
                Get Started
              </Link>
              <ul className="mt-8 space-y-3">
                {pricingFree.map((f) => (
                  <li key={f} className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                    <IconCheck />
                    <span className="ml-3">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl p-8 border-2 border-violet-500 dark:border-violet-500/60 bg-white dark:bg-slate-900/50 shadow-lg shadow-violet-500/10 dark:shadow-violet-500/5">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pro</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white">$29</span>
                <span className="ml-2 text-slate-500">/month</span>
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">For serious creators who want to grow fast.</p>
              <Link
                href="/register"
                className="mt-8 block w-full text-center py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/25"
              >
                Start Pro Trial
              </Link>
              <ul className="mt-8 space-y-3">
                {pricingPro.map((f) => (
                  <li key={f} className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                    <IconCheck />
                    <span className="ml-3">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-28 relative overflow-hidden bg-slate-50 dark:bg-transparent">
        {/* Subtle accent gradient - dark mode only */}
        <div className="absolute inset-0 hidden dark:block" style={{
          backgroundImage: `
            radial-gradient(at 50% 50%, rgba(139, 92, 246, 0.08) 0px, transparent 60%)
          `,
        }} />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
            Ready to automate your
            <br />
            Twitter <span className="gradient-text-hero">content pipeline?</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl mx-auto">
            Set up your topics, let AI do the research and writing, and post with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-violet-500/25 text-lg"
            >
              Get Started Free
              <IconArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <a
              href="https://github.com/okxint/twitter-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 text-slate-700 dark:text-slate-300 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-slate-800/50 transition-all text-lg gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/50 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold gradient-text-hero">TweetAgent</span>
            <span className="text-sm text-slate-500 dark:text-slate-600">Reddit insights. Claude intelligence. Your voice.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/okxint/twitter-agent" target="_blank" rel="noopener noreferrer" className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
            </a>
            <a href="https://x.com/tweetagent" target="_blank" rel="noopener noreferrer" className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <span className="text-sm text-slate-500 dark:text-slate-600">&copy; 2026 TweetAgent</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
