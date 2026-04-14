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
      <div className="flex h-48 items-center justify-center rounded-[2.5rem] bg-white p-4 shadow-xl border border-border/40">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border/20 border-t-primary"></div>
      </div>
    );
  }

  if (!kpi) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 bg-background">
        <p className="text-destructive font-black text-2xl tracking-tighter">KPI Not Found</p>
        <button
          onClick={handleBack}
          className="mt-6 cursor-pointer text-primary font-black uppercase tracking-widest text-xs hover:text-secondary transition-colors"
        >
          ← Return to Group
        </button>
      </div>
    );
  }

  const nextAvailableMessage = getNextAvailableMessage();
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      {/* Header with navigation and delete */}
      <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <button
          onClick={handleBack}
          className="flex cursor-pointer items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary hover:text-secondary transition-all"
        >
          <div className="rounded-full bg-accent p-2 shadow-sm">←</div>
          Back to Terminal
        </button>

        {/* Only show admin buttons if user is admin */}
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full cursor-pointer rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-3 text-xs font-black uppercase tracking-widest text-destructive transition-all hover:bg-destructive hover:text-white disabled:opacity-40 sm:w-auto shadow-sm"
          >
            {deleting ? "Decommissioning..." : "Terminate KPI"}
          </button>
        )}
      </div>

      {/* Type badge and last logged info */}
      <div className="mb-8 flex flex-col flex-wrap items-start gap-4 sm:flex-row sm:items-center">
        <span
          className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border ${
            kpi.type === "DAILY" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : ""
          } ${kpi.type === "WEEKLY" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : ""} ${
            kpi.type === "MONTHLY" ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20" : ""
          }`}
        >
          {kpi.type} Cycle
        </span>
 
        {lastLoggedDate && (
          <div className="flex items-center gap-3 rounded-full bg-accent px-4 py-2 border border-border/20">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Last Sync: {lastLoggedDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* Main KPI card */}
      <div className="mb-12 overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-2xl relative p-10">
        <div className="absolute top-0 right-0 h-40 w-40 -translate-y-16 translate-x-16 rounded-full bg-primary/5"></div>
        
        {/* Header section */}
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center relative z-10">
          <h1 className="text-4xl font-black text-primary tracking-tighter">
            {kpi.name}
          </h1>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary bg-secondary/10 px-4 py-2 rounded-xl border border-secondary/20 h-fit">
            {kpi.tasks?.length || 0} OBJECTIVES
          </span>
        </div>
  
        {/* Description */}
        {kpi.description && (
          <p className="mb-10 text-lg font-medium text-muted-foreground leading-relaxed max-w-3xl relative z-10">
            {kpi.description}
          </p>
        )}

        {/* Next available message */}
        {nextAvailableMessage && (
          <div className="mb-10 rounded-2xl border border-secondary/20 bg-secondary/5 p-6 animate-in fade-in slide-in-from-top-4">
            <p className="text-sm font-bold text-secondary uppercase tracking-widest flex items-center gap-3">
              <span className="text-xl">⏳</span> {nextAvailableMessage}
            </p>
          </div>
        )}

        {/* Progress section */}
        <div className="mb-12 relative z-10">
          <div className="mb-4 flex flex-col justify-between gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 sm:flex-row">
            <span>Operational Progress</span>
            <span className="text-primary">{progress}% Complete</span>
          </div>
          <div className="h-4 w-full rounded-full bg-accent overflow-hidden border border-border/20 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${progress === 100 ? "bg-secondary" : "bg-primary"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks section */}
        <div className="rounded-[2rem] bg-accent/40 p-8 border border-white shadow-inner relative z-10">
          <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.25em] text-primary">Mission Directives</h3>
          <div className="mb-10 space-y-4">
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
            className={`w-full rounded-2xl py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-2xl border-none ${
              canLogTasks && checked.length > 0
                ? "cursor-pointer bg-primary text-white hover:bg-primary/95 shadow-primary/30 hover:-translate-y-1 active:scale-95"
                : "cursor-not-allowed bg-muted-foreground/10 text-muted-foreground/40"
            }`}
          >
            {saving
              ? "Synchronizing..."
              : !canLogTasks && lastLoggedDate
                ? "Cycle Complete"
                : checked.length === 0
                  ? "Select Objectives"
                  : `Execute ${checked.length} Assignment${checked.length > 1 ? "s" : ""}`}
          </button>
        </div>
      </div>

      {/* Chart section */}
      <div className="my-16">
        <GroupKpiChart groupId={Number(groupId)} kpiId={Number(kpi.id)} />
      </div>

      {/* Leaderboard section */}
      <div className="mt-20">
        <h2 className="mb-10 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-center">Elite Rankings</h2>
        <div className="overflow-x-auto">
          <GroupLeaderboard groupId={Number(groupId)} kpiId={kpi.id} />
        </div>
      </div>
    </div>
  );
}
