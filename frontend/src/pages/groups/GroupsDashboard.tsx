import { useEffect, useState } from "react";
import { getMyGroups } from "../../api/group";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ChevronRight,
  Plus,
  Shield,
  Calendar,
  UserPlus,
} from "lucide-react";

export default function GroupsDashboard() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await getMyGroups();
      setGroups(res);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === "ADMIN"
      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
      : "bg-primary/10 text-primary border-primary/20";
  };

  const getRoleIcon = (role: string) => {
    return role === "ADMIN" ? (
      <Shield size={14} className="mr-1" />
    ) : (
      <UserPlus size={14} className="mr-1" />
    );
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-card p-4 shadow-lg border border-border">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Groups</h1>
              <p className="mt-1 text-muted-foreground">
                Manage and collaborate with your groups
              </p>
            </div>

            <button
              onClick={() => navigate("/groups/create")}
              className="inline-flex transform cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-white shadow-md transition-all hover:scale-102 hover:bg-primary/90 hover:shadow-lg"
            >
              <Plus size={20} />
              <span className="font-medium">New Group</span>
            </button>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {groups.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card py-16 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Users size={48} className="text-primary" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              No groups yet
            </h3>
            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
              Create your first group to start collaborating with others on
              shared KPIs and goals.
            </p>
            <button
              onClick={() => navigate("/groups/create")}
              className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-primary px-6 py-3 text-white transition-all hover:bg-primary/90 shadow-lg shadow-primary/20 hover:-translate-y-0.5"
            >
              <Plus size={20} />
              <span>Create Your First Group</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                {/* Card Header with Gradient */}
                <div className="h-2 bg-linear-to-r from-secondary/70 to-blue-400" />

                <div className="p-6">
                  {/* Title and Role */}
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <h2 className="line-clamp-1 text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                      {group.name}
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getRoleBadgeColor(group.role)}`}
                    >
                      {getRoleIcon(group.role)}
                      {group.role}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mb-4 line-clamp-2 min-h-10 text-sm text-muted-foreground">
                    {group.description || "No description provided"}
                  </p>

                  {/* Stats */}
                  <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{group.membersCount || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>
                        Joined {new Date(group.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-end border-t border-border pt-4">
                    <span className="inline-flex items-center text-sm font-medium text-primary transition-all group-hover:gap-2">
                      View Group Details
                      <ChevronRight
                        size={16}
                        className="ml-1 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
