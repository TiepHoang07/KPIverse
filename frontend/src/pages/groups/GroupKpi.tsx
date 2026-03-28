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
import toast from "react-hot-toast";

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

      toast.success("Tasks logged successfully!");

      // Refresh KPI data
      const refreshedKpi = await getGroupKpiById(
        Number(groupId),
        Number(kpiId),
      );
      setKpi(refreshedKpi.data);
      setChecked([]);
    } catch (error) {
      console.error("Error logging tasks:", error);
      toast.error("Error logging tasks. Please try again.");
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
      toast.success("KPI deleted successfully!");
      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error("Error deleting KPI:", error);
      toast.error("Error deleting KPI. Please try again.");
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
      <div className="flex h-48 items-center justify-center rounded-2xl bg-card p-4 shadow-xl border border-border">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
      </div>
    );
  }

  if (!kpi) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 bg-background">
        <p className="text-destructive font-bold text-xl">KPI not found</p>
        <button
          onClick={handleBack}
          className="mt-6 cursor-pointer text-primary font-bold hover:underline"
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
          className="flex cursor-pointer items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all sm:text-base"
        >
          ← Back to Group
        </button>

        {/* Only show admin buttons if user is admin */}
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full cursor-pointer rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-2.5 text-sm font-bold text-destructive transition hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto shadow-lg shadow-destructive/10"
          >
            {deleting ? "Deleting..." : "Delete KPI"}
          </button>
        )}
      </div>

      {/* Type badge and last logged info */}
      <div className="mb-6 flex flex-col flex-wrap items-start gap-4 sm:flex-row sm:items-center">
        <span
          className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest border ${
            kpi.type === "DAILY" ? "bg-primary/10 text-primary border-primary/20" : ""
          } ${kpi.type === "WEEKLY" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : ""} ${
            kpi.type === "MONTHLY" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : ""
          }`}
        >
          {kpi.type} KPI
        </span>
 
        {lastLoggedDate && (
          <span className="text-xs font-medium text-muted-foreground sm:text-sm flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30"></div>
            Last logged: {lastLoggedDate.toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Main KPI card */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-xl relative">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80"></div>
        {/* Header section */}
        <div className="flex flex-col items-start justify-between gap-2 sm:gap-4 px-6 pt-4 sm:pt-6 pb-2 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold text-foreground">
            {kpi.name}
          </h1>
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 sm:text-sm">
            {kpi.tasks?.length || 0} tasks
          </span>
        </div>
 
        {/* Description */}
        {kpi.description && (
          <p className="px-6 sm:pb-2 text-sm text-muted-foreground leading-relaxed">
            {kpi.description}
          </p>
        )}

        {/* Next available message */}
        {nextAvailableMessage && (
          <div className="mx-6 mb-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="text-sm font-medium text-yellow-500 flex items-center gap-2">
              <span className="text-lg">⏰</span> {nextAvailableMessage}
            </p>
          </div>
        )}

        {/* Progress section */}
        <div className="px-6 pb-6 mt-2">
          <div className="mb-2 flex flex-col justify-between gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground sm:flex-row sm:text-sm">
            <span>Progress</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 shadow-lg shadow-primary/30"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks section */}
        <div className="mx-6 mb-6 rounded-2xl bg-secondary/30 p-4 border border-border shadow-inner sm:p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground sm:text-base">Tasks</h3>
          <div className="mb-6 space-y-3">
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
            className={`w-full rounded-xl py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 sm:text-base shadow-lg ${
              canLogTasks && checked.length > 0
                ? "cursor-pointer bg-primary text-white hover:bg-primary/90 shadow-primary/20 hover:-translate-y-0.5"
                : "cursor-not-allowed bg-secondary text-muted-foreground opacity-50"
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
      <div className="mt-12">
        <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">Leaderboard</h2>
        <div className="overflow-x-auto">
          <GroupLeaderboard groupId={Number(groupId)} kpiId={kpi.id} />
        </div>
      </div>
    </div>
  );
}
