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
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : "bg-gray-100 text-gray-600 border-gray-200";
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
      <div className="flex h-48 items-center justify-center rounded-xl bg-white p-4 shadow">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
              <p className="mt-1 text-gray-500">
                Manage and collaborate with your groups
              </p>
            </div>

            <button
              onClick={() => navigate("/groups/create")}
              className="inline-flex transform cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-white shadow-md transition-all hover:scale-102 hover:bg-blue-700 hover:shadow-lg"
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
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-blue-100 p-4">
                <Users size={48} className="text-blue-600" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              No groups yet
            </h3>
            <p className="mx-auto mb-6 max-w-md text-gray-500">
              Create your first group to start collaborating with others on
              shared KPIs and goals.
            </p>
            <button
              onClick={() => navigate("/groups/create")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white transition-all hover:bg-blue-700"
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
                className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:border-blue-300 hover:shadow-xl"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                {/* Card Header with Gradient */}
                <div className="h-2 bg-linear-to-r from-blue-500 to-purple-500" />

                <div className="p-6">
                  {/* Title and Role */}
                  <div className="mb-4 flex items-start justify-between">
                    <h2 className="line-clamp-1 text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
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
                  <p className="mb-4 line-clamp-2 min-h-10 text-sm text-gray-500">
                    {group.description || "No description provided"}
                  </p>

                  {/* Stats */}
                  <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
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
                  <div className="flex items-center justify-end border-t border-gray-100 pt-4">
                    <span className="inline-flex items-center text-sm font-medium text-blue-600 transition-all group-hover:gap-2">
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
