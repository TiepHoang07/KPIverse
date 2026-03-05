import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ActivityFeed from "../../components/activity/ActivityFeed";
import {  TrendingUp } from "lucide-react";
import { navigationCards } from "../../constants/NavigationCards";

type KPI = {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  tasks: {
    id: number;
    name: string;
  }[];
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [stats, setStats] = useState({
    totalKpis: 0,
    totalFriends: 0,
    totalGroups: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/kpis"), api.get("/friends"), api.get("/groups/my")])
      .then(([kpisRes, friendsRes, groupsRes]) => {
        setKpis(kpisRes.data);
        setStats({
          totalKpis: kpisRes.data.length,
          totalFriends: friendsRes.data.length,
          totalGroups: groupsRes.data.length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-white p-4 shadow">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  const cardsWithStats = navigationCards.map((card) => {
    if (card.title === "KPIs") return { ...card, stats: stats.totalKpis };
    if (card.title === "Groups") return { ...card, stats: stats.totalGroups };
    if (card.title === "Friends") return { ...card, stats: stats.totalFriends };
    return card; // Profile card stays the same
  });

  return (
    <div className="mx-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex gap-4 text-3xl font-bold text-gray-900">
            Dashboard <TrendingUp className="h-8 w-8 text-blue-500" />
          </h1>
          <p className="mt-1 text-gray-500">
            Welcome back! Here's your overview
          </p>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-linear-to-br from-blue-50 to-blue-100 p-4">
          <p className="text-sm font-medium text-blue-600">Total KPIs</p>
          <p className="text-2xl font-bold text-blue-700">{stats.totalKpis}</p>
        </div>
        <div className="rounded-xl bg-linear-to-br from-purple-50 to-purple-100 p-4">
          <p className="text-sm font-medium text-purple-600">Friends</p>
          <p className="text-2xl font-bold text-purple-700">
            {stats.totalFriends}
          </p>
        </div>
        <div className="rounded-xl bg-linear-to-br from-green-50 to-green-100 p-4">
          <p className="text-sm font-medium text-green-600">Groups</p>
          <p className="text-2xl font-bold text-green-700">
            {stats.totalGroups}
          </p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {cardsWithStats.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.path}
              onClick={() => navigate(card.path)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-6 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Background Gradient on Hover */}
              <div
                className={`absolute inset-0 bg-linear-to-r ${card.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
              />

              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`rounded-xl bg-${card.color}-100 p-3 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`h-6 w-6 text-${card.color}-600`} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {card.title}
                    </h2>
                  </div>

                  <p className="mb-4 text-sm text-gray-500">
                    {card.description}
                  </p>

                  {card.stats !== null && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-2xl font-bold text-${card.color}-600`}
                      >
                        {card.stats}
                      </span>
                      <span className="text-xs text-gray-400">
                        {card.statLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative element */}
              <div
                className={`absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r ${card.gradient} transition-all duration-500 group-hover:w-full`}
              />
            </button>
          );
        })}
      </div>

      {/* Activity Feed */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Recent Activity
        </h2>
        <ActivityFeed />
      </div>
    </div>
  );
}
