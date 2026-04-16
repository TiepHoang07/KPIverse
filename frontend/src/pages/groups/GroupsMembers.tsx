import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getGroupMembers,
  removeGroupMember,
  addGroupMember,
  getGroup,
  transferAdmin,
} from "../../api/group";
import { getFriends } from "../../api/friend";
import {
  UserPlus,
  X,
  Search,
  ArrowLeft,
  Crown,
  Mail,
  Calendar,
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

interface Member {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "ADMIN" | "MEMBER";
  joinedAt: string;
}

export default function GroupsMembers() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState<Member | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [addingMember, setAddingMember] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Get current user ID from JWT token
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get("/users/me");
        setCurrentUserId(res.data.user.id);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Check if current user is admin
  const isAdmin = members.some(
    (m) => m.id === currentUserId && m.role === "ADMIN",
  );

  useEffect(() => {
    if (groupId) {
      fetchData();
    }
  }, [groupId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, groupRes] = await Promise.all([
        getGroupMembers(Number(groupId)),
        getGroup(Number(groupId)),
      ]);

      setMembers(membersRes.data.members || []);
      setGroupName(groupRes.data.group.name);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (member: Member) => {
    try {
      setProcessingId(member.id);
      await removeGroupMember(Number(groupId), member.id);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      setShowRemoveModal(null);
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member");
    } finally {
      setProcessingId(null);
    }
  };

  const handleTransferAdmin = async (member: Member) => {
    try {
      setProcessingId(member.id);
      await transferAdmin(Number(groupId), member.id);

      setMembers((prev) =>
        prev.map((m) => ({
          ...m,
          role:
            m.id === member.id
              ? "ADMIN"
              : m.id === currentUserId
                ? "MEMBER"
                : m.role,
        })),
      );
    } catch (error) {
      console.error("Failed to transfer admin:", error);
      toast.error("Failed to transfer admin");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const res = await getFriends();
      const filtered = res.data.filter(
        (friend: any) =>
          friend.name.toLowerCase().includes(query.toLowerCase()) ||
          friend.email.toLowerCase().includes(query.toLowerCase()),
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      setAddingMember(true);
      await addGroupMember(Number(groupId), selectedUser.id);
      setShowAddModal(false);
      setSelectedUser(null);
      setSearchQuery("");
      fetchData();
    } catch (error) {
      console.error("Failed to add member:", error);
      toast.error("Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  if (loading || !currentUserId) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-background p-4 shadow">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/groups/${groupId}`)}
              className="border-border bg-card text-muted-foreground hover:bg-primary/10 hover:text-primary flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-primary text-3xl font-bold">
                {groupName}
              </h1>
              <p className="text-muted-foreground/60 text-sm font-medium">
                {members.length} members
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 shadow-primary/20 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold tracking-widest text-white uppercase shadow-lg transition-all hover:-translate-y-0.5 sm:w-auto"
          >
            <UserPlus size={18} />
            Add Member
          </button>
        </div>

        {/* Members List */}
        <div className="space-y-4">
          <div className="text-muted-foreground/40 mb-2 text-xs font-bold tracking-widest uppercase">
            Team Members
          </div>
          {members.map((member) => (
            <div
              key={member.id}
              className="group bg-card border-border hover:border-primary/30 rounded-2xl border p-4 shadow-xl transition-all sm:p-5"
            >
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex w-full items-center gap-5 sm:w-auto">
                  <div className="relative">
                    <img
                      src={
                        member.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${member.name}&background=2E4057&color=fff`
                      }
                      alt={member.name}
                      className="ring-primary/20 h-12 w-12 shrink-0 rounded-full object-cover ring-2"
                    />
                    {member.role === "ADMIN" && (
                      <div className="bg-purple-500 border-purple-800 absolute -top-1 -right-1 rounded-full border p-1 shadow-lg">
                        <Crown size={12} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-foreground text-lg font-bold">
                        {member.name}
                        {member.id === currentUserId && (
                          <span className="text-primary/50 ml-2 text-xs font-medium">
                            (you)
                          </span>
                        )}
                      </h3>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase ${
                          member.role === "ADMIN"
                            ? "border-purple-500 bg-purple-500/10 text-purple-500"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>

                    <div className="text-muted-foreground/60 mt-1.5 flex flex-wrap items-center gap-4 text-xs font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="opacity-40" />
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin actions */}
                {isAdmin && member.id !== currentUserId && (
                  <div className="mt-4 flex w-full justify-end gap-3 sm:mt-0 sm:w-auto">
                    {member.role === "MEMBER" && (
                      <button
                        onClick={() => handleTransferAdmin(member)}
                        disabled={processingId === member.id}
                        className="cursor-pointer rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold tracking-widest text-primary uppercase transition-all hover:bg-primary hover:text-white disabled:opacity-30"
                      >
                        {processingId === member.id
                          ? "Working..."
                          : "Make Admin"}
                      </button>
                    )}

                    <button
                      onClick={() => setShowRemoveModal(member)}
                      className="border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive cursor-pointer rounded-xl border px-4 py-2 text-xs font-bold tracking-widest uppercase transition-all hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-card border-border w-full max-w-md rounded-2xl border p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-foreground text-xl font-bold">
                Add New Member
                <p className="text-[10px] text-gray-400">
                  add your friend to group
                </p>
              </h3>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedUser(null);
                  setSearchQuery("");
                }}
                className="text-muted-foreground hover:bg-primary/10 cursor-pointer rounded-xl p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="text-muted-foreground/40 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="border-border bg-primary/10 text-foreground focus:border-primary focus:ring-primary placeholder:text-muted-foreground/20 w-full rounded-xl border py-3.5 pr-4 pl-12 transition focus:ring-1 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="custom-scrollbar max-h-72 space-y-2 overflow-y-auto pr-2">
              {searching && (
                <div className="text-muted-foreground/40 py-8 text-center font-medium italic">
                  Searching for friends...
                </div>
              )}

              {!searching &&
                searchQuery.length >= 2 &&
                searchResults.length === 0 && (
                  <div className="text-muted-foreground/40 py-8 text-center font-medium italic">
                    No friends found matching "{searchQuery}"
                  </div>
                )}

              {!searching &&
                searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`flex w-full items-center gap-4 rounded-xl p-3 transition-all ${
                      selectedUser?.id === user.id
                        ? "bg-primary/10 border-primary/30 border"
                        : "hover:bg-primary/10 border border-transparent"
                    }`}
                  >
                    <img
                      src={
                        user.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${user.name}&background=2E4057&size=128&color=fff`
                      }
                      alt={user.name}
                      className="h-10 w-10 shrink-0 rounded-xl object-cover"
                    />
                    <div className="flex-1 overflow-hidden text-left">
                      <div className="text-foreground truncate text-sm font-bold">
                        {user.name}
                      </div>
                      <div className="text-muted-foreground/60 truncate text-xs">
                        {user.email}
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="border-border bg-card text-muted-foreground hover:bg-primary/10 flex-1 rounded-xl border py-3.5 text-xs font-bold tracking-widest uppercase transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUser || addingMember}
                className="bg-primary hover:bg-primary/90 shadow-primary/20 flex-1 rounded-xl py-3.5 text-xs font-bold tracking-widest text-white uppercase shadow-lg transition-all disabled:opacity-30"
              >
                {addingMember ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-card border-destructive/20 w-full max-w-sm rounded-2xl border p-8 text-center shadow-xl">
            <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <X size={32} />
            </div>
            <h3 className="text-foreground mb-2 text-xl font-bold">
              Remove Member?
            </h3>
            <p className="text-muted-foreground text-sm font-medium">
              Are you sure you want to remove{" "}
              <span className="text-foreground font-bold">
                {showRemoveModal.name}
              </span>{" "}
              from the group? They will lose access to all group KPIs.
            </p>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowRemoveModal(null)}
                className="border-border bg-card text-muted-foreground hover:bg-primary/10 flex-1 rounded-xl border py-3.5 text-xs font-bold tracking-widest uppercase transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(showRemoveModal)}
                className="bg-destructive hover:bg-destructive/90 shadow-destructive/20 flex-1 rounded-xl py-3.5 text-xs font-bold tracking-widest text-white uppercase shadow-lg transition-all"
              >
                {processingId === showRemoveModal.id
                  ? "Removing..."
                  : "Remove Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
