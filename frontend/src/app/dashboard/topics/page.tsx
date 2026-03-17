"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getTopics } from "@/lib/api";
import TopicManager from "@/components/TopicManager";

export default function TopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    loadTopics();
  }, [router]);

  const loadTopics = async () => {
    try {
      const data = await getTopics();
      setTopics(data.topics);
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
          <p className="text-[13px] text-zinc-400 dark:text-zinc-500 font-medium">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Topics</h1>
        <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">Define what you want to tweet about. We&apos;ll find the best content.</p>
      </div>
      <TopicManager topics={topics} onUpdate={loadTopics} />
    </div>
  );
}
