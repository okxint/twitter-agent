"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getTweetHistory } from "@/lib/api";

export default function HistoryPage() {
  const router = useRouter();
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    loadHistory();
  }, [router]);

  const loadHistory = async () => {
    try {
      const data = await getTweetHistory(100);
      setTweets(data.tweets);
    } catch {
      // handled by api client
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-zinc-200 dark:border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-[13px] text-zinc-400 dark:text-zinc-500 font-medium">Loading history...</p>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    posted: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    approved: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
    rejected: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
    pending: { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Tweet History</h1>
        <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">All your generated tweets and their status</p>
      </div>

      {tweets.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-10 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">No tweet history yet</p>
          <p className="mt-1.5 text-[13px] text-zinc-400 dark:text-zinc-500">Your generated and posted tweets will appear here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Content</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Topic</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {tweets.map((tweet) => {
                  const sc = statusConfig[tweet.status] || statusConfig.pending;
                  return (
                    <tr key={tweet.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3.5 max-w-md">
                        <p className="text-sm text-zinc-700 dark:text-zinc-200 line-clamp-2">{tweet.content}</p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {tweet.topic}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {tweet.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-[12px] text-zinc-400 dark:text-zinc-500">
                        {tweet.created_at
                          ? new Date(tweet.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden divide-y divide-zinc-50 dark:divide-zinc-800">
            {tweets.map((tweet) => {
              const sc = statusConfig[tweet.status] || statusConfig.pending;
              return (
                <div key={tweet.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {tweet.topic}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {tweet.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-200 line-clamp-3">{tweet.content}</p>
                  <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                    {tweet.created_at
                      ? new Date(tweet.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "-"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
