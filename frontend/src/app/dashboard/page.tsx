"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  isLoggedIn,
  getDashboard,
  getPendingTweets,
} from "@/lib/api";
import StatsCards from "@/components/StatsCards";
import TweetCard from "@/components/TweetCard";

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

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    loadData();
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="skeleton w-32 h-7 mb-2" />
          <div className="skeleton w-48 h-4" />
        </div>
        <SkeletonStats />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">Your tweet pipeline at a glance</p>
        </div>
        <Link
          href="/dashboard/topics"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg text-white bg-indigo-500 hover:bg-indigo-600 transition-all btn-press"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Generate Tweets
        </Link>
      </div>

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
            Pending Tweets
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
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">No pending tweets</p>
            <p className="text-[13px] text-zinc-400 dark:text-zinc-500 mb-4">Go to Topics to scrape Reddit and generate tweets.</p>
            <Link
              href="/dashboard/topics"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg text-white bg-indigo-500 hover:bg-indigo-600 transition-all btn-press"
            >
              Go to Topics
            </Link>
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
