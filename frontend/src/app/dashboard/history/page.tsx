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
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading history...</p>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    posted: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    approved: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    rejected: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Tweet History</h1>
        <p className="mt-1 text-sm text-gray-500">All your generated tweets and their status</p>
      </div>

      {tweets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No tweet history yet</p>
          <p className="mt-2 text-sm text-gray-400">Your generated and posted tweets will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Card list for mobile, table for desktop */}
          <div className="hidden md:block">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tweets.map((tweet) => {
                  const sc = statusConfig[tweet.status] || statusConfig.pending;
                  return (
                    <tr key={tweet.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 max-w-md">
                        <p className="text-sm text-gray-800 line-clamp-2">{tweet.content}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
                          {tweet.topic}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {tweet.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
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
          <div className="md:hidden divide-y divide-gray-50">
            {tweets.map((tweet) => {
              const sc = statusConfig[tweet.status] || statusConfig.pending;
              return (
                <div key={tweet.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
                      {tweet.topic}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {tweet.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 line-clamp-3">{tweet.content}</p>
                  <p className="mt-2 text-xs text-gray-400">
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
