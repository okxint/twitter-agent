"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  isLoggedIn,
  getDashboard,
  getPendingTweets,
  triggerGeneration,
  triggerScrape,
  getScrapeStatus,
} from "@/lib/api";
import StatsCards from "@/components/StatsCards";
import TweetCard from "@/components/TweetCard";

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="skeleton w-14 h-5" />
        <div className="skeleton w-20 h-4 ml-auto" />
      </div>
      <div className="space-y-2">
        <div className="skeleton w-full h-4" />
        <div className="skeleton w-4/5 h-4" />
        <div className="skeleton w-3/5 h-4" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="skeleton w-16 h-7" />
        <div className="skeleton w-14 h-7" />
      </div>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4">
          <div className="flex justify-between mb-3">
            <div className="skeleton w-16 h-3" />
            <div className="skeleton w-7 h-7 rounded-lg" />
          </div>
          <div className="skeleton w-12 h-7" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ pending: 0, posted: 0, total_generated: 0 });
  const [topicsCount, setTopicsCount] = useState(0);
  const [analytics, setAnalytics] = useState<{
    tweets_by_topic: Record<string, number>;
    tweets_by_day: Record<string, number>;
    approval_rate: number;
  }>({ tweets_by_topic: {}, tweets_by_day: {}, approval_rate: 0 });
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [humanize, setHumanize] = useState(true);
  const [threadMode, setThreadMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    loadData();
    checkScrapeStatus();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [router]);

  const loadData = async () => {
    try {
      const [dashData, tweetData] = await Promise.all([
        getDashboard(),
        getPendingTweets(),
      ]);
      setStats(dashData.stats);
      setTopicsCount(dashData.topics_count);
      if (dashData.analytics) setAnalytics(dashData.analytics);
      setTweets(tweetData.tweets);
    } catch {
      // handled by api client (401 redirect)
    } finally {
      setLoading(false);
    }
  };

  const checkScrapeStatus = async () => {
    try {
      const status = await getScrapeStatus();
      if (status.running) {
        setScraping(true);
        setStatusMessage(status.message);
        setMessageType("info");
        startPolling();
      }
    } catch {
      // ignore
    }
  };

  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const status = await getScrapeStatus();
        setStatusMessage(status.message);
        if (!status.running) {
          setScraping(false);
          setMessageType(status.scraped > 0 ? "success" : "error");
          if (pollRef.current) clearInterval(pollRef.current);
          await loadData();
        }
      } catch {
        setScraping(false);
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 3000);
  };

  const handleScrape = async () => {
    setScraping(true);
    setStatusMessage("");
    try {
      const res = await triggerScrape();
      setStatusMessage(res.message);
      setMessageType("info");
      startPolling();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
      setMessageType("error");
      setScraping(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setStatusMessage("");
    try {
      const res = await triggerGeneration({ humanize, thread_mode: threadMode });
      setStatusMessage(res.message);
      setMessageType("success");
      await loadData();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
      setMessageType("error");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="skeleton w-32 h-7 mb-2" />
            <div className="skeleton w-48 h-4" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton w-28 h-10 rounded-xl" />
            <div className="skeleton w-32 h-10 rounded-xl" />
          </div>
        </div>
        <SkeletonStats />
        <div className="mt-8 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const msgStyles = {
    error: "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400",
    success: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    info: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">Your tweet pipeline at a glance</p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Toggles */}
          <div className="hidden sm:flex items-center gap-3 mr-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" checked={humanize} onChange={() => setHumanize(!humanize)} />
                <div className="w-8 h-[18px] bg-zinc-200 dark:bg-zinc-700 peer-checked:bg-indigo-500 rounded-full transition-colors" />
                <div className="absolute left-[3px] top-[3px] w-3 h-3 bg-white rounded-full peer-checked:translate-x-[14px] transition-transform shadow-sm" />
              </div>
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Humanize</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" checked={threadMode} onChange={() => setThreadMode(!threadMode)} />
                <div className="w-8 h-[18px] bg-zinc-200 dark:bg-zinc-700 peer-checked:bg-violet-500 rounded-full transition-colors" />
                <div className="absolute left-[3px] top-[3px] w-3 h-3 bg-white rounded-full peer-checked:translate-x-[14px] transition-transform shadow-sm" />
              </div>
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Threads</span>
            </label>
          </div>

          <button
            onClick={handleScrape}
            disabled={scraping}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 transition-all btn-press"
          >
            {scraping ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Scrape Reddit
              </>
            )}
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || scraping}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-all btn-press"
          >
            {generating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                {threadMode ? "Generate Thread" : "Generate Tweets"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status message */}
      {statusMessage && (
        <div className={`mb-6 p-3.5 rounded-lg text-[13px] font-medium border flex items-center gap-2.5 ${msgStyles[messageType]}`}>
          {scraping && (
            <span className="w-3.5 h-3.5 border-2 border-indigo-300 dark:border-indigo-600 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin shrink-0" />
          )}
          {messageType === "success" && (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          )}
          {messageType === "error" && (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          )}
          {statusMessage}
        </div>
      )}

      {/* Stats */}
      <StatsCards
        pending={stats.pending}
        posted={stats.posted}
        totalGenerated={stats.total_generated}
        topicsCount={topicsCount}
      />

      {/* Analytics */}
      {(Object.keys(analytics.tweets_by_topic).length > 0 || Object.keys(analytics.tweets_by_day).length > 0) && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Approval Rate */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-5">
            <h3 className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">Approval Rate</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#approval-grad)" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${analytics.approval_rate * 3.14} 314`}
                  />
                  <defs>
                    <linearGradient id="approval-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-zinc-900 dark:text-white">{analytics.approval_rate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tweets by Day */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-5">
            <h3 className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">Last 7 Days</h3>
            <div className="flex items-end gap-1 h-20">
              {(() => {
                const days = Object.entries(analytics.tweets_by_day);
                const maxVal = Math.max(...days.map(([, v]) => v), 1);
                return days.map(([day, count]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300">{count}</span>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-indigo-500 to-violet-400 transition-all"
                      style={{ height: `${(count / maxVal) * 100}%`, minHeight: 3 }}
                    />
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500">{day.slice(5)}</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Topics Breakdown */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-5">
            <h3 className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">By Topic</h3>
            <div className="space-y-2.5">
              {(() => {
                const topics = Object.entries(analytics.tweets_by_topic);
                const maxVal = Math.max(...topics.map(([, v]) => v), 1);
                return topics.slice(0, 5).map(([topic, count]) => (
                  <div key={topic}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium text-zinc-600 dark:text-zinc-300 truncate">{topic}</span>
                      <span className="text-zinc-400 dark:text-zinc-500 tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                        style={{ width: `${(count / maxVal) * 100}%` }}
                      />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Pending Tweets */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            Your Tweets
            {tweets.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
                {tweets.length}
              </span>
            )}
          </h2>
        </div>
        {tweets.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">No tweets yet</p>
            <p className="text-[13px] text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed mb-5">
              Get started in three steps:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-[13px]">
              <Link href="/dashboard/topics" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                Add topics
              </Link>
              <span className="text-zinc-300 dark:text-zinc-600 hidden sm:block">&rarr;</span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                Scrape Reddit
              </span>
              <span className="text-zinc-300 dark:text-zinc-600 hidden sm:block">&rarr;</span>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                Generate Tweets
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tweets.map((tweet) => {
              const threadTotal = tweet.thread_id
                ? tweets.filter((t: any) => t.thread_id === tweet.thread_id).length
                : undefined;
              return (
                <div
                  key={tweet.id}
                  className={tweet.thread_id && tweet.thread_position > 1 ? "ml-5 border-l-2 border-violet-200 dark:border-violet-500/20 pl-4" : ""}
                >
                  <TweetCard
                    id={tweet.id}
                    topic={tweet.topic}
                    content={tweet.content}
                    status={tweet.status}
                    createdAt={tweet.created_at}
                    threadId={tweet.thread_id}
                    threadPosition={tweet.thread_position}
                    threadTotal={threadTotal}
                    onAction={loadData}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
