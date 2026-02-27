"use client";

import { useState } from "react";
import { approveTweet, rejectTweet, editTweet } from "@/lib/api";

interface TweetCardProps {
  id: number;
  topic: string;
  content: string;
  status: string;
  createdAt: string | null;
  onAction?: () => void;
}

export default function TweetCard({ id, topic, content, status, createdAt, onAction }: TweetCardProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          {topic}
        </span>
        <span className="text-xs text-gray-400 font-medium">
          {createdAt ? new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
        </span>
      </div>

      {editing ? (
        <div className="relative">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl p-4 text-gray-900 text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none bg-gray-50/50"
            maxLength={280}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-1.5 py-0.5 rounded">
            {charCount}/280
          </div>
        </div>
      ) : (
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        {!editing && (
          <span className={`text-xs font-medium ${charCount > 280 ? "text-red-500" : "text-gray-400"}`}>
            {charCount} chars
          </span>
        )}

        {status === "pending" && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all shadow-sm hover:shadow-md hover:shadow-green-500/20"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
            <button
              onClick={handleEdit}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {editing ? "Save" : "Edit"}
            </button>
            {editing && (
              <button
                onClick={() => { setEditing(false); setEditContent(content); }}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleReject}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-100">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
