import { useEffect, useState } from "react";
import { getFriends, searchUsers, sendFriendRequest } from "../../api/friend";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Track if search was performed

  useEffect(() => {
    getFriends().then((res) => setFriends(res.data));
  }, []);

  const search = async () => {
    // Validate input
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false); // Reset search state
      return;
    }

    setSearching(true);
    setHasSearched(true); // Mark that a search was performed

    try {
      const res = await searchUsers(query);
      setResults(res.data);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-xl font-bold">Friends</h1>

      <div className="flex gap-2">
        <input
          placeholder="Search user by name, email, or ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          onClick={search}
          disabled={searching || !query.trim()}
          className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white disabled:bg-blue-300"
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </div>

      <div>
        {searching ? (
          <div className="text-center py-4 text-gray-500">Loading...</div>
        ) : hasSearched ? (
          results.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No users found matching "{query}"
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2 border rounded relative"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={
                        u.avatarUrl || "https://ui-avatars.com/api/?name=" + u.name
                      }
                      alt={u.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  
                  {u.friendshipStatus === 'NONE' && (
                    <button
                      onClick={() => sendFriendRequest(u.id)}
                      className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Add Friend
                    </button>
                  )}
                  {u.friendshipStatus === 'PENDING_SENT' && (
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
                      Request Sent
                    </span>
                  )}
                  {u.friendshipStatus === 'PENDING_RECEIVED' && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">
                      Pending Approval
                    </span>
                  )}
                  {u.friendshipStatus === 'FRIENDS' && (
                    <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded">
                      Friends
                    </span>
                  )}
                </div>
              ))}
            </div>
          )
        ) : query.trim() ? (
          <div className="text-center py-4 text-gray-500">
            Press Enter or click Search to find users
          </div>
        ) : null}
      </div>

      <div>
        <h2 className="font-semibold mb-2">My Friends ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="text-gray-500">You don't have any friends yet</p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f.id} className="flex items-center space-x-2 p-2 border rounded">
                <img
                  src={f.avatarUrl || "https://ui-avatars.com/api/?name=" + f.name}
                  alt={f.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span>{f.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}