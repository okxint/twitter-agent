"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/api";
import { useTheme } from "@/lib/theme";

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const resolvedCurrent = theme === "system"
      ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    setTheme(resolvedCurrent === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    if (isLoggedIn()) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 relative">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 w-full z-50 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            tweet<span className="text-indigo-500">agent</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">How it works</a>
            <a href="#features" className="text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-[13px] font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                )}
              </svg>
              <span className="hidden sm:inline">{theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "Light" : "Dark"}</span>
            </button>
            <Link href="/login" className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/register"
              className="text-[13px] font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.06] rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/[0.03] dark:bg-violet-500/[0.05] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
          {/* Pill */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 mb-8">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Auto-posting to Twitter coming soon</span>
          </div>

          <h1 className="animate-fade-in-up delay-100 text-[2.75rem] md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
            Reddit trends,
            <br />
            <span className="gradient-text-hero">your tweets.</span>
          </h1>

          <p className="animate-fade-in-up delay-200 mt-6 text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Pick topics you care about. We find what&apos;s blowing up on Reddit and
            turn it into tweets that sound like you wrote them.
          </p>

          <div className="animate-fade-in-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all text-[15px] btn-press"
            >
              Generate your first tweet free
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-zinc-600 dark:text-zinc-300 font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-[15px]"
            >
              See how it works
            </a>
          </div>

          {/* Open source badge */}
          <div className="animate-fade-in-up delay-500 mt-10 flex items-center justify-center">
            <a
              href="https://github.com/okxint/twitter-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
              Open source on GitHub
            </a>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="animate-fade-in-up delay-600 relative z-10 max-w-4xl mx-auto mt-16 px-5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 via-transparent to-transparent z-10 pointer-events-none h-full" />
            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-black/30">
              <div className="bg-zinc-50 dark:bg-zinc-900 p-1">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  </div>
                  <div className="flex-1 h-5 bg-white dark:bg-zinc-800 rounded-md ml-3" />
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-950 p-5">
                {/* Mock stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Ready to Use", val: "12", accent: "text-amber-500" },
                    { label: "Saved", val: "847", accent: "text-emerald-500" },
                    { label: "Generated", val: "2.4K", accent: "text-indigo-500" },
                    { label: "Topics", val: "8", accent: "text-violet-500" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                      <div className={`text-lg font-bold ${s.accent}`}>{s.val}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Mock tweet cards */}
                <div className="space-y-2.5">
                  {[
                    { topic: "AI", text: "Most people building with LLMs are solving the wrong problem. The bottleneck isn't the model — it's the evaluation loop." },
                    { topic: "Crypto", text: "ETH L2s are quietly doing what Solana promised. Nobody's paying attention because the narrative moved on." },
                  ].map((t, i) => (
                    <div key={i} className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">{t.topic}</span>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{t.text}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <div className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-medium rounded-md">Copy</div>
                        <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium rounded-md">Edit</div>
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
      <section id="how" className="py-24 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Three steps. Zero effort.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "1",
                title: "Pick your topics",
                desc: "Choose from 70+ categories or type your own. We auto-discover the best subreddits.",
                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>,
              },
              {
                num: "2",
                title: "We scrape & analyze",
                desc: "Trending Reddit posts scored by virality — upvotes, comments, discussion quality.",
                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
              },
              {
                num: "3",
                title: "Copy your tweets",
                desc: "AI generates original tweets from the insights. Edit if you want, then copy and post.",
                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
              },
            ].map((step) => (
              <div key={step.num} className="relative p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-extrabold text-zinc-200 dark:text-zinc-800">{step.num}</span>
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">{step.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Everything you need to stay relevant
            </h2>
            <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
              From finding what&apos;s trending to generating content that gets engagement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "Smart Reddit Discovery",
                desc: "Auto-finds the best subreddits for your topics. Posts ranked by a virality score based on engagement patterns.",
                accent: "bg-violet-50 dark:bg-violet-500/10 text-violet-500",
                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
              },
              {
                title: "AI Tweet Generation",
                desc: "Reads the actual discussions — not just titles. Generates original takes that capture the real insight.",
                accent: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500",
                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
              },
              {
                title: "Humanize Pass",
                desc: "A second AI pass strips out anything that sounds robotic. The result reads like you wrote it at 2am.",
                accent: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500",
                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>,
              },
              {
                title: "Thread Mode",
                desc: "Generate multi-tweet threads with proper hooks, development, and takeaways. Numbered and ready to post.",
                accent: "bg-amber-50 dark:bg-amber-500/10 text-amber-500",
                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>,
              },
              {
                title: "Tone Control",
                desc: "Informative, witty, provocative, casual, professional — set the vibe per topic.",
                accent: "bg-rose-50 dark:bg-rose-500/10 text-rose-500",
                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>,
              },
              {
                title: "70+ Topic Categories",
                desc: "AI, Crypto, Gaming, Sports, Music, Business — browse and pick like Reddit's own signup flow.",
                accent: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500",
                icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>,
              },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
                <div className={`w-9 h-9 rounded-lg ${f.accent} flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Simple pricing. No surprises.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Pro */}
            <div className="relative p-7 rounded-xl border-2 border-indigo-500 dark:border-indigo-400 bg-white dark:bg-zinc-900/50 shadow-lg shadow-indigo-500/5">
              <div className="absolute -top-3 left-6 px-3 py-0.5 bg-indigo-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wider">
                Most popular
              </div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">Pro</h3>
                <div className="text-right">
                  <span className="text-3xl font-extrabold">$15</span>
                  <span className="text-sm text-zinc-400">/mo</span>
                </div>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Everything you need to build a consistent Twitter presence.</p>
              <Link
                href="/register"
                className="block w-full text-center py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-all"
              >
                Get started
              </Link>
              <ul className="mt-6 space-y-2.5">
                {["Unlimited topics", "50 tweets per generation", "Automated daily scraping", "AI tweet generation + humanize", "Thread generation", "Tone control per topic", "Tweet editing & copying", "Analytics dashboard"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                    <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Custom */}
            <div className="p-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">Custom</h3>
                <span className="text-3xl font-extrabold">Let&apos;s talk</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">For teams, agencies, or anyone who needs more. We&apos;ll build a plan around your workflow.</p>
              <a
                href="mailto:cashmein.eth@gmail.com"
                className="block w-full text-center py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                Contact us
              </a>
              <ul className="mt-6 space-y-2.5 flex-1">
                {["Everything in Pro", "Custom topic limits", "Dedicated support", "API access", "White-label options", "Custom integrations"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-5">
            Stop staring at a blank tweet box.
          </h2>
          <p className="text-base text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
            Let Reddit do the research. Let AI do the writing. You just hit copy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all text-[15px] btn-press"
            >
              Generate your first tweet free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <a
              href="https://github.com/okxint/twitter-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-zinc-600 dark:text-zinc-300 font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-[15px]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
              Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800/60 py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-zinc-900 dark:text-white">tweet<span className="text-indigo-500">agent</span></span>
            <span className="text-xs text-zinc-400">Reddit trends. AI tweets. Your voice.</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="https://github.com/okxint/twitter-agent" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
            </a>
            <a href="https://x.com/tweetagent" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <span className="text-xs text-zinc-400">&copy; 2026 TweetAgent</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
