import { useEffect, useState } from 'react';
import { getFriends, searchUsers, sendFriendRequest } from '../../api/friend';

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    getFriends().then(res => setFriends(res.data));
  }, []);

  const search = async () => {
    const res = await searchUsers(query);
    setResults(res.data);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Friends</h1>

      <input
        placeholder="Search user..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <button onClick={search} className="text-indigo-600">
        Search
      </button>

      <div>
        {results.map(u => (
          <div key={u.id} className="flex justify-between">
            <span>{u.name}</span>
            <button
              onClick={() => sendFriendRequest(u.id)}
              className="text-sm text-indigo-600"
            >
              Add
            </button>
          </div>
        ))}
      </div>

      <h2 className="font-semibold">My Friends</h2>
      {friends.map(f => (
        <div key={f.id}>{f.name}</div>
      ))}
    </div>
  );
}
