"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  isLoggedIn,
  getTopics,
  getPendingTweets,
  triggerGeneration,
  triggerScrape,
  getScrapeStatus,
} from "@/lib/api";
import TopicManager from "@/components/TopicManager";
import TweetCard from "@/components/TweetCard";

export default function TopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<any[]>([]);
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
    loadAll();
    checkScrapeStatus();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [router]);

  const loadAll = async () => {
    try {
      const [topicData, tweetData] = await Promise.all([
        getTopics(),
        getPendingTweets(),
      ]);
      setTopics(topicData.topics);
      setTweets(tweetData.tweets);
    } catch {
      // handled by api client
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
          await loadAll();
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
      await loadAll();
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
          <div className="w-7 h-7 border-2 border-zinc-200 dark:border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-[13px] text-zinc-400 dark:text-zinc-500 font-medium">Loading topics...</p>
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Topics</h1>
        <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">Define what you want to tweet about. We&apos;ll find the best content.</p>
      </div>

      <TopicManager topics={topics} onUpdate={loadAll} />

      {/* Generate section — only show when topics exist */}
      {topics.length > 0 && (
        <div className="mt-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Generate Tweets
            </h3>
            <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">Scrape Reddit for trending content, then generate tweets from it.</p>
          </div>

          <div className="p-5">
            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" checked={humanize} onChange={() => setHumanize(!humanize)} />
                  <div className="w-8 h-[18px] bg-zinc-200 dark:bg-zinc-700 peer-checked:bg-indigo-500 rounded-full transition-colors" />
                  <div className="absolute left-[3px] top-[3px] w-3 h-3 bg-white rounded-full peer-checked:translate-x-[14px] transition-transform shadow-sm" />
                </div>
                <span className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400">Humanize</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" checked={threadMode} onChange={() => setThreadMode(!threadMode)} />
                  <div className="w-8 h-[18px] bg-zinc-200 dark:bg-zinc-700 peer-checked:bg-violet-500 rounded-full transition-colors" />
                  <div className="absolute left-[3px] top-[3px] w-3 h-3 bg-white rounded-full peer-checked:translate-x-[14px] transition-transform shadow-sm" />
                </div>
                <span className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400">Thread mode</span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
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
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Scrape first, then generate.</p>
            </div>

            {/* Status message */}
            {statusMessage && (
              <div className={`mt-4 p-3.5 rounded-lg text-[13px] font-medium border flex items-center gap-2.5 ${msgStyles[messageType]}`}>
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
          </div>
        </div>
      )}

      {/* Generated tweets */}
      {tweets.length > 0 && (
        <div className="mt-6">
          <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
            Your Tweets
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
              {tweets.length}
            </span>
          </h3>
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
                    onAction={loadAll}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
