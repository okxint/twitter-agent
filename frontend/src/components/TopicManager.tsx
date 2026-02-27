"use client";

import { useState } from "react";
import { addTopic, removeTopic } from "@/lib/api";

interface TopicManagerProps {
  topics: any[];
  onUpdate: () => void;
}

export default function TopicManager({ topics, onUpdate }: TopicManagerProps) {
  const [name, setName] = useState("");
  const [subreddits, setSubreddits] = useState("");
  const [tone, setTone] = useState("informative");
  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");
    try {
      await addTopic({
        name: name.trim(),
        subreddits: subreddits
          .split(",")
          .map((s) => s.trim().replace(/^r\//, ""))
          .filter(Boolean),
        tone,
        hashtags: hashtags
          .split(",")
          .map((h) => h.trim())
          .filter(Boolean),
      });
      setName("");
      setSubreddits("");
      setTone("informative");
      setHashtags("");
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Topic
          </h3>
        </div>
        <form onSubmit={handleAdd} className="p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-gray-50/50"
                placeholder="e.g., AI & Machine Learning"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subreddits <span className="text-gray-400 font-normal">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={subreddits}
                onChange={(e) => setSubreddits(e.target.value)}
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-gray-50/50"
                placeholder="e.g., MachineLearning, LocalLLaMA, artificial"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tone</label>
              <div className="grid grid-cols-5 gap-2">
                {toneOptions.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      tone === t.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Hashtags <span className="text-gray-400 font-normal">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-gray-50/50"
                placeholder="e.g., #AI, #MachineLearning"
              />
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Your Topics</h3>
          <span className="text-sm text-gray-400">{topics.length} total</span>
        </div>
        {topics.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No topics yet. Add one above to start generating tweets.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {topics.map((t: any) => {
              const topicName = typeof t === "string" ? t : t.name;
              const topicTone = typeof t === "string" ? "informative" : t.tone;
              const topicSubreddits = typeof t === "string" ? [] : (t.subreddits || []);
              const topicHashtags = typeof t === "string" ? [] : (t.hashtags || []);
              return (
                <div key={topicName} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {topicName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{topicName}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400 capitalize">{topicTone}</span>
                        {topicSubreddits.length > 0 && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-gray-400">{topicSubreddits.map((s: string) => `r/${s}`).join(", ")}</span>
                          </>
                        )}
                        {topicHashtags.length > 0 && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs text-gray-400">{topicHashtags.join(", ")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(topicName)}
                    disabled={loading}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 transition-all"
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
