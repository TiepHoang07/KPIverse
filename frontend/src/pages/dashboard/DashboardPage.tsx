import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ActivityFeed from "../../components/activity/ActivityFeed";
import {  TrendingUp } from "lucide-react";
import { navigationCards } from "../../constants/NavigationCards";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalKpis: 0,
    totalFriends: 0,
    totalGroups: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/kpis"), api.get("/friends"), api.get("/groups/my")])
      .then(([kpisRes, friendsRes, groupsRes]) => {
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
      <div className="flex h-48 items-center justify-center rounded-xl bg-card p-4 shadow-lg border border-border">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
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
          <h1 className="flex gap-4 text-3xl font-bold text-foreground">
            Dashboard <TrendingUp className="h-8 w-8 text-primary" />
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back! Here's your overview
          </p>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
          <p className="text-sm font-medium text-blue-400">Total KPIs</p>
          <p className="text-2xl font-bold text-blue-300">{stats.totalKpis}</p>
        </div>
        <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4">
          <p className="text-sm font-medium text-purple-400">Friends</p>
          <p className="text-2xl font-bold text-purple-300">
            {stats.totalFriends}
          </p>
        </div>
        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
          <p className="text-sm font-medium text-green-400">Groups</p>
          <p className="text-2xl font-bold text-green-300">
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
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-card w-full h-50 p-6 text-left border border-border transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
            >
              {/* Background Gradient on Hover */}
              <div
                className={`absolute inset-0 bg-linear-to-r ${card.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
              />

              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`rounded-xl bg-primary/10 p-3 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`h-6 w-6 text-primary`} />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {card.title}
                    </h2>
                  </div>

                  <p className="mb-4 text-sm text-muted-foreground">
                    {card.description}
                  </p>

                  {card.stats !== null && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-2xl font-bold text-primary`}
                      >
                        {card.stats}
                      </span>
                      <span className="text-xs text-muted-foreground">
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
        <h2 className="mb-4 pt-4 text-xl font-bold text-foreground">
          Recent Activities
        </h2>
        <ActivityFeed />
      </div>
    </div>
  );
}
