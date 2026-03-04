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
      <div className="flex h-48 items-center justify-center rounded-xl bg-white p-4 shadow">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!kpi) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6">
        <p className="text-red-500">KPI not found</p>
        <button
          onClick={handleBack}
          className="mt-4 cursor-pointer text-blue-600 hover:underline"
        >
          ← Back to Group
        </button>
      </div>
    );
  }

  const nextAvailableMessage = getNextAvailableMessage();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      {/* Header with navigation and delete */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <button
          onClick={handleBack}
          className="flex cursor-pointer items-center gap-1 text-sm text-blue-600 hover:underline sm:text-base"
        >
          ← Back to Group
        </button>

        {/* Only show admin buttons if user is admin */}
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full cursor-pointer rounded-lg border border-red-500 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {deleting ? "Deleting..." : "Delete KPI"}
          </button>
        )}
      </div>

      {/* Group context with role badge */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 sm:text-sm">Group:</span>
        <span className="text-sm font-medium break-words sm:text-base">
          {kpi.groupName}
        </span>

        {/* Role badge - shows for all users */}
        <span
          className={`ml-0 rounded-full px-2 py-0.5 text-xs font-medium sm:ml-2 ${
            userRole === "ADMIN"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {userRole}
        </span>
      </div>

      {/* Type badge and last logged info */}
      <div className="mb-4 flex flex-col flex-wrap items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
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
          <span className="text-xs text-gray-500 sm:text-sm">
            Last logged: {lastLoggedDate.toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Main KPI card */}
      <div className="mb-6 overflow-hidden rounded-2xl border-l-4 border-l-indigo-500 bg-gray-50 shadow-sm">
        {/* Header section */}
        <div className="flex flex-col items-start justify-between gap-2 px-4 pt-4 pb-2 sm:flex-row sm:items-center">
          <h1 className="text-xl font-semibold break-words sm:text-2xl">
            {kpi.name}
          </h1>
          <span className="text-xs text-gray-400 sm:text-sm">
            {kpi.tasks?.length || 0} tasks
          </span>
        </div>

        {/* Description */}
        {kpi.description && (
          <p className="px-4 pb-2 text-xs text-gray-500 sm:text-sm">
            {kpi.description || "No description"}
          </p>
        )}

        {/* Next available message */}
        {nextAvailableMessage && (
          <div className="mx-4 mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-xs text-yellow-800 sm:text-sm">
              ⏰ {nextAvailableMessage}
            </p>
          </div>
        )}

        {/* Progress section */}
        <div className="px-4 pb-4">
          <div className="mb-1 flex flex-col justify-between gap-1 text-xs text-gray-600 sm:flex-row sm:text-sm">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 sm:h-3">
            <div
              className="h-2 rounded-full bg-green-500 transition-all sm:h-3"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks section */}
        <div className="mx-4 mb-4 rounded-xl bg-white p-3 shadow-sm sm:p-4">
          <h3 className="mb-3 text-sm font-medium sm:text-base">Tasks</h3>
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
            className={`w-full rounded-xl px-4 py-2 text-sm font-medium transition sm:text-base ${
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

      {/* Chart section */}
      <div className="my-6">
        <GroupKpiChart groupId={Number(groupId)} kpiId={Number(kpi.id)} />
      </div>

      {/* Leaderboard section */}
      <div className="mt-8">
        <h2 className="mb-4 text-base font-semibold sm:text-lg">Leaderboard</h2>
        <div className="overflow-x-auto">
          <GroupLeaderboard groupId={Number(groupId)} kpiId={kpi.id} />
        </div>
      </div>
    </div>
  );
}
