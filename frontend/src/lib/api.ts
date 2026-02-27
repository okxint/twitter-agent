const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Auth
export async function register(data: {
  email: string;
  password: string;
  telegram_chat_id?: number;
}) {
  return request<{ token: string; user_id: number; email: string }>(
    "/register",
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function login(email: string, password: string) {
  return request<{ token: string; user_id: number; email: string }>(
    "/login",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
}

export async function getMe() {
  return request<{
    id: number;
    email: string;
    telegram_chat_id: number;
    topics: any[];
    active: boolean;
    created_at: string | null;
  }>("/me");
}

// Topics
export async function getTopics() {
  return request<{ topics: any[] }>("/topics");
}

export async function addTopic(data: {
  name: string;
  subreddits?: string[];
  tone?: string;
  hashtags?: string[];
}) {
  return request<{ topics: any[] }>("/topics", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeTopic(name: string) {
  return request<{ topics: any[] }>(`/topics/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}

// Tweets
export async function getPendingTweets() {
  return request<{ tweets: any[] }>("/tweets/pending");
}

export async function getTweetHistory(limit = 50) {
  return request<{ tweets: any[] }>(`/tweets/history?limit=${limit}`);
}

export async function approveTweet(tweetId: number) {
  return request<{ status: string }>(`/tweets/${tweetId}/approve`, {
    method: "POST",
  });
}

export async function rejectTweet(tweetId: number) {
  return request<{ status: string }>(`/tweets/${tweetId}/reject`, {
    method: "POST",
  });
}

export async function editTweet(tweetId: number, content: string) {
  return request<{ status: string }>(`/tweets/${tweetId}/edit`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

// Dashboard
export async function getDashboard() {
  return request<{ stats: { pending: number; posted: number; total_generated: number }; topics_count: number }>(
    "/dashboard"
  );
}

// Generate
export async function triggerGeneration() {
  return request<{ generated: number; message: string }>("/generate", {
    method: "POST",
  });
}

// Scrape
export async function triggerScrape() {
  return request<{ status: string; message: string }>("/scrape", {
    method: "POST",
  });
}

export async function getScrapeStatus() {
  return request<{ running: boolean; message: string; scraped: number }>("/scrape/status");
}

// Settings
export async function getSettings() {
  return request<{
    reddit_client_id: string;
    reddit_client_secret_set: boolean;
    twitter_api_key: string;
    twitter_api_secret_set: boolean;
    twitter_access_token: string;
    twitter_access_token_secret_set: boolean;
    telegram_chat_id: number;
  }>("/settings");
}

export async function updateSettings(data: {
  reddit_client_id?: string;
  reddit_client_secret?: string;
  twitter_api_key?: string;
  twitter_api_secret?: string;
  twitter_access_token?: string;
  twitter_access_token_secret?: string;
  telegram_chat_id?: number;
}) {
  return request<{ status: string; fields: string[] }>("/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
