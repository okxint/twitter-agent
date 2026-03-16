"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const msgStyles = {
    error: "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400",
    success: "bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-700 dark:text-green-400",
    info: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400",
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Your tweet pipeline at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggles */}
          <div className="hidden sm:flex items-center gap-4 mr-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" checked={humanize} onChange={() => setHumanize(!humanize)} />
                <div className="w-9 h-5 bg-gray-200 dark:bg-slate-700 peer-checked:bg-indigo-500 rounded-full transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Humanize</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" checked={threadMode} onChange={() => setThreadMode(!threadMode)} />
                <div className="w-9 h-5 bg-gray-200 dark:bg-slate-700 peer-checked:bg-purple-500 rounded-full transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Threads</span>
            </label>
          </div>

          <button
            onClick={handleScrape}
            disabled={scraping}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 transition-all shadow-sm hover:shadow-lg hover:shadow-purple-500/20"
          >
            {scraping ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Scrape Reddit
              </>
            )}
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || scraping}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 disabled:opacity-50 transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-500/20"
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                {threadMode ? "Generate Thread" : "Generate Tweets"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status message */}
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${msgStyles[messageType]}`}>
          {scraping && (
            <span className="w-4 h-4 border-2 border-indigo-300 dark:border-indigo-600 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin shrink-0" />
          )}
          {messageType === "success" && (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {messageType === "error" && (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Approval Rate */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-4">Approval Rate</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" className="dark:stroke-slate-800" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#approval-grad)" strokeWidth="10"
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
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{analytics.approval_rate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tweets by Day */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-4">Last 7 Days</h3>
            <div className="flex items-end gap-1 h-24">
              {(() => {
                const days = Object.entries(analytics.tweets_by_day);
                const maxVal = Math.max(...days.map(([, v]) => v), 1);
                return days.map(([day, count]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{count}</span>
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-purple-400 transition-all"
                      style={{ height: `${(count / maxVal) * 100}%`, minHeight: 4 }}
                    />
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">{day.slice(5)}</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Topics Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-4">By Topic</h3>
            <div className="space-y-3">
              {(() => {
                const topics = Object.entries(analytics.tweets_by_topic);
                const maxVal = Math.max(...topics.map(([, v]) => v), 1);
                return topics.slice(0, 5).map(([topic, count]) => (
                  <div key={topic}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 dark:text-slate-300 truncate">{topic}</span>
                      <span className="text-gray-400 dark:text-slate-500">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
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
      <div className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Your Tweets
            {tweets.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold">
                {tweets.length}
              </span>
            )}
          </h2>
        </div>
        {tweets.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-slate-400 font-medium">No tweets yet</p>
            <p className="mt-2 text-sm text-gray-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
              1. Add topics  2. Hit "Scrape Reddit"  3. Hit "Generate Tweets"  — then copy your favorites!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tweets.map((tweet) => {
              const threadTotal = tweet.thread_id
                ? tweets.filter((t: any) => t.thread_id === tweet.thread_id).length
                : undefined;
              return (
                <div
                  key={tweet.id}
                  className={tweet.thread_id && tweet.thread_position > 1 ? "ml-6 border-l-2 border-purple-200 dark:border-purple-500/30 pl-4" : ""}
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
