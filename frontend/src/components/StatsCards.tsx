"use client";

interface StatsCardsProps {
  pending: number;
  posted: number;
  totalGenerated: number;
  topicsCount: number;
}

const cards = [
  {
    key: "pending",
    label: "Ready to Use",
    accent: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/8",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "posted",
    label: "Saved",
    accent: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/8",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    key: "totalGenerated",
    label: "Generated",
    accent: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/8",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    key: "topicsCount",
    label: "Topics",
    accent: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-500/8",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
];

export default function StatsCards({ pending, posted, totalGenerated, topicsCount }: StatsCardsProps) {
  const values: Record<string, number> = { pending, posted, totalGenerated, topicsCount };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{card.label}</p>
            <div className={`w-7 h-7 rounded-lg ${card.bg} ${card.accent} flex items-center justify-center`}>
              {card.icon}
            </div>
          </div>
          <p className={`text-2xl font-bold ${card.accent}`}>
            {values[card.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
