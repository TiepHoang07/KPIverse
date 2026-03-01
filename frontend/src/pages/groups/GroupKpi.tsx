// pages/group/GroupKpi.tsx
import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import KpiTaskItem from "../../components/kpi/KpiTaskItem";
import {
  logGroupKpiTasks,
  deleteGroupKpi,
  getGroupKpiById,
  getGroupMembers,
} from "../../api/group";
import GroupLeaderboard from "../../components/group/GroupLeaderboard";
import GroupKpiChart from "../../components/group/GroupKpiChart";

export default function GroupKpi() {
  const { groupId, kpiId } = useParams<{
    groupId: string;
    kpiId: string;
  }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [kpi, setKpi] = useState<any>(null);
  const [checked, setChecked] = useState<number[]>([]);
  const [userRole, setUserRole] = useState<string>("MEMBER");

  // Use the userStats from API response
  const canLogTasks = useMemo(() => {
    return kpi?.userStats?.canLog ?? true;
  }, [kpi]);

  // Get last logged date from userStats
  const lastLoggedDate = useMemo(() => {
    return kpi?.userStats?.lastLog
      ? new Date(kpi.userStats.lastLog.loggedAt)
      : null;
  }, [kpi]);

  // Get next available time message
  const getNextAvailableMessage = () => {
    if (!kpi || !lastLoggedDate || canLogTasks) return null;

    switch (kpi.type) {
      case "DAILY":
        return "Next log available tomorrow";
      case "WEEKLY":
        return "Next log available next week";
      case "MONTHLY":
        return "Next log available next month";
      default:
        return null;
    }
  };

  // Check if user is admin
  const isAdmin = useMemo(() => {
    return userRole === "ADMIN";
  }, [userRole]);

  // Fetch user role from group members
  useEffect(() => {
    if (!groupId) return;

    const fetchMembers = async () => {
      try {
        const res = await getGroupMembers(Number(groupId));
        setUserRole(res.data.membership.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchMembers();
  }, [groupId]);

  // Fetch KPI details
  useEffect(() => {
    if (!groupId || !kpiId) return;

    const fetchKpiDetails = async () => {
      try {
        setLoading(true);
        const res = await getGroupKpiById(Number(groupId), Number(kpiId));
        setKpi(res.data);
        setChecked([]);
      } catch (error) {
        console.error("Error fetching group KPI:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKpiDetails();
  }, [groupId, kpiId]);

  const toggleTask = (taskId: number) => {
    if (!canLogTasks) return;
    setChecked((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const handleDone = async () => {
    if (!kpi || checked.length === 0 || !canLogTasks) return;

    try {
      setSaving(true);
      await logGroupKpiTasks(Number(groupId), kpi.id, {
        taskIds: checked,
        completed: true,
      });

      alert("Tasks logged successfully!");

      // Refresh KPI data
      const refreshedKpi = await getGroupKpiById(
        Number(groupId),
        Number(kpiId),
      );
      setKpi(refreshedKpi.data);
      setChecked([]);
    } catch (error) {
      console.error("Error logging tasks:", error);
      alert("Error logging tasks. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!kpi || !groupId) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${kpi.name}"?`,
    );
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await deleteGroupKpi(Number(groupId), kpi.id);
      alert("KPI deleted successfully!");
      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error("Error deleting KPI:", error);
      alert("Error deleting KPI. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    navigate(`/groups/${groupId}`);
  };

  const progress = useMemo(() => {
    if (!kpi?.tasks || kpi.tasks.length === 0) return 0;
    return Math.round((checked.length / kpi.tasks.length) * 100);
  }, [kpi, checked]);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (!kpi) {
    return (
      <div className="p-6">
        <div className="text-red-500">KPI not found</div>
        <button
          onClick={handleBack}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Back to Group
        </button>
      </div>
    );
  }

  const nextAvailableMessage = getNextAvailableMessage();
  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex cursor-pointer items-center gap-1 text-blue-600 hover:underline"
        >
          ← Back to Group
        </button>

        {/* Only show admin buttons if user is admin */}
        {isAdmin && (
          <div className="flex">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="cursor-pointer rounded-lg border border-red-500 px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Group context with role badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-gray-500">Group:</span>
        <span className="font-medium">{kpi.groupName}</span>

        {/* Role badge - shows for all users */}
        <span
          className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
            userRole === "ADMIN"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {userRole}
        </span>
      </div>

      {/* Type badge */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            kpi.type === "DAILY" ? "bg-blue-100 text-blue-800" : ""
          } ${kpi.type === "WEEKLY" ? "bg-purple-100 text-purple-800" : ""} ${
            kpi.type === "MONTHLY" ? "bg-orange-100 text-orange-800" : ""
          }`}
        >
          {kpi.type} KPI
        </span>

        {lastLoggedDate && (
          <span className="text-sm text-gray-500">
            Last logged: {lastLoggedDate.toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Main KPI card */}
      <div className="overflow-hidden rounded-2xl border-l-4 border-l-indigo-500 bg-gray-50 shadow-sm">
        <div className="mb-4 flex items-center justify-between px-4 pt-2">
          <h1 className="text-2xl font-semibold">{kpi.name}</h1>
          <span className="text-sm text-gray-400">
            {kpi.tasks?.length || 0} tasks
          </span>
        </div>

        <p className="mb-4 px-4 text-sm text-gray-500">
          {kpi.description || "No description"}
        </p>

        {/* Next available message */}
        {nextAvailableMessage && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">⏰ {nextAvailableMessage}</p>
          </div>
        )}

        {/* Progress */}
        <div className="mb-2 p-4">
          <div className="mb-1 flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-green-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks */}
        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-medium">Tasks</h3>
          <div className="mb-4 space-y-2">
            {kpi.tasks?.map((task: any) => (
              <KpiTaskItem
                key={task.id}
                task={task}
                checked={checked.includes(task.id)}
                onToggle={toggleTask}
                disabled={!canLogTasks}
              />
            ))}
          </div>

          <button
            disabled={saving || checked.length === 0 || !canLogTasks}
            onClick={handleDone}
            className={`w-full rounded-xl px-4 py-2 font-medium transition ${
              canLogTasks && checked.length > 0
                ? "cursor-pointer bg-blue-600 text-white hover:opacity-90"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            {saving
              ? "Saving..."
              : !canLogTasks && lastLoggedDate
                ? "Already logged"
                : checked.length === 0
                  ? "Select tasks"
                  : `Mark ${checked.length} task${checked.length > 1 ? "s" : ""} as done`}
          </button>
        </div>
      </div>

      {/* Chart section - ADDED HERE */}
      <div className="my-4">
        <GroupKpiChart groupId={Number(groupId)} kpiId={Number(kpi.id)} />
      </div>

      {/* Leaderboard */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Leaderboard</h2>
        <GroupLeaderboard groupId={Number(groupId)} kpiId={kpi.id} />
      </div>
    </div>
  );
}
