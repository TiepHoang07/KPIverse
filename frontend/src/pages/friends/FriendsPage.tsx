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
import { TrendingUp, Search, UserPlus } from "lucide-react";
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
    <div className="mx-auto max-w-4xl space-y-8 pb-20 px-4">
      <div className="flex items-center justify-between pt-8">
        <h1 className="text-4xl font-bold text-foreground">Friends</h1>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <TrendingUp size={20} />
        </div>
      </div>

      {/* Search Section */}
      <div className="rounded-3xl bg-card p-8 shadow-2xl border border-border relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>

        <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
          Find New Friends
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group/input">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors" />
            <input
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full rounded-2xl border border-border bg-secondary/30 px-4 py-4 pl-12 text-foreground placeholder:text-muted-foreground/20 focus:border-primary/50 focus:ring-1 focus:ring-primary focus:outline-none transition-all"
            />
          </div>
          <button
            onClick={search}
            disabled={searching || !query.trim()}
            className="cursor-pointer rounded-2xl bg-primary px-8 py-4 font-bold uppercase tracking-widest text-xs text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-30 shadow-lg shadow-primary/20 w-full sm:w-auto hover:-translate-y-0.5"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Search Results */}
        <div className="mt-8">
          {searching ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary"></div>
            </div>
          ) : hasSearched ? (
            results.length === 0 ? (
              <div className="rounded-2xl bg-secondary/10 py-12 text-center border border-dashed border-border">
                <p className="text-muted-foreground font-medium italic">
                  No users found matching "{query}"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 inline-block mb-2">
                  Found {results.length} potentials
                </p>
                {results.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/20 p-5 transition-all hover:bg-secondary/40 hover:border-primary/30 group/item"
                  >
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                      <div className="relative">
                        <img
                          src={
                            u.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${u.name}&background=3b82f6&color=fff&size=128`
                          }
                          alt={u.name}
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20 transition-transform group-hover/item:scale-105"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-foreground">{u.name}</p>
                        <p className="text-sm font-medium text-muted-foreground/60">{u.email}</p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto mt-2 sm:mt-0">
                      {u.friendshipStatus === "YOU" && (
                        <span className="inline-flex rounded-xl bg-cyan-500/10 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
                          It's You
                        </span>
                      )}
                      {u.friendshipStatus === "NONE" && (
                        <button
                          onClick={() => sendRequest(u.id)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:-translate-y-0.5"
                        >
                          <UserPlus size={16} />
                          Add Friend
                        </button>
                      )}
                      {u.friendshipStatus === "PENDING_SENT" && (
                        <span className="inline-flex rounded-xl bg-yellow-500/10 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-yellow-400 border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                          Request Sent
                        </span>
                      )}
                      {u.friendshipStatus === "PENDING_RECEIVED" && (
                        <span className="inline-flex rounded-xl bg-primary/10 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary border border-primary/20 shadow-lg shadow-primary/5">
                          Pending Approval
                        </span>
                      )}
                      {u.friendshipStatus === "FRIENDS" && (
                        <span className="inline-flex rounded-xl bg-green-500/10 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-green-400 border border-green-500/20 shadow-lg shadow-green-500/5">
                          Friends
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : query.trim() ? (
            <div className="rounded-2xl bg-secondary/10 py-12 text-center border border-border border-dashed">
              <p className="text-muted-foreground font-medium italic">
                Press Enter or click Search to find users
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Friend Requests Section */}
        <div className="rounded-3xl bg-card p-8 shadow-2xl border border-border h-full flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
              Pending Invites
            </h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-bold border border-primary/20">
              {friendRequests.length}
            </span>
          </div>

          <div className="flex-1">
            {friendRequests.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground/40 font-medium bg-secondary/10 rounded-2xl border border-dashed border-border h-full flex flex-col items-center justify-center">
                <p className="italic">No pending invites</p>
              </div>
            ) : (
              <div className="space-y-4">
                {friendRequests.map((f) => (
                  <div
                    key={f.id}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/20 p-5 transition-all hover:border-primary/20"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          f.requesterUser?.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${f.requesterUser?.name || 'User'}&background=3b82f6&color=fff&size=128`
                        }
                        alt={f.requesterUser?.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/10"
                      />
                      <div className="text-center sm:text-left">
                        <p className="font-bold text-foreground">
                          {f.requesterUser?.name}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground/60 truncate max-w-[150px]">
                          {f.requesterUser?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleRespond(f.id, "ACCEPTED")}
                        className="flex-1 sm:flex-none cursor-pointer rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-green-400 transition-all hover:bg-green-500 hover:text-white"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespond(f.id, "REJECTED")}
                        className="flex-1 sm:flex-none cursor-pointer rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-destructive transition-all hover:bg-destructive hover:text-white"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Friends List Section */}
        <div className="rounded-3xl bg-card p-8 shadow-2xl border border-border h-full flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
              Connections
            </h2>
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400 font-bold border border-green-500/20">
              {friends.length}
            </span>
          </div>

          <div className="flex-1">
            {friends.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground/40 font-medium bg-secondary/10 rounded-2xl border border-dashed border-border h-full flex flex-col items-center justify-center">
                <p className="italic">No friends added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {friends.map((f) => (
                  <div
                    key={f.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/20 p-5 transition-all hover:border-primary/20 group/friend"
                  >
                    <div className="flex items-center gap-4 overflow-hidden w-full sm:w-auto">
                      <img
                        src={
                          f.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${f.name}&background=3b82f6&color=fff&size=128`
                        }
                        alt={f.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/10 transition-transform"
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-foreground truncate">{f.name}</p>
                        {f.friendSince && (
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                            Since {new Date(f.friendSince).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="w-full sm:w-auto mt-2 sm:mt-0">
                      <button
                        onClick={() => handleDelete(f.id, f.name)}
                        className="w-full sm:w-auto cursor-pointer rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-destructive transition-all hover:bg-destructive hover:text-white focus:opacity-100"
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
      </div>
    </div>
  );
}
