"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getSettings, updateSettings } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    reddit_client_id: "",
    reddit_client_secret: "",
    twitter_api_key: "",
    twitter_api_secret: "",
    twitter_access_token: "",
    twitter_access_token_secret: "",
    telegram_chat_id: "",
  });
  const [secretsSet, setSecretsSet] = useState({
    reddit_client_secret: false,
    twitter_api_secret: false,
    twitter_access_token_secret: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setForm({
        reddit_client_id: data.reddit_client_id || "",
        reddit_client_secret: "",
        twitter_api_key: data.twitter_api_key || "",
        twitter_api_secret: "",
        twitter_access_token: data.twitter_access_token || "",
        twitter_access_token_secret: "",
        telegram_chat_id: data.telegram_chat_id ? String(data.telegram_chat_id) : "",
      });
      setSecretsSet({
        reddit_client_secret: data.reddit_client_secret_set,
        twitter_api_secret: data.twitter_api_secret_set,
        twitter_access_token_secret: data.twitter_access_token_secret_set,
      });
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const data: any = {};
      if (form.reddit_client_id) data.reddit_client_id = form.reddit_client_id;
      if (form.reddit_client_secret) data.reddit_client_secret = form.reddit_client_secret;
      if (form.twitter_api_key) data.twitter_api_key = form.twitter_api_key;
      if (form.twitter_api_secret) data.twitter_api_secret = form.twitter_api_secret;
      if (form.twitter_access_token) data.twitter_access_token = form.twitter_access_token;
      if (form.twitter_access_token_secret) data.twitter_access_token_secret = form.twitter_access_token_secret;
      if (form.telegram_chat_id) data.telegram_chat_id = parseInt(form.telegram_chat_id);

      const res = await updateSettings(data);
      setMessage(`Settings updated: ${res.fields.join(", ")}`);
      setMessageType("success");
      if (form.reddit_client_secret) setSecretsSet(prev => ({ ...prev, reddit_client_secret: true }));
      if (form.twitter_api_secret) setSecretsSet(prev => ({ ...prev, twitter_api_secret: true }));
      if (form.twitter_access_token_secret) setSecretsSet(prev => ({ ...prev, twitter_access_token_secret: true }));
      setForm((prev) => ({
        ...prev,
        reddit_client_secret: "",
        twitter_api_secret: "",
        twitter_access_token_secret: "",
      }));
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const SetBadge = () => (
    <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-normal">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Set
    </span>
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-zinc-200 dark:border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-[13px] text-zinc-400 dark:text-zinc-500 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  const inputClass = "block w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-[13px] bg-white dark:bg-zinc-800/50";

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Settings</h1>
        <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">Manage your API credentials and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-[13px] font-medium border ${
            messageType === "error"
              ? "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400"
              : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          }`}>
            {messageType === "success" ? (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            )}
            {message}
          </div>
        )}

        {/* Reddit */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm6.066 13.234c.044.266.066.536.066.81 0 4.016-4.48 7.272-10.002 7.272-5.522 0-10.002-3.256-10.002-7.272 0-.274.022-.544.066-.81a1.773 1.773 0 01-.398-3.398 1.773 1.773 0 012.932-.618c1.452-1.046 3.456-1.716 5.69-1.79l1.07-5.022a.376.376 0 01.45-.292l3.51.748a1.266 1.266 0 012.394.586 1.266 1.266 0 01-1.742 1.172l-3.104-.66-.96 4.5c2.192.09 4.156.76 5.582 1.79a1.773 1.773 0 012.938.618 1.773 1.773 0 01-.398 3.398h-.092zM8.25 13.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zm7.5 0a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zM15.37 17c-.4.4-1.262.876-3.37.876s-2.97-.476-3.37-.876a.25.25 0 01.354-.354c.336.336 1.098.73 3.016.73s2.68-.394 3.016-.73a.25.25 0 01.354.354z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white">Reddit API</h3>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Optional — we auto-scrape without keys now</p>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">Client ID</label>
              <input type="text" value={form.reddit_client_id} onChange={update("reddit_client_id")} className={inputClass} placeholder="Your Reddit app client ID" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">
                Client Secret {secretsSet.reddit_client_secret && <SetBadge />}
              </label>
              <input type="password" value={form.reddit_client_secret} onChange={update("reddit_client_secret")} className={inputClass} placeholder={secretsSet.reddit_client_secret ? "Leave blank to keep current" : "Your Reddit app client secret"} />
            </div>
          </div>
        </div>

        {/* Twitter */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
                <svg className="w-4 h-4 text-white dark:text-zinc-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white">Twitter API v2</h3>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">For auto-posting (coming soon)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">API Key</label>
                <input type="text" value={form.twitter_api_key} onChange={update("twitter_api_key")} className={inputClass} placeholder="Consumer API key" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">
                  API Secret {secretsSet.twitter_api_secret && <SetBadge />}
                </label>
                <input type="password" value={form.twitter_api_secret} onChange={update("twitter_api_secret")} className={inputClass} placeholder={secretsSet.twitter_api_secret ? "Leave blank to keep" : "Consumer API secret"} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">Access Token</label>
                <input type="text" value={form.twitter_access_token} onChange={update("twitter_access_token")} className={inputClass} placeholder="Access token" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">
                  Access Token Secret {secretsSet.twitter_access_token_secret && <SetBadge />}
                </label>
                <input type="password" value={form.twitter_access_token_secret} onChange={update("twitter_access_token_secret")} className={inputClass} placeholder={secretsSet.twitter_access_token_secret ? "Leave blank to keep" : "Access token secret"} />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Get keys at{" "}
                <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer" className="underline font-medium text-zinc-600 dark:text-zinc-300">
                  developer.twitter.com
                </a>
                {" "}&mdash; free tier allows 1,500 tweets/month.
              </p>
            </div>
          </div>
        </div>

        {/* Telegram */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white">Telegram</h3>
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Optional notifications</p>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-600 dark:text-zinc-300 mb-1.5">Chat ID</label>
              <input type="text" value={form.telegram_chat_id} onChange={update("telegram_chat_id")} className={inputClass} placeholder="Your Telegram chat ID" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg text-[13px] font-semibold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-press"
        >
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </form>
    </div>
  );
}
