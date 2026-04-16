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
        <div className="text-muted-foreground/50 bg-primary/10 border-border rounded-xl border border-dashed py-8 text-center text-sm italic">
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
                  ? "border-red-300 bg-red-50"
                  : u.rank === 2
                    ? "border-orange-300 bg-orange-50"
                    : u.rank === 3
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-border bg-primary/20"
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
                    `https://ui-avatars.com/api/?name=${u.name}&background=2E4057&color=fff`
                  }
                  alt={u.name}
                  className="ring-primary/20 h-10 w-10 shrink-0 rounded-full object-cover ring-2"
                />

                <span className="text-foreground text-sm font-bold">
                  {u.name}
                </span>
              </div>

              <span
                className={`w-12 rounded-full py-3 text-center text-sm font-bold ${
                  u.rank === 1
                    ? "bg-white text-red-500"
                    : u.rank === 2
                      ? "bg-white text-orange-500"
                      : u.rank === 3
                        ? "bg-white text-yellow-500"
                        : "bg-primary/20 text-primary"
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
