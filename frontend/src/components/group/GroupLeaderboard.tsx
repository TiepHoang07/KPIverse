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
    return null;
  };

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Leaderboard</h2>
      <div className="flex justify-between px-2 text-sm font-semibold text-gray-700">
        <span>Rank & Name</span>
        <span>Completed</span>
      </div>

      {loading && <div className="text-sm text-gray-400">Loading...</div>}

      {!loading && users.length === 0 && (
        <div className="text-sm text-gray-400">No logs yet for this KPI</div>
      )}

      {!loading && users.length > 0 && (
        <ul className="space-y-3">
          {users.map((u) => (
            <li
              key={u.userId}
              className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 transition hover:bg-gray-100"
            >
              <div className="flex items-center gap-6">
                <span className="w-6 text-center text-xl">
                  {getMedal(u.rank) || u.rank}
                </span>

                <img
                  src={
                    u.avatarUrl || "https://ui-avatars.com/api/?name=" + u.name
                  }
                  alt={u.name}
                  className="h-8 w-8 rounded-full object-cover"
                />

                <span className="text-sm font-medium">{u.name}</span>
              </div>

              <span className="mr-3 text-sm font-semibold">{u.logs}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
