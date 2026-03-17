"use client";

import { useState } from "react";
import { approveTweet, rejectTweet, editTweet, approveThread } from "@/lib/api";

interface TweetCardProps {
  id: number;
  topic: string;
  content: string;
  status: string;
  createdAt: string | null;
  threadId?: string | null;
  threadPosition?: number;
  threadTotal?: number;
  onAction?: () => void;
}

export default function TweetCard({ id, topic, content, status, createdAt, threadId, threadPosition, threadTotal, onAction }: TweetCardProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = editing ? editContent : content;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = async () => {
    setLoading(true);
    setError("");
    try {
      await approveTweet(id);
      onAction?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveThread = async () => {
    if (!threadId) return;
    setLoading(true);
    setError("");
    try {
      await approveThread(threadId);
      onAction?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError("");
    try {
      await rejectTweet(id);
      onAction?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editing) {
      setEditing(true);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await editTweet(id, editContent);
      setEditing(false);
      onAction?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const charCount = editing ? editContent.length : content.length;

  return (
    <div className="tweet-card bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            {topic}
          </span>
          {threadId && threadPosition && (
            <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
              {threadPosition}/{threadTotal || "?"}
            </span>
          )}
        </div>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
          {createdAt ? new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
        </span>
      </div>

      {/* Content */}
      {editing ? (
        <div className="relative">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg p-3.5 text-zinc-900 dark:text-white text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none bg-zinc-50/50 dark:bg-zinc-800/50"
            maxLength={280}
          />
          <div className="absolute bottom-2.5 right-2.5 text-[10px] text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded">
            {charCount}/280
          </div>
        </div>
      ) : (
        <p className="text-zinc-700 dark:text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      )}

      {/* Actions */}
      <div className="mt-3.5 flex items-center justify-between">
        {!editing && (
          <span className={`text-[11px] font-medium tabular-nums ${charCount > 280 ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"}`}>
            {charCount} chars
          </span>
        )}

        {status === "pending" && (
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Copy */}
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold rounded-lg transition-all btn-press ${
                copied
                  ? "text-white bg-emerald-500 animate-copy-success"
                  : "text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100"
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  Copy
                </>
              )}
            </button>

            {/* Edit */}
            <button
              onClick={handleEdit}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium rounded-lg text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              {editing ? "Save" : "Edit"}
            </button>

            {editing && (
              <button
                onClick={() => { setEditing(false); setEditContent(content); }}
                className="px-3 py-1.5 text-[12px] font-medium rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Cancel
              </button>
            )}

            {/* Post - Coming Soon */}
            <button
              disabled
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 cursor-not-allowed"
              title="Coming soon"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              Post
              <span className="px-1 py-0.5 rounded text-[9px] bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold leading-none">SOON</span>
            </button>

            {/* Dismiss */}
            <button
              onClick={handleReject}
              disabled={loading}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-all"
              title="Dismiss"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
          <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
