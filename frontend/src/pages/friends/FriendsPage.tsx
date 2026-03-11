import { useEffect, useState } from "react";
import {
  getFriends,
  getFriendRequests,
  searchUsers,
  sendFriendRequest,
  respondFriendRequests,
  DeleteFriend,
  getFriendRequestsSent,
} from "../../api/friend";
import toast from "react-hot-toast";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [friendRequestsSent, setFriendRequestsSent] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fix: Store these as functions, not useEffect variables
  const fetchFriends = () => {
    getFriends().then((res) => setFriends(res.data));
  };

  const fetchFriendRequests = () => {
    getFriendRequests().then((res) => setFriendRequests(res.data));
  };

  const fetchFriendRequestsSent = () => {
    getFriendRequestsSent().then((res) => setFriendRequestsSent(res.data));
  };

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
    fetchFriendRequestsSent();
  }, []);

  const search = async () => {
  if (!query.trim()) {
    setResults([]);
    setHasSearched(false);
    return;
  }

  setSearching(true);
  setHasSearched(true);

  try {
    const res = await searchUsers(query);
    
    // Enhance results with local friend status check
    const enhancedResults = res.data.map((user: any) => {
      // Check if user is already in friends list
      const isFriend = friends.some(f => f.id === user.id);
      
      // Check if there's a pending request FROM this user (incoming)
      const hasIncomingRequest = friendRequests.some(
        req => req.requesterUser?.id === user.id
      );
      
      // Check if there's a pending request TO this user (outgoing)
      // You need to check your sent requests for this
      const hasOutgoingRequest = friendRequestsSent.some(
        req => req.receiverUser?.id === user.id
      );
      
      if (isFriend) {
        return { ...user, friendshipStatus: "FRIENDS" };
      } else if (hasIncomingRequest) {
        return { ...user, friendshipStatus: "PENDING_RECEIVED" };
      } else if (hasOutgoingRequest) {
        return { ...user, friendshipStatus: "PENDING_SENT" };
      }
      
      return { ...user, friendshipStatus: user.friendshipStatus || "NONE" };
    });
    
    setResults(enhancedResults);
  } catch (error) {
    console.error("Search failed:", error);
    setResults([]);
  } finally {
    setSearching(false);
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      search();
    }
  };

  const sendRequest = async (receiverId: number) => {
    try {
      await sendFriendRequest(receiverId);
      toast.success("Friend request sent!");
      // Update local state to show pending
      setResults(prev =>
        prev.map(user =>
          user.id === receiverId
            ? { ...user, friendshipStatus: "PENDING_SENT" }
            : user
        )
      );
      fetchFriendRequests(); // Refresh requests
    } catch (error) {
      toast.error("Error: " + error);
    }
  };

  const handleRespond = async (
    friendId: number,
    action: "ACCEPTED" | "REJECTED",
  ) => {
    try {
      await respondFriendRequests(friendId, action);
      toast.success(`Friend request ${action.toLowerCase()}`);
      
      if (action === "ACCEPTED") {
        fetchFriends(); // Refresh friends list
      }
      fetchFriendRequests(); // Refresh requests
      
      // Refresh search results if any
      if (hasSearched) {
        search();
      }
    } catch (error) {
      toast.error("Failed to process request");
    }
  };

  const handleDelete = async (friendId: number, friendName: string) => {
    const confirmed = window.confirm(
      `Do you really want to remove ${friendName} from your friends?`,
    );

    if (!confirmed) return;

    try {
      await DeleteFriend(friendId);
      setFriends((prevFriends) => prevFriends.filter((f) => f.id !== friendId));
      
      // Refresh search results if any
      if (hasSearched) {
        search();
      }
    } catch (error) {
      console.error("Failed to delete friend:", error);
      toast.error("Failed to remove friend. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="ml-6 text-3xl font-bold text-gray-900">Friends</h1>

      {/* Search Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Find Friends
        </h2>
        <div className="flex gap-3">
          <input
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
          <button
            onClick={search}
            disabled={searching || !query.trim()}
            className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Search Results */}
        <div className="mt-6">
          {searching ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            </div>
          ) : hasSearched ? (
            results.length === 0 ? (
              <div className="rounded-lg bg-gray-50 py-8 text-center">
                <p className="text-gray-500">
                  No users found matching "{query}"
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Found {results.length} users
                </p>
                {results.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4 transition hover:border-gray-200 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          u.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${u.name}&background=3b82f6&color=fff&size=128`
                        }
                        alt={u.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>

                    <div>
                      {u.friendshipStatus === "YOU" && (
                        <span className="inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-800">
                          You
                        </span>
                      )}
                      {u.friendshipStatus === "NONE" && (
                        <button
                          onClick={() => sendRequest(u.id)}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          Add Friend
                        </button>
                      )}
                      {u.friendshipStatus === "PENDING_SENT" && (
                        <span className="inline-flex rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800">
                          Request Sent
                        </span>
                      )}
                      {u.friendshipStatus === "PENDING_RECEIVED" && (
                        <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                          Pending Approval
                        </span>
                      )}
                      {u.friendshipStatus === "FRIENDS" && (
                        <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
                          Friends
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : query.trim() ? (
            <div className="rounded-lg bg-gray-50 py-8 text-center">
              <p className="text-gray-500">
                Press Enter or click Search to find users
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Friend Requests Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Friend Requests{" "}
          <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-sm text-blue-800">
            {friendRequests.length}
          </span>
        </h2>
        {friendRequests.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No pending friend requests
          </p>
        ) : (
          <div className="space-y-3">
            {friendRequests.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      f.requesterUser?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${f.requesterUser?.name || 'User'}&background=3b82f6&color=fff&size=128`
                    }
                    alt={f.requesterUser?.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {f.requesterUser?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {f.requesterUser?.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(f.id, "ACCEPTED")}
                    className="cursor-pointer rounded-lg border border-green-400 bg-green-50 px-4 py-2 text-sm font-medium text-green-500 transition hover:bg-green-100"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(f.id, "REJECTED")}
                    className="cursor-pointer rounded-lg border border-red-400 bg-red-50 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friends List Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          My Friends{" "}
          <span className="ml-2 rounded-full bg-green-100 px-2.5 py-0.5 text-sm text-green-800">
            {friends.length}
          </span>
        </h2>
        {friends.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            You don't have any friends yet
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {friends.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 p-4 transition hover:border-gray-200 hover:shadow-sm w-full"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      f.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${f.name}&background=3b82f6&color=fff&size=128`
                    }
                    alt={f.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{f.name}</p>
                    {f.friendSince && (
                      <p className="text-xs text-gray-500">
                        Friends since{" "}
                        {new Date(f.friendSince).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => handleDelete(f.id, f.name)}
                    className="cursor-pointer rounded-lg border border-red-400 bg-red-50 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}