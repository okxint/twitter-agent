"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/api";

/* ─── Icons ─── */
const IconArrowRight = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IconReddit = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);
const IconX = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconClaude = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.709 15.955l4.397-2.854-.863-1.329-5.304 3.442L4.71 15.955zm8.992-.639l1.717 2.644-1.69 1.098-1.717-2.644 1.69-1.098zM16.9 8.295l-4.396 2.854.862 1.329 5.305-3.443L16.9 8.295zm-8.992.639L6.191 6.29l1.69-1.098 1.718 2.644-1.69 1.098zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
  </svg>
);

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Reddit-Powered Discovery",
    desc: "Not random content. Real trending discussions from the subreddits that matter in your niche.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: "Claude AI Generation",
    desc: "Original tweets, not rephrased copies. Claude reads discussions and writes in your voice.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "One-Click Posting",
    desc: "API-powered. No browser automation. No CAPTCHAs. Approve and it's live instantly.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Human-in-the-Loop",
    desc: "Every tweet needs your approval. Edit, reject, or approve. You're always in control.",
    color: "from-violet-500 to-indigo-600",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Topic Intelligence",
    desc: "Track multiple niches simultaneously. AI adapts tone and style for each topic.",
    color: "from-cyan-500 to-teal-600",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Daily Automation",
    desc: "Set your schedule. Fresh content generated daily. Zero manual effort required.",
    color: "from-emerald-500 to-green-600",
  },
];

const steps = [
  {
    num: "01",
    title: "Pick Your Topics",
    desc: "Choose your niches and add subreddits — r/MachineLearning, r/startups, r/SaaS, anything.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Reddit Scrapes Daily",
    desc: "Top posts, comments, and engagement scores pulled automatically from your chosen subreddits.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "AI Generates Tweets",
    desc: "Claude reads the discussions, understands what's trending, and writes original tweets in your tone.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "You Approve & Post",
    desc: "Review every draft. Edit if you want. Hit approve and it's live on Twitter via API. Instant.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`TweetAgent Inquiry from ${contactName}`);
    const body = encodeURIComponent(`Name: ${contactName}\nEmail: ${contactEmail}\n\n${contactMsg}`);
    window.open(`mailto:hello@tweetagent.ai?subject=${subject}&body=${body}`);
    setContactSent(true);
    setTimeout(() => setContactSent(false), 3000);
  };

  return (
    <div className="bg-slate-950 text-white">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 w-full z-50 glass-dark">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text-hero">
            TweetAgent
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#contact" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="shimmer text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-violet-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh">
        {/* Floating orbs */}
        <div className="absolute top-20 -left-32 w-80 h-80 bg-violet-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-float" />
        <div className="absolute top-40 -right-32 w-80 h-80 bg-cyan-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-emerald-500 rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-32 pb-20">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center px-4 py-1.5 rounded-full border border-slate-700 bg-slate-900/50 mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2.5 animate-pulse" />
            <span className="text-sm font-medium text-slate-300">Reddit-Powered AI Content Engine</span>
          </div>

          <h1 className="animate-fade-in-up delay-100 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1]">
            Turn Reddit Trends
            <br />
            Into <span className="gradient-text-hero">Viral Tweets</span>
          </h1>

          <p className="animate-fade-in-up delay-200 mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Our AI scrapes top Reddit discussions in your niche, generates original tweets
            in your voice, and posts them with one click. Grow on autopilot.
          </p>

          <div className="animate-fade-in-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="shimmer group flex items-center px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-violet-500/25 text-lg"
            >
              Start Free
              <IconArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center px-8 py-4 text-slate-300 font-semibold rounded-xl transition-all border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 text-lg"
            >
              See How It Works
            </a>
          </div>

          {/* Dashboard mockup */}
          <div className="animate-fade-in-up delay-500 mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border border-slate-800 shadow-2xl shadow-violet-500/5 overflow-hidden bg-slate-900 p-1">
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
                {/* Browser chrome */}
                <div className="flex items-center space-x-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <div className="ml-4 flex-1 h-6 bg-slate-800 rounded-md" />
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "Pending", val: "12", color: "text-amber-400" },
                    { label: "Posted", val: "847", color: "text-emerald-400" },
                    { label: "Generated", val: "2.4K", color: "text-violet-400" },
                    { label: "Topics", val: "8", color: "text-cyan-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
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
                    <div key={i} className="border border-slate-700/50 bg-slate-800/30 rounded-lg p-4 flex items-start justify-between">
                      <div>
                        <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-medium">{t.topic}</span>
                        <p className="mt-2 text-sm text-slate-300">{t.text}</p>
                      </div>
                      <div className="flex space-x-2 shrink-0 ml-4">
                        <div className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-md font-medium">Approve</div>
                        <div className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs rounded-md font-medium">Edit</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── POWERED BY ─── */}
      <section className="py-12 border-y border-slate-800/50 bg-slate-950">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Powered by</span>
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2.5 text-slate-400">
              <IconReddit />
              <span className="text-lg font-semibold">Reddit</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-400">
              <IconX />
              <span className="text-lg font-semibold">Twitter</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-400">
              <IconClaude />
              <span className="text-lg font-semibold">Claude AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-28 bg-slate-950 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              From Reddit to Twitter
              <br />
              <span className="gradient-text-hero">in four steps</span>
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute left-[39px] top-8 bottom-8 w-0.5 pipeline-line rounded-full" />

            <div className="space-y-16">
              {steps.map((s, i) => (
                <div key={s.num} className="relative flex items-start gap-8 group">
                  {/* Number badge */}
                  <div className="relative z-10 shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                    <span className="text-white font-bold text-lg">{s.num}</span>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-slate-400">{s.icon}</span>
                      <h3 className="text-2xl font-bold text-white">{s.title}</h3>
                    </div>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-xl">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-28 bg-slate-900/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Everything you need to
              <br />
              <span className="gradient-text-hero">dominate Twitter</span>
            </h2>
            <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto">
              From Reddit discovery to one-click posting. The full content pipeline, automated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="glow-card group rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 text-white shadow-lg`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRODUCT PREVIEW ─── */}
      <section className="py-28 bg-slate-950 relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600 rounded-full filter blur-[160px] opacity-10" />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">Product</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Your command center for
              <br />
              <span className="gradient-text-hero">Twitter growth</span>
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-violet-500/5">
            {/* Topic badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["r/MachineLearning", "r/startups", "r/SaaS", "r/artificial", "r/Entrepreneur"].map((sub) => (
                <span key={sub} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-slate-300">
                  {sub}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Tweets Pending", val: "7", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                { label: "Posted This Week", val: "23", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { label: "Total Generated", val: "156", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
                  <div className={`text-3xl font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Sample tweets */}
            <div className="space-y-3">
              {[
                { topic: "AI & ML", text: "Transformers aren't just for NLP anymore. The latest research shows them outperforming CNNs in computer vision tasks by 15%. The architecture shift is real.", status: "pending" },
                { topic: "Startups", text: "The best pitch decks I've reviewed this year all had one thing in common: they led with the problem, not the solution. Founders, take note.", status: "approved" },
                { topic: "SaaS", text: "Your churn rate isn't a retention problem. It's an onboarding problem. Fix the first 48 hours and watch everything change.", status: "posted" },
              ].map((t, i) => (
                <div key={i} className="border border-slate-700/50 bg-slate-800/30 rounded-xl p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-medium">{t.topic}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.status === "posted" ? "bg-emerald-500/20 text-emerald-300" :
                        t.status === "approved" ? "bg-cyan-500/20 text-cyan-300" :
                        "bg-amber-500/20 text-amber-300"
                      }`}>{t.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300 leading-relaxed">{t.text}</p>
                  </div>
                  {t.status === "pending" && (
                    <div className="flex space-x-2 shrink-0 ml-4">
                      <div className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-md font-semibold cursor-pointer hover:bg-emerald-500 transition-colors">Approve</div>
                      <div className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs rounded-md font-semibold cursor-pointer hover:bg-slate-600 transition-colors">Edit</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-28 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Start free.
              <br />
              <span className="gradient-text-hero">Scale when ready.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl p-8 border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all">
              <h3 className="text-lg font-bold text-white">Free</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-extrabold text-white">$0</span>
                <span className="ml-2 text-slate-500">/month</span>
              </div>
              <p className="mt-4 text-slate-400">Perfect for getting started and testing the waters.</p>
              <Link
                href="/register"
                className="mt-8 block w-full text-center py-3 px-4 rounded-xl border-2 border-violet-500 text-violet-400 font-semibold hover:bg-violet-500/10 transition-colors"
              >
                Get Started
              </Link>
              <ul className="mt-8 space-y-3">
                {pricingFree.map((f) => (
                  <li key={f} className="flex items-center text-sm text-slate-300">
                    <IconCheck />
                    <span className="ml-3">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl p-8 bg-slate-900/50 glow-border-animated">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-lg font-bold text-white">Pro</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-extrabold text-white">$29</span>
                <span className="ml-2 text-slate-500">/month</span>
              </div>
              <p className="mt-4 text-slate-400">For serious creators who want to grow fast.</p>
              <Link
                href="/register"
                className="shimmer mt-8 block w-full text-center py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/25"
              >
                Start Pro Trial
              </Link>
              <ul className="mt-8 space-y-3">
                {pricingPro.map((f) => (
                  <li key={f} className="flex items-center text-sm text-slate-300">
                    <IconCheck />
                    <span className="ml-3">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-28 bg-slate-950 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-600 rounded-full filter blur-[160px] opacity-5" />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">Contact</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Get in <span className="gradient-text-hero">touch</span>
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Have questions? Want a demo? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Reach Us</h3>
                <div className="space-y-4">
                  <a href="mailto:hello@tweetagent.ai" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <span>hello@tweetagent.ai</span>
                  </a>
                  <a href="https://x.com/tweetagent" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <span>@tweetagent</span>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Location</h3>
                <p className="text-slate-400">San Francisco, CA</p>
                <p className="text-slate-500 text-sm mt-1">Building the future of content automation</p>
              </div>
            </div>

            {/* Contact form */}
            <form onSubmit={handleContact} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
              <div>
                <textarea
                  placeholder="Your message..."
                  rows={4}
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="shimmer w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-violet-500/25"
              >
                {contactSent ? "Opening mail client..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600 rounded-full filter blur-[200px] opacity-15" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Ready to put your
            <br />
            Twitter on <span className="gradient-text-hero">autopilot?</span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto">
            Join the creators already using TweetAgent to turn Reddit insights into Twitter growth.
          </p>
          <Link
            href="/register"
            className="shimmer inline-flex items-center px-10 py-5 bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-violet-500/30 text-lg"
          >
            Get Started Free
            <IconArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-950 border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <span className="text-xl font-bold gradient-text-hero">TweetAgent</span>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                AI-powered Twitter growth engine. Reddit insights, Claude intelligence, your voice.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#contact" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-slate-500">&copy; 2026 TweetAgent. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="https://x.com/tweetagent" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://github.com/tweetagent" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
