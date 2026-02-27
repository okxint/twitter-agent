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
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scraping, setScraping] = useState(false);
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
      const res = await triggerGeneration();
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
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const msgStyles = {
    error: "bg-red-50 border-red-100 text-red-700",
    success: "bg-green-50 border-green-100 text-green-700",
    info: "bg-indigo-50 border-indigo-100 text-indigo-700",
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Your tweet pipeline at a glance</p>
        </div>
        <div className="flex items-center gap-3">
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
                Generate Tweets
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status message */}
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${msgStyles[messageType]}`}>
          {scraping && (
            <span className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin shrink-0" />
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

      {/* Pending Tweets */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Pending Review
            {tweets.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                {tweets.length}
              </span>
            )}
          </h2>
        </div>
        {tweets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No pending tweets</p>
            <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
              Add topics, scrape trending content, then generate AI-powered tweets to review here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tweets.map((tweet) => (
              <TweetCard
                key={tweet.id}
                id={tweet.id}
                topic={tweet.topic}
                content={tweet.content}
                status={tweet.status}
                createdAt={tweet.created_at}
                onAction={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
