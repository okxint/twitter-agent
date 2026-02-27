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
      // Update secrets set state
      if (form.reddit_client_secret) setSecretsSet(prev => ({ ...prev, reddit_client_secret: true }));
      if (form.twitter_api_secret) setSecretsSet(prev => ({ ...prev, twitter_api_secret: true }));
      if (form.twitter_access_token_secret) setSecretsSet(prev => ({ ...prev, twitter_access_token_secret: true }));
      // Clear secret fields
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
    <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 font-normal">
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
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your API credentials and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium border ${
            messageType === "error"
              ? "bg-red-50 border-red-100 text-red-700"
              : "bg-green-50 border-green-100 text-green-700"
          }`}>
            {messageType === "success" ? (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {message}
          </div>
        )}

        {/* Reddit section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm6.066 13.234c.044.266.066.536.066.81 0 4.016-4.48 7.272-10.002 7.272-5.522 0-10.002-3.256-10.002-7.272 0-.274.022-.544.066-.81a1.773 1.773 0 01-.398-3.398 1.773 1.773 0 012.932-.618c1.452-1.046 3.456-1.716 5.69-1.79l1.07-5.022a.376.376 0 01.45-.292l3.51.748a1.266 1.266 0 012.394.586 1.266 1.266 0 01-1.742 1.172l-3.104-.66-.96 4.5c2.192.09 4.156.76 5.582 1.79a1.773 1.773 0 012.938.618 1.773 1.773 0 01-.398 3.398h-.092zM8.25 13.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zm7.5 0a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zM15.37 17c-.4.4-1.262.876-3.37.876s-2.97-.476-3.37-.876a.25.25 0 01.354-.354c.336.336 1.098.73 3.016.73s2.68-.394 3.016-.73a.25.25 0 01.354.354z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reddit API</h3>
                <p className="text-sm text-gray-500">Required for scraping trending content</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Client ID</label>
              <input
                type="text"
                value={form.reddit_client_id}
                onChange={update("reddit_client_id")}
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-gray-50/50"
                placeholder="Your Reddit app client ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Client Secret
                {secretsSet.reddit_client_secret && <SetBadge />}
              </label>
              <input
                type="password"
                value={form.reddit_client_secret}
                onChange={update("reddit_client_secret")}
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-gray-50/50"
                placeholder={secretsSet.reddit_client_secret ? "Leave blank to keep current" : "Your Reddit app client secret"}
              />
            </div>

            <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100">
              <p className="text-xs text-orange-700">
                Get your Reddit API credentials at{" "}
                <a href="https://www.reddit.com/prefs/apps" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                  reddit.com/prefs/apps
                </a>
                {" "}&mdash; create a &quot;script&quot; type app.
              </p>
            </div>
          </div>
        </div>

        {/* Twitter API section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Twitter API v2</h3>
                <p className="text-sm text-gray-500">Required for auto-posting tweets</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">API Key</label>
                <input
                  type="text"
                  value={form.twitter_api_key}
                  onChange={update("twitter_api_key")}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-gray-50/50"
                  placeholder="Consumer API key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  API Secret
                  {secretsSet.twitter_api_secret && <SetBadge />}
                </label>
                <input
                  type="password"
                  value={form.twitter_api_secret}
                  onChange={update("twitter_api_secret")}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-gray-50/50"
                  placeholder={secretsSet.twitter_api_secret ? "Leave blank to keep" : "Consumer API secret"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Access Token</label>
                <input
                  type="text"
                  value={form.twitter_access_token}
                  onChange={update("twitter_access_token")}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-gray-50/50"
                  placeholder="Access token"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Access Token Secret
                  {secretsSet.twitter_access_token_secret && <SetBadge />}
                </label>
                <input
                  type="password"
                  value={form.twitter_access_token_secret}
                  onChange={update("twitter_access_token_secret")}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-gray-50/50"
                  placeholder={secretsSet.twitter_access_token_secret ? "Leave blank to keep" : "Access token secret"}
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-xs text-gray-600">
                Get your Twitter API keys at{" "}
                <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                  developer.twitter.com
                </a>
                {" "}&mdash; free tier allows 1,500 tweets/month.
              </p>
            </div>
          </div>
        </div>

        {/* Telegram section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Telegram</h3>
                <p className="text-sm text-gray-500">Optional notifications</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Chat ID</label>
              <input
                type="text"
                value={form.telegram_chat_id}
                onChange={update("telegram_chat_id")}
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm bg-gray-50/50"
                placeholder="Your Telegram chat ID"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-indigo-500/25"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </form>

      {/* How it works */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How it works
          </h3>
          <div className="space-y-4">
            {[
              { step: "1", title: "Add API Keys", desc: "Add your Reddit and Twitter API credentials above" },
              { step: "2", title: "Add Topics", desc: "Go to Topics and add what you want to tweet about with subreddits" },
              { step: "3", title: "Scrape Reddit", desc: "Click Scrape Reddit on Dashboard to find trending content" },
              { step: "4", title: "Generate", desc: "Click Generate to create AI-powered tweets from Reddit insights" },
              { step: "5", title: "Review & Post", desc: "Approve tweets and they auto-post via Twitter API" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
