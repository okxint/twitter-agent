"use client";

import { useState, useCallback } from "react";
import { addTopic, removeTopic, suggestSubreddits } from "@/lib/api";

interface TopicManagerProps {
  topics: any[];
  onUpdate: () => void;
}

export default function TopicManager({ topics, onUpdate }: TopicManagerProps) {
  const [name, setName] = useState("");
  const [tone, setTone] = useState("informative");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestedSubs, setSuggestedSubs] = useState<string[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Debounced subreddit suggestion
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    setSuggestedSubs([]);

    if (debounceTimer) clearTimeout(debounceTimer);

    if (value.trim().length >= 2) {
      const timer = setTimeout(async () => {
        setLoadingSubs(true);
        try {
          const res = await suggestSubreddits(value.trim());
          setSuggestedSubs(res.subreddits);
        } catch {
          // silent fail
        } finally {
          setLoadingSubs(false);
        }
      }, 600);
      setDebounceTimer(timer);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await addTopic({ name: name.trim(), tone });
      setName("");
      setTone("informative");
      setSuggestedSubs([]);
      onUpdate();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (topicName: string) => {
    setLoading(true);
    setError("");
    try {
      await removeTopic(topicName);
      onUpdate();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toneOptions = [
    { value: "informative", label: "Informative", icon: "📚" },
    { value: "witty", label: "Witty", icon: "😏" },
    { value: "professional", label: "Professional", icon: "💼" },
    { value: "casual", label: "Casual", icon: "🤙" },
    { value: "provocative", label: "Provocative", icon: "🔥" },
  ];

  return (
    <div className="space-y-6">
      {/* Add topic form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Topic
          </h3>
          <p className="text-indigo-100 text-sm mt-1">Just type what you want to tweet about. We'll find the best Reddit sources automatically.</p>
        </div>
        <form onSubmit={handleAdd} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">What do you want to tweet about?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-gray-50/50 dark:bg-gray-700/50"
                placeholder="e.g., AI, Crypto, Startups, F1, Music..."
                required
              />
              {/* Auto-discovered subreddits preview */}
              {loadingSubs && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <span className="w-3 h-3 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
                  Finding best subreddits...
                </div>
              )}
              {suggestedSubs.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">We'll scrape from these subreddits:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedSubs.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium"
                      >
                        r/{sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tweet tone</label>
              <div className="grid grid-cols-5 gap-2">
                {toneOptions.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      tone === t.value
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                        : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-indigo-500/25"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Topic
                </>
              )}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </form>
      </div>

      {/* Topic list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Topics</h3>
          <span className="text-sm text-gray-400">{topics.length} total</span>
        </div>
        {topics.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No topics yet. Add one above to start generating tweets.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {topics.map((t: any) => {
              const topicName = typeof t === "string" ? t : t.name;
              const topicTone = typeof t === "string" ? "informative" : t.tone;
              const topicSubreddits = typeof t === "string" ? [] : (t.subreddits || []);
              return (
                <div key={topicName} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {topicName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{topicName}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400 capitalize">{topicTone}</span>
                        {topicSubreddits.length > 0 && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">·</span>
                            <span className="text-xs text-gray-400">{topicSubreddits.map((s: string) => `r/${s}`).join(", ")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(topicName)}
                    disabled={loading}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-all"
                    title="Remove topic"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
