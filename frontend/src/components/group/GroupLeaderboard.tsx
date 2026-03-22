import { useEffect, useState } from "react";
import { getKpiLeaderboard } from "../../api/group";

type LeaderboardUser = {
  rank: number;
  userId: number;
  name: string;
  avatarUrl?: string;
  logs: number;
};

export default function GroupLeaderboard({
  groupId,
  kpiId,
}: {
  groupId: number;
  kpiId: number;
}) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !kpiId) return;

    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await getKpiLeaderboard(groupId, kpiId);
        setUsers(res.data);
      } catch (err) {
        console.error("Leaderboard error:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [groupId, kpiId]);

  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  if (loading) {
    return (
      <div className="bg-card border-border flex h-48 items-center justify-center rounded-2xl border p-4 shadow-xl">
        <div className="border-border border-t-primary h-8 w-8 animate-spin rounded-full border-4"></div>
      </div>
    );
  }

  return (
    <div className="bg-card border-border w-full rounded-2xl border p-6 shadow-xl">
      <h2 className="text-foreground mb-6 text-xl font-bold">Leaderboard</h2>
      <div className="text-muted-foreground/60 mb-4 flex justify-between px-4 text-xs font-bold tracking-widest uppercase">
        <span>Rank & Name</span>
        <span>Completed</span>
      </div>

      {!loading && users.length === 0 && (
        <div className="text-muted-foreground/50 bg-secondary/10 border-border rounded-xl border border-dashed py-8 text-center text-sm italic">
          No logs yet for this KPI
        </div>
      )}

      {!loading && users.length > 0 && (
        <ul className="space-y-1">
          {users.map((u) => (
            <li
              key={u.userId}
              className={`flex items-center justify-between rounded-xl border-[1.5px] px-4 py-3 transition-all hover:scale-[1.01] ${
                u.rank === 1
                  ? "border-orange-600/30 bg-orange-500/5"
                  : u.rank === 2
                    ? "border-yellow-500/30 bg-yellow-400/5"
                    : u.rank === 3
                      ? "border-cyan-600/30 bg-cyan-600/5"
                      : "border-border bg-secondary/20"
              }`}
            >
              <div className="flex items-center gap-6">
                <span
                  className={`w-6 text-center ${u.rank >= 4 ? "text-md" : "text-xl"}`}
                >
                  {getMedal(u.rank) || u.rank}
                </span>

                <img
                  src={
                    u.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${u.name}&background=3b82f6&color=fff`
                  }
                  alt={u.name}
                  className="ring-primary/20 h-10 w-10 rounded-full object-cover ring-2"
                />

                <span className="text-foreground text-sm font-bold">
                  {u.name}
                </span>
              </div>

              <span
                className={`w-12 rounded-lg py-1.5 text-center text-sm font-bold shadow-sm ${
                  u.rank === 1
                    ? "bg-orange-600/20 text-orange-500"
                    : u.rank === 2
                      ? "bg-yellow-500/20 text-yellow-400"
                      : u.rank === 3
                        ? "bg-cyan-600/20 text-cyan-500"
                        : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                {u.logs}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
