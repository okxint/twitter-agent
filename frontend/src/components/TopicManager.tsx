"use client";

import { useState, useEffect } from "react";
import { addTopic, removeTopic, suggestSubreddits, getTopicCategories } from "@/lib/api";

interface TopicManagerProps {
  topics: any[];
  onUpdate: () => void;
}

export default function TopicManager({ topics, onUpdate }: TopicManagerProps) {
  const [name, setName] = useState("");
  const [customSubs, setCustomSubs] = useState("");
  const [showCustomSubs, setShowCustomSubs] = useState(false);
  const [tone, setTone] = useState("informative");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestedSubs, setSuggestedSubs] = useState<string[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [showPicker, setShowPicker] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getTopicCategories()
      .then((res) => setCategories(res.categories))
      .catch(() => {});
  }, []);

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
        } catch {}
        setLoadingSubs(false);
      }, 600);
      setDebounceTimer(timer);
    }
  };

  const selectFromPicker = (topicName: string) => {
    setName(topicName);
    setShowPicker(false);
    handleNameChange(topicName);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    try {
      const extraSubs = customSubs
        .split(",")
        .map((s) => s.trim().replace(/^r\//, ""))
        .filter(Boolean);
      await addTopic({ name: name.trim(), subreddits: extraSubs, tone });
      setName("");
      setCustomSubs("");
      setShowCustomSubs(false);
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
    { value: "informative", label: "Informative" },
    { value: "witty", label: "Witty" },
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "provocative", label: "Provocative" },
  ];

  const existingNames = new Set(
    topics.map((t: any) => (typeof t === "string" ? t : t.name).toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Add topic form */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Topic
          </h3>
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">Pick a topic or type your own. We find the best Reddit sources automatically.</p>
        </div>
        <form onSubmit={handleAdd} className="p-5">
          <div className="space-y-4">
            {/* Topic input + browse */}
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">What do you want to tweet about?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="block flex-1 px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-[13px] bg-white dark:bg-zinc-800/50"
                  placeholder="e.g., AI, Crypto, Startups, F1..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPicker(!showPicker)}
                  className="px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all whitespace-nowrap"
                >
                  {showPicker ? "Close" : "Browse"}
                </button>
              </div>

              {/* Category picker */}
              {showPicker && Object.keys(categories).length > 0 && (
                <div className="mt-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 max-h-72 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-800/30">
                  {Object.entries(categories).map(([group, topicList]) => (
                    <div key={group} className="mb-3.5 last:mb-0">
                      <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">{group}</p>
                      <div className="flex flex-wrap gap-1">
                        {topicList.map((t) => {
                          const isAdded = existingNames.has(t.toLowerCase());
                          return (
                            <button
                              key={t}
                              type="button"
                              disabled={isAdded}
                              onClick={() => selectFromPicker(t)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                isAdded
                                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default border border-emerald-200 dark:border-emerald-800"
                                  : name === t
                                  ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-600"
                                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                              }`}
                            >
                              {isAdded ? `\u2713 ${t}` : t}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Auto-discovered subreddits */}
              {loadingSubs && (
                <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400">
                  <span className="w-3 h-3 border-2 border-zinc-300 dark:border-zinc-600 border-t-indigo-500 rounded-full animate-spin" />
                  Finding best subreddits...
                </div>
              )}
              {suggestedSubs.length > 0 && (
                <div className="mt-2">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">We&apos;ll scrape from:</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestedSubs.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-medium"
                      >
                        r/{sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Custom subreddits */}
            <div>
              <button
                type="button"
                onClick={() => setShowCustomSubs(!showCustomSubs)}
                className="text-[11px] text-indigo-500 font-medium hover:text-indigo-600 transition-colors"
              >
                {showCustomSubs ? "- Hide custom subreddits" : "+ Add specific subreddits (optional)"}
              </button>
              {showCustomSubs && (
                <div className="mt-1.5">
                  <input
                    type="text"
                    value={customSubs}
                    onChange={(e) => setCustomSubs(e.target.value)}
                    className="block w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-[13px] bg-white dark:bg-zinc-800/50"
                    placeholder="e.g., LocalLLaMA, StableDiffusion, ClaudeAI"
                  />
                  <p className="mt-1 text-[11px] text-zinc-400">Comma-separated. Added alongside our auto-discovered ones.</p>
                </div>
              )}
            </div>

            {/* Tone */}
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">Tweet tone</label>
              <div className="flex flex-wrap gap-1.5">
                {toneOptions.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className={`px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all ${
                      tone === t.value
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-all btn-press"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Add Topic
                </>
              )}
            </button>
            {error && <p className="text-[12px] text-red-500">{error}</p>}
          </div>
        </form>
      </div>

      {/* Topic list */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white">Your Topics</h3>
          <span className="text-[12px] text-zinc-400 tabular-nums">{topics.length} total</span>
        </div>
        {topics.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-10 h-10 mx-auto rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400">No topics yet. Browse categories or type your own above.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {topics.map((t: any) => {
              const topicName = typeof t === "string" ? t : t.name;
              const topicTone = typeof t === "string" ? "informative" : t.tone;
              const topicSubreddits = typeof t === "string" ? [] : (t.subreddits || []);
              return (
                <div key={topicName} className="px-5 py-3.5 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                      {topicName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-zinc-900 dark:text-white">{topicName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-zinc-400 capitalize">{topicTone}</span>
                        {topicSubreddits.length > 0 && (
                          <>
                            <span className="text-zinc-300 dark:text-zinc-700">&middot;</span>
                            <span className="text-[11px] text-zinc-400 truncate">{topicSubreddits.map((s: string) => `r/${s}`).join(", ")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(topicName)}
                    disabled={loading}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-all shrink-0"
                    title="Remove topic"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
