import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getGroupMembers,
  removeGroupMember,
  addGroupMember,
  searchUsers,
  getGroup,
  transferAdmin,
} from "../../api/group";
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
      const res = await searchUsers(query);
      const memberIds = new Set(members.map((m) => m.id));
      const filtered = res.data.filter((user: any) => !memberIds.has(user.id));
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
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl">
          <div className="h-8 w-48 animate-pulse rounded bg-secondary/50" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-secondary/50" />
            ))}
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/groups/${groupId}`)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-secondary/50 hover:text-primary"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{groupName}</h1>
              <p className="text-sm font-medium text-muted-foreground/60">{members.length} members collaborating</p>
            </div>
          </div>
 
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-primary/90 cursor-pointer shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            <UserPlus size={18} />
            Add Member
          </button>
        </div>
 
        {/* Members List */}
        <div className="space-y-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Team Members</div>
          {members.map((member) => (
            <div key={member.id} className="group rounded-2xl bg-card p-5 shadow-xl border border-border transition-all hover:border-primary/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-5 w-full sm:w-auto">
                  <div className="relative">
                    <img
                      src={
                        member.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${member.name}&background=3b82f6&color=fff&size=128`
                      }
                      alt={member.name}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    {member.role === "ADMIN" && (
                      <div className="absolute -top-1 -right-1 rounded-full bg-primary p-1 shadow-lg border border-background">
                        <Crown size={10} className="text-white" />
                      </div>
                    )}
                  </div>
 
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {member.name}
                        {member.id === currentUserId && (
                          <span className="ml-2 text-xs font-medium text-primary/50">
                            (you)
                          </span>
                        )}
                      </h3>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                          member.role === "ADMIN"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
 
                    <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground/60">
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} className="opacity-40" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="opacity-40" />
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
 
                {/* Admin actions */}
                {isAdmin && member.id !== currentUserId && (
                  <div className="flex w-full sm:w-auto gap-3 mt-4 sm:mt-0 justify-end">
                    {member.role === "MEMBER" && (
                      <button
                        onClick={() => handleTransferAdmin(member)}
                        disabled={processingId === member.id}
                        className="cursor-pointer rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-purple-400 hover:bg-purple-500 hover:text-white transition-all disabled:opacity-30"
                      >
                        {processingId === member.id ? "Working..." : "Make Admin"}
                      </button>
                    )}
 
                    <button
                      onClick={() => setShowRemoveModal(member)}
                      className="cursor-pointer rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-destructive hover:bg-destructive hover:text-white transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl border border-border">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">Add New Member</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedUser(null);
                  setSearchQuery("");
                }}
                className="rounded-xl p-2 text-muted-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
 
            <div className="relative mb-6">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground/40" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/50 py-3.5 pl-12 pr-4 text-foreground transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/20"
                autoFocus
              />
            </div>
 
            <div className="max-h-72 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {searching && (
                <div className="py-8 text-center text-muted-foreground/40 font-medium italic">
                  Searching for users...
                </div>
              )}
 
              {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="py-8 text-center text-muted-foreground/40 font-medium italic">
                  No users found matching "{searchQuery}"
                </div>
              )}
 
              {!searching &&
                searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`flex w-full items-center gap-4 rounded-xl p-3 transition-all ${
                      selectedUser?.id === user.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-secondary/50 border border-transparent"
                    }`}
                  >
                    <img
                      src={
                        user.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${user.name}&background=primary&size=128`
                      }
                      alt={user.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="text-left flex-1 overflow-hidden">
                      <div className="text-sm font-bold text-foreground truncate">{user.name}</div>
                      <div className="text-xs text-muted-foreground/60 truncate">{user.email}</div>
                    </div>
                  </button>
                ))}
            </div>
 
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-xl border border-border bg-card py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground transition hover:bg-secondary/50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUser || addingMember}
                className="flex-1 rounded-xl bg-primary py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-primary/90 disabled:opacity-30 shadow-lg shadow-primary/20 transition-all"
              >
                {addingMember ? "Adding..." : "Invite to Group"}
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Remove Member Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-2xl border border-destructive/20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <X size={32} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">Remove Member?</h3>
            <p className="text-muted-foreground text-sm font-medium">
              Are you sure you want to remove <span className="text-foreground font-bold">{showRemoveModal.name}</span> from the group? They will lose access to all group KPIs.
            </p>
 
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowRemoveModal(null)}
                className="flex-1 rounded-xl border border-border bg-card py-3.5 text-xs font-bold uppercase tracking-widest text-muted-foreground transition hover:bg-secondary/50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(showRemoveModal)}
                className="flex-1 rounded-xl bg-destructive py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20"
              >
                {processingId === showRemoveModal.id ? "Removing..." : "Remove Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
