"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/api";
import { useTheme } from "@/lib/theme";

/* ─── Icons (outline style) ─── */
const IconArrowRight = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

/* ─── Feature data ─── */
const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Reddit Discovery",
    desc: "Monitors trending discussions from the subreddits that matter in your niche.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: "AI Generation",
    desc: "Claude reads discussions and writes original tweets in your voice -- not rephrased copies.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "One-Click Posting",
    desc: "API-powered posting. No browser automation, no CAPTCHAs. Approve and it goes live.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Human-in-the-Loop",
    desc: "Every tweet needs your approval. Edit, reject, or approve. You stay in control.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Topic Intelligence",
    desc: "Track multiple niches simultaneously. AI adapts tone and style for each topic.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Daily Automation",
    desc: "Set your schedule. Fresh content generated daily with zero manual effort.",
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
    <div className="bg-white dark:bg-slate-950 text-gray-900 dark:text-white">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            TweetAgent
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={cycleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
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
            <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="min-h-screen flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-6 text-center pt-32 pb-20">
          <div className="animate-fade-in-up inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-sm text-gray-600 dark:text-slate-400 mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
            Open source Reddit-to-Twitter pipeline
          </div>

          <h1 className="animate-fade-in-up text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Turn Reddit discussions into
            <br />
            <span className="text-indigo-600 dark:text-indigo-400">Twitter content</span>, automatically
          </h1>

          <p className="animate-fade-in-up mt-6 text-base md:text-lg text-gray-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            TweetAgent monitors subreddits in your niche, generates original tweets
            with Claude AI, and posts them with your approval.
          </p>

          <div className="animate-fade-in-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Start Free
              <IconArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              From Reddit to Twitter in three steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2">Monitor Reddit</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">Choose your niches and subreddits. Top posts and engagement scores are pulled automatically.</p>
            </div>

            {/* Connector */}
            <div className="hidden md:block absolute" />

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2">AI Generates Tweets</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">Claude reads the discussions and writes original tweets in your tone and style.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2">You Approve & Post</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">Review, edit, or reject. Approved tweets go live on Twitter instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Features</h2>
            <p className="mt-4 text-base text-gray-600 dark:text-slate-400 max-w-xl mx-auto">
              Everything you need to automate your content pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl p-6 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-sm hover:border-gray-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Simple pricing
            </h2>
            <p className="mt-4 text-base text-gray-600 dark:text-slate-400">
              Start free. Upgrade when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="rounded-xl p-8 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <h3 className="text-lg font-semibold">Free</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">$0</span>
                <span className="ml-2 text-gray-500 dark:text-slate-500">/month</span>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-slate-400">Perfect for getting started.</p>
              <Link
                href="/register"
                className="mt-6 block w-full text-center py-2.5 px-4 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Get Started
              </Link>
              <ul className="mt-6 space-y-3">
                {pricingFree.map((f) => (
                  <li key={f} className="flex items-center text-sm text-gray-700 dark:text-slate-300">
                    <IconCheck />
                    <span className="ml-2.5">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="relative rounded-xl p-8 border-2 border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-950">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-full">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold">Pro</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">$29</span>
                <span className="ml-2 text-gray-500 dark:text-slate-500">/month</span>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-slate-400">For creators who want to grow fast.</p>
              <Link
                href="/register"
                className="mt-6 block w-full text-center py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
              >
                Start Pro Trial
              </Link>
              <ul className="mt-6 space-y-3">
                {pricingPro.map((f) => (
                  <li key={f} className="flex items-center text-sm text-gray-700 dark:text-slate-300">
                    <IconCheck />
                    <span className="ml-2.5">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to automate your content?
          </h2>
          <p className="text-base text-gray-600 dark:text-slate-400 mb-8">
            Set up your topics, let AI handle the rest.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Get Started Free
            <IconArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 dark:bg-slate-950 border-t border-gray-800 dark:border-slate-800 text-gray-400 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <span className="text-lg font-bold text-white">TweetAgent</span>
              <p className="mt-3 text-sm text-gray-500">Reddit insights. Claude intelligence. Your voice.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com/okxint/twitter-agent" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="https://github.com/okxint/twitter-agent#readme" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://x.com/tweetagent" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="https://github.com/okxint" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 dark:border-slate-800 text-sm text-gray-500">
            &copy; 2026 TweetAgent. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
