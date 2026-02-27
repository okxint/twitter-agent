"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/api";

/* ─── Icon components ─── */
const IconBolt = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const IconSearch = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconSparkles = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
const IconShield = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const IconChart = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const IconClock = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IconArrowRight = () => (
  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const features = [
  {
    icon: <IconSearch />,
    title: "Smart Tweet Discovery",
    desc: "Automatically scrape and analyze top-performing tweets across your topics using engagement scoring.",
  },
  {
    icon: <IconSparkles />,
    title: "AI Content Generation",
    desc: "Claude AI analyzes viral patterns and generates original, on-brand tweets tailored to your voice.",
  },
  {
    icon: <IconBolt />,
    title: "One-Click Posting",
    desc: "Approve a tweet and it's instantly posted to your Twitter account. No copy-pasting, no scheduling tools.",
  },
  {
    icon: <IconShield />,
    title: "Human in the Loop",
    desc: "Every tweet goes through your approval. Edit, reject, or approve — you're always in control.",
  },
  {
    icon: <IconChart />,
    title: "Engagement Analytics",
    desc: "Track what's working. See your pending, posted, and generated tweet stats at a glance.",
  },
  {
    icon: <IconClock />,
    title: "Daily Automation",
    desc: "Set it and forget it. Automated scraping and generation runs daily so you always have fresh content.",
  },
];

const steps = [
  { num: "01", title: "Add Your Topics", desc: "Tell us what you want to tweet about — AI, startups, marketing, anything." },
  { num: "02", title: "We Scrape the Best", desc: "Our engine finds the highest-engagement tweets in your niche using real-time data." },
  { num: "03", title: "AI Generates Drafts", desc: "Claude AI creates original tweets inspired by proven viral patterns. Not copies — originals." },
  { num: "04", title: "You Approve & Post", desc: "Review each draft. Edit if you want. Hit approve and it's live on Twitter." },
];

const pricingFeatures = {
  free: [
    "3 topics",
    "10 generated tweets/day",
    "Manual scraping",
    "Tweet approval dashboard",
    "Basic analytics",
  ],
  pro: [
    "Unlimited topics",
    "50 generated tweets/day",
    "Automated daily scraping",
    "Priority AI generation",
    "Advanced analytics",
    "Telegram notifications",
    "API access",
    "Priority support",
  ],
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="bg-white">
      {/* ─── LANDING NAVBAR ─── */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">
            TweetAgent
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-20 -left-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-32 pb-20">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            <span className="text-sm font-medium text-indigo-700">Now in public beta</span>
          </div>

          <h1 className="animate-fade-in-up delay-100 text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Your Twitter Growth
            <br />
            <span className="gradient-text">on Autopilot</span>
          </h1>

          <p className="animate-fade-in-up delay-200 mt-6 text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            AI scrapes viral tweets, generates original content in your voice, and posts when you approve.
            Grow your audience while you sleep.
          </p>

          <div className="animate-fade-in-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all hover:shadow-xl hover:shadow-indigo-500/30 text-lg"
            >
              Start Free Today
              <IconArrowRight />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center px-8 py-4 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all border border-gray-200 text-lg"
            >
              See How It Works
            </a>
          </div>

          {/* Social proof */}
          <div className="animate-fade-in-up delay-500 mt-16 flex flex-col items-center">
            <div className="flex -space-x-3">
              {[..."ABCDE"].map((l, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    background: ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e"][i],
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Trusted by <span className="font-semibold text-gray-700">500+</span> creators and founders
            </p>
          </div>

          {/* Dashboard preview mockup */}
          <div className="animate-fade-in-up delay-600 mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/50 overflow-hidden bg-gray-50 p-1">
              <div className="rounded-xl bg-white border border-gray-100 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="ml-4 flex-1 h-6 bg-gray-100 rounded-md" />
                </div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Pending", val: "12", color: "bg-amber-500" },
                    { label: "Posted", val: "847", color: "bg-green-500" },
                    { label: "Generated", val: "2.4K", color: "bg-indigo-500" },
                    { label: "Topics", val: "8", color: "bg-purple-500" },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-lg p-4">
                      <div className={`text-2xl font-bold ${s.color === "bg-indigo-500" ? "text-indigo-600" : s.color === "bg-green-500" ? "text-green-600" : s.color === "bg-amber-500" ? "text-amber-600" : "text-purple-600"}`}>
                        {s.val}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {["AI is transforming how we build products. Here's what most founders miss...",
                    "Stop chasing metrics. Start building things people actually want.",
                  ].map((t, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-4 flex items-start justify-between">
                      <div>
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">AI & Startups</span>
                        <p className="mt-2 text-sm text-gray-700">{t}</p>
                      </div>
                      <div className="flex space-x-2 shrink-0 ml-4">
                        <div className="px-3 py-1 bg-green-500 text-white text-xs rounded-md font-medium">Approve</div>
                        <div className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">Edit</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 bg-gray-50 relative noise-bg">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Everything you need to<br /><span className="gradient-text">dominate Twitter</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              From discovery to posting, TweetAgent handles the entire content pipeline.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Four steps to<br /><span className="gradient-text">Twitter autopilot</span>
            </h2>
          </div>
          <div className="space-y-12">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={`flex items-start gap-8 ${i % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""}`}
              >
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
                  {s.num}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-lg leading-relaxed max-w-lg">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 bg-gray-50 relative noise-bg">
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Start free,<br /><span className="gradient-text">scale when ready</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-all">
              <h3 className="text-lg font-bold text-gray-900">Free</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-extrabold text-gray-900">$0</span>
                <span className="ml-2 text-gray-500">/month</span>
              </div>
              <p className="mt-4 text-gray-500">Perfect for getting started and testing the waters.</p>
              <Link
                href="/register"
                className="mt-8 block w-full text-center py-3 px-4 rounded-xl border-2 border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
              >
                Get Started
              </Link>
              <ul className="mt-8 space-y-3">
                {pricingFeatures.free.map((f) => (
                  <li key={f} className="flex items-center text-sm text-gray-600">
                    <IconCheck />
                    <span className="ml-3">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Pro */}
            <div className="relative bg-white rounded-2xl p-8 border-2 border-indigo-600 shadow-xl shadow-indigo-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-lg font-bold text-gray-900">Pro</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-extrabold text-gray-900">$29</span>
                <span className="ml-2 text-gray-500">/month</span>
              </div>
              <p className="mt-4 text-gray-500">For serious creators who want to grow fast.</p>
              <Link
                href="/register"
                className="mt-8 block w-full text-center py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Start Pro Trial
              </Link>
              <ul className="mt-8 space-y-3">
                {pricingFeatures.pro.map((f) => (
                  <li key={f} className="flex items-center text-sm text-gray-600">
                    <IconCheck />
                    <span className="ml-3">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-3">About Us</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
            Built by creators,<br /><span className="gradient-text">for creators</span>
          </h2>
          <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-12">
            We were tired of spending hours crafting tweets, only to see them flop.
            So we built TweetAgent — an AI that studies what actually goes viral in your niche
            and helps you create content that resonates. No fluff, no generic advice.
            Just tweets that work.
          </p>
          <div className="grid grid-cols-3 gap-8">
            {[
              { val: "500+", label: "Active Users" },
              { val: "50K+", label: "Tweets Posted" },
              { val: "10M+", label: "Impressions Generated" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-extrabold gradient-text">{s.val}</div>
                <div className="mt-2 text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT / CTA ─── */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 border border-white/30 rounded-full" />
          <div className="absolute bottom-10 right-10 w-96 h-96 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
            Ready to grow your<br />Twitter on autopilot?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-xl mx-auto">
            Join 500+ creators already using TweetAgent to build their audience effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-xl text-lg"
            >
              Get Started Free
              <IconArrowRight />
            </Link>
            <a
              href="mailto:hello@tweetagent.ai"
              className="flex items-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 text-lg"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <span className="text-xl font-bold text-white">TweetAgent</span>
              <p className="mt-3 text-sm leading-relaxed">
                AI-powered Twitter growth for creators, founders, and marketers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm">&copy; 2026 TweetAgent. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
