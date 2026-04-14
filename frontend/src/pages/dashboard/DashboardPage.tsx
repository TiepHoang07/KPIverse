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
    <div className="mx-6 space-y-12 pb-12 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-4 text-4xl font-extrabold tracking-tight text-primary">
            Overview <TrendingUp className="h-10 w-10 text-secondary" />
          </h1>
          <p className="mt-2 text-lg text-muted-foreground font-medium">
            Ready for your next milestone?
          </p>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all hover:-translate-y-1 border border-border/50">
          <div className="absolute top-0 right-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-primary/5 transition-transform group-hover:scale-110" />
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Total KPIs</p>
          <p className="mt-2 text-4xl font-black text-primary">{stats.totalKpis}</p>
        </div>
        <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all hover:-translate-y-1 border border-border/50">
          <div className="absolute top-0 right-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-secondary/5 transition-transform group-hover:scale-110" />
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Connections</p>
          <p className="mt-2 text-4xl font-black text-secondary">
            {stats.totalFriends}
          </p>
        </div>
        <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all hover:-translate-y-1 border border-border/50">
          <div className="absolute top-0 right-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-primary/5 transition-transform group-hover:scale-110" />
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Groups</p>
          <p className="mt-2 text-4xl font-black text-primary">
            {stats.totalGroups}
          </p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {cardsWithStats.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.path}
                onClick={() => navigate(card.path)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl bg-card p-6 text-left border border-border/60 transition-all duration-500 hover:-translate-y-2 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10"
              >
                {/* Background Gradient on Hover */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${card.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
                />

                <div className="relative z-10">
                  <div className="mb-6 flex animate-in items-center justify-between">
                    <div
                      className="rounded-2xl bg-accent p-4 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    >
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>

                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {card.description}
                  </p>

                  {card.stats !== null && (
                    <div className="flex items-center gap-3">
                      <span
                        className="text-3xl font-black tracking-tighter text-primary"
                      >
                        {card.stats}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">
                        {card.statLabel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Decorative bar */}
                <div
                  className={`absolute bottom-0 left-0 h-1.5 w-0 bg-linear-to-r ${card.gradient} transition-all duration-700 ease-out group-hover:w-full`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="rounded-[2.5rem] bg-accent/50 p-10 border border-white">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black text-primary">
            Feed
          </h2>
          <button className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            View All
          </button>
        </div>
        <ActivityFeed />
      </div>
    </div>
  );
}
