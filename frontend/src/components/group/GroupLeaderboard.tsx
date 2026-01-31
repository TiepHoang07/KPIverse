import { useEffect, useState } from 'react';
import { getGroupLeaderboard } from '../../api/group';

export default function GroupLeaderboard({ groupId }: { groupId: number }) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    getGroupLeaderboard(groupId).then(res => setUsers(res.data));
  }, [groupId]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-3">Leaderboard</h2>
      <ul className="space-y-2">
        {users.map((u, i) => (
          <li key={u.userId} className="flex justify-between">
            <span>{i + 1}. {u.name}</span>
            <span className="font-semibold">{u.points}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
