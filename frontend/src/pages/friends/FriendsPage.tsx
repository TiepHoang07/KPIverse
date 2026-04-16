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
import { TrendingUp, Search, UserPlus, Trash2 } from "lucide-react";
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
    <div className="mx-auto max-w-5xl space-y-12 pb-24 px-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">Connections</h1>
          <p className="mt-2 text-lg text-muted-foreground font-medium">Grow your cosmos of support</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
          <UserPlus size={24} className="text-white" />
        </div>
      </div>

      {/* Search Section */}
      <div className="rounded-[2.5rem] bg-white p-10 shadow-2xl border border-white relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary to-secondary opacity-50"></div>

        <h2 className="mb-8 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">
          Sync with Friends
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/30" />
            <input
              placeholder="Search by name or identity..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full rounded-[1.5rem] border border-border/40 bg-accent px-6 py-5 pl-14 text-primary font-medium placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
            />
          </div>
          <button
            onClick={search}
            disabled={searching || !query.trim()}
            className="cursor-pointer rounded-[1.5rem] bg-primary px-10 py-5 font-black uppercase tracking-[0.2em] text-[10px] text-white transition-all hover:bg-primary/95 hover:-translate-y-1 disabled:opacity-30 shadow-xl shadow-primary/20"
          >
            {searching ? "Searching..." : "Execute Search"}
          </button>
        </div>

        {/* Search Results */}
        <div className="mt-10">
          {searching ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-border/20 border-t-primary"></div>
            </div>
          ) : hasSearched ? (
            results.length === 0 ? (
              <div className="rounded-3xl bg-accent py-14 text-center border border-dashed border-border/40">
                <p className="text-muted-foreground font-bold italic opacity-40">
                  No voyagers found matching "{query}"
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary">
                    Matched {results.length} Profiles
                  </p>
                </div>
                {results.map((u) => (
                  <div
                    key={u.id}
                    className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-border/30 bg-white p-6 transition-all hover:shadow-xl hover:border-primary/20"
                  >
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                      <img
                        src={
                          u.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${u.name}&background=2E4057&color=fff&size=128`
                        }
                        alt={u.name}
                        className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-accent shadow-md transition-transform"
                      />
                      <div>
                        <p className="font-black text-xl text-primary tracking-tight">{u.name}</p>
                        <p className="text-sm font-bold text-muted-foreground/50 lowercase">{u.email}</p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto">
                      {u.friendshipStatus === "YOU" && (
                        <span className="inline-flex rounded-xl bg-primary/5 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-primary/40 border border-primary/10">
                          Your Identity
                        </span>
                      )}
                      {u.friendshipStatus === "NONE" && (
                        <button
                          onClick={() => sendRequest(u.id)}
                          className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-secondary px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-secondary/20 transition-all hover:bg-secondary/90 hover:-translate-y-1"
                        >
                          Send Invite
                        </button>
                      )}
                      {u.friendshipStatus === "PENDING_SENT" && (
                        <span className="inline-flex rounded-xl bg-secondary/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-secondary border border-secondary/20">
                          Active Request
                        </span>
                      )}
                      {u.friendshipStatus === "PENDING_RECEIVED" && (
                        <span className="inline-flex rounded-xl bg-primary/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                          Awaiting Approval
                        </span>
                      )}
                      {u.friendshipStatus === "FRIENDS" && (
                        <div className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 border border-primary/20">
                          <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">
                            Connected
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Friend Requests Section */}
        <div className="rounded-[2.5rem] bg-white p-10 shadow-2xl border border-white h-full flex flex-col">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">
              Inbound Requests
            </h2>
            <span className="rounded-xl bg-primary px-3 py-1.5 text-[10px] text-white font-black shadow-lg shadow-primary/20">
              {friendRequests.length}
            </span>
          </div>

          <div className="flex-1">
            {friendRequests.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground/30 font-bold bg-accent/40 rounded-3xl border border-dashed border-border/60 h-full flex flex-col items-center justify-center">
                <p className="italic">Silence in the cosmos</p>
              </div>
            ) : (
              <div className="space-y-6">
                {friendRequests.map((f) => (
                  <div
                    key={f.id}
                    className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-border/30 bg-accent/20 p-6 transition-all"
                  >
                    <div className="flex flex-col items-center gap-4 text-center">
                      <img
                        src={
                          f.requesterUser?.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${f.requesterUser?.name || 'User'}&background=2E4057&color=fff&size=128`
                        }
                        alt={f.requesterUser?.name}
                        className="h-20 w-20 shrink-0 rounded-[1.5rem] object-cover ring-4 ring-white shadow-xl"
                      />
                      <div>
                        <p className="font-black text-xl text-primary tracking-tight">
                          {f.requesterUser?.name}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground/40 lowercase">
                          {f.requesterUser?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 w-full">
                      <button
                        onClick={() => handleRespond(f.id, "ACCEPTED")}
                        className="flex-1 rounded-2xl bg-primary py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespond(f.id, "REJECTED")}
                        className="flex-1 rounded-2xl bg-destructive/10 py-4 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive hover:text-white transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Friends List Section */}
        <div className="rounded-[2.5rem] bg-white p-10 shadow-2xl border border-white h-full flex flex-col">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">
              Your Network
            </h2>
            <span className="rounded-xl bg-secondary px-3 py-1.5 text-[10px] text-white font-black shadow-lg shadow-secondary/20">
              {friends.length}
            </span>
          </div>

          <div className="flex-1">
            {friends.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground/30 font-bold bg-accent/40 rounded-3xl border border-dashed border-border/60 h-full flex flex-col items-center justify-center">
                <p className="italic">Start your network today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {friends.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-6 rounded-3xl border border-border/20 bg-white p-5 transition-all hover:shadow-lg group/friend"
                  >
                    <div className="flex items-center gap-5 overflow-hidden">
                      <img
                        src={
                          f.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${f.name}&background=2E4057&color=fff&size=128`
                        }
                        alt={f.name}
                        className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-accent transition-transform group-hover/friend:scale-105 shadow-sm"
                      />
                      <div className="overflow-hidden">
                        <p className="font-black text-primary tracking-tight truncate">{f.name}</p>
                        {f.friendSince && (
                          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/30">
                            Voyager since {new Date(f.friendSince).toLocaleDateString([], {month: 'short', year: 'numeric'})}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(f.id, f.name)}
                      className="cursor-pointer rounded-xl bg-destructive/5 p-3 text-destructive transition-all hover:bg-destructive hover:text-white"
                      title="Remove Voyager"
                    >
                      <Trash2 size={18} />
                    </button>
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
