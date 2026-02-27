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
    label: "Pending Review",
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "posted",
    label: "Posted",
    gradient: "from-green-500 to-emerald-500",
    bgLight: "bg-green-50",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    key: "totalGenerated",
    label: "Generated",
    gradient: "from-indigo-500 to-purple-500",
    bgLight: "bg-indigo-50",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    key: "topicsCount",
    label: "Topics",
    gradient: "from-purple-500 to-pink-500",
    bgLight: "bg-purple-50",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
];

export default function StatsCards({ pending, posted, totalGenerated, topicsCount }: StatsCardsProps) {
  const values: Record<string, number> = { pending, posted, totalGenerated, topicsCount };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
        >
          {/* Gradient accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">{values[card.key]}</p>
            </div>
            <div className={`${card.bgLight} p-3 rounded-xl`}>
              <span className={`bg-gradient-to-br ${card.gradient} bg-clip-text text-transparent`}>
                {card.icon}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
