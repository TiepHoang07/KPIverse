// pages/kpi/kpi.tsx
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import KpiTaskItem from "../../components/kpi/KpiTaskItem";
import KpiChart from "../../components/kpi/KpiChart"; // ✅ Added chart import
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Kpi() {
  const { kpiId } = useParams<{ kpiId: string }>();
  const navigate = useNavigate();

  const [kpi, setKpi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);
  const [lastLoggedDate, setLastLoggedDate] = useState<Date | null>(null);

  // Check if user can log tasks based on KPI type
  const canLogTasks = useMemo(() => {
    if (!kpi || !lastLoggedDate) return true;

    const now = new Date();
    const lastLog = new Date(lastLoggedDate);

    switch (kpi.type) {
      case "DAILY":
        // Can log if last log was on a different day
        return lastLog.toDateString() !== now.toDateString();

      case "WEEKLY":
        // Can log if last log was in a different week
        const lastWeek = getWeekNumber(lastLog);
        const currentWeek = getWeekNumber(now);
        return (
          lastWeek.year !== currentWeek.year ||
          lastWeek.week !== currentWeek.week
        );

      case "MONTHLY":
        // Can log if last log was in a different month
        return (
          lastLog.getMonth() !== now.getMonth() ||
          lastLog.getFullYear() !== now.getFullYear()
        );

      default:
        return true;
    }
  }, [kpi, lastLoggedDate, checked]);

  // Helper function to get week number
  const getWeekNumber = (date: Date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
    return { year: d.getUTCFullYear(), week: weekNo };
  };

  // Get next available time message
  const getNextAvailableMessage = () => {
    if (!kpi || !lastLoggedDate || canLogTasks) return null;
    if (canLogTasks) return null;

    const lastLog = new Date(lastLoggedDate);

    switch (kpi.type) {
      case "DAILY":
        const tomorrow = new Date(lastLog);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return `Next log available tomorrow (${tomorrow.toLocaleDateString()})`;

      case "WEEKLY":
        const nextWeek = new Date(lastLog);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return `Next log available week of ${nextWeek.toLocaleDateString()}`;

      case "MONTHLY":
        const nextMonth = new Date(lastLog);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return `Next log available in ${nextMonth.toLocaleDateString("en-US", { month: "long" })}`;

      default:
        return null;
    }
  };

  // Fetch KPI details
  useEffect(() => {
    if (!kpiId) return;

    const fetchKpiDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/kpis/${kpiId}`);
        setKpi(res.data);

        // Check if there are any logs today/this week/this month
        if (res.data.recentLogs && res.data.recentLogs.length > 0) {
          const latestLog = new Date(res.data.recentLogs[0].loggedAt);
          setLastLoggedDate(latestLog);
        }

        // Initialize checked state with completed tasks
        const completedTaskIds =
          res.data.tasks
            ?.filter((task: any) => task.completed)
            .map((task: any) => task.id) || [];
        setChecked(completedTaskIds);
      } catch (error) {
        console.error("Error fetching KPI details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKpiDetails();
  }, [kpiId]);

  // Calculate progress
  const progress = useMemo(() => {
    if (!kpi?.tasks || kpi.tasks.length === 0) return 0;
    return Math.round((checked.length / kpi.tasks.length) * 100);
  }, [kpi, checked]);

  const toggleTask = (taskId: number) => {
    if (!canLogTasks) return; // Prevent toggling if can't log
    setChecked((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const handleSave = async () => {
    if (!kpi || checked.length === 0 || !canLogTasks) return;

    try {
      setSaving(true);

      await api.post(`/kpis/${kpi.id}/log`, {
        taskIds: checked,
        completed: true,
      });

      // Update last logged date
      setLastLoggedDate(new Date());

      toast.success("Tasks logged successfully!");

      // Refresh KPI data
      const refreshedKpi = await api.get(`/kpis/${kpiId}`);
      setKpi(refreshedKpi.data);

      // Reset checked state if needed (optional)
      // setChecked([]);
    } catch (error) {
      console.error("Error saving tasks:", error);
      toast.error("Error saving tasks. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!kpi) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${kpi.name}"? This action cannot be undone.`,
    );
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/kpis/${kpi.id}`);
      toast.success("KPI deleted successfully!");
      navigate("/kpis");
    } catch (error) {
      console.error("Error deleting KPI:", error);
      toast.error("Error deleting KPI. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    navigate("/kpis");
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl bg-card border border-border p-4 shadow-xl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
      </div>
    );
  }

  if (!kpi) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 bg-background">
        <p className="text-destructive font-bold text-xl text-center">KPI not found</p>
        <button
          onClick={handleBack}
          className="mt-6 cursor-pointer text-primary font-bold hover:underline"
        >
          ← Back to KPIs
        </button>
      </div>
    );
  }

  const nextAvailableMessage = getNextAvailableMessage();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      {/* Header with actions */}
      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <button
          onClick={handleBack}
          className="flex cursor-pointer items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all sm:text-base"
        >
          ← Back to KPIs
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full cursor-pointer rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-2.5 text-sm font-bold text-destructive transition hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto shadow-lg shadow-destructive/10"
        >
          {deleting ? "Deleting..." : "Delete KPI"}
        </button>
      </div>

      {/* Type badge and time info */}
      <div className="mb-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
        <span
          className={`inline-block rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${
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
             Last logged: {new Date(lastLoggedDate).toLocaleString()}
          </span>
        )}
      </div>

      {/* Main KPI card */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500/80"></div>
        {/* Header */}
        <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold text-foreground">
            {kpi.name}
          </h1>
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 sm:text-sm">
            {kpi.tasks?.length || 0} tasks
          </span>
        </div>

        {/* Description */}
        {kpi.description && (
          <p className="mb-6 text-sm text-muted-foreground leading-relaxed">{kpi.description}</p>
        )}

        {/* Next available message if can't log */}
        {nextAvailableMessage && (
          <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-yellow-500">
              <span className="text-lg">⏰</span>
              {nextAvailableMessage}
            </p>
          </div>
        )}

        {/* Progress section */}
        <div className="mb-8">
          <div className="mb-2 flex flex-col justify-between gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground sm:flex-row sm:text-sm">
            <span>Overall Progress</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 shadow-lg shadow-primary/30"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-right text-xs font-medium text-muted-foreground/60">
            {checked.length} of {kpi.tasks?.length || 0} tasks completed
          </div>
        </div>

        {/* Tasks section */}
        <div className="mb-8">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground sm:text-base">Tasks</h3>
          <div className="space-y-3 rounded-2xl bg-secondary/30 p-4 border border-border shadow-inner">
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
        </div>

        {/* Action buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={handleSave}
            disabled={saving || checked.length === 0 || !canLogTasks}
            className={`w-full rounded-xl py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 sm:flex-1 sm:text-base shadow-lg ${
              canLogTasks && checked.length > 0
                ? "cursor-pointer bg-primary text-white hover:bg-primary/90 shadow-primary/20 hover:-translate-y-0.5"
                : "cursor-not-allowed bg-secondary text-muted-foreground opacity-50"
            }`}
          >
            {saving
              ? "Saving..."
              : !canLogTasks && lastLoggedDate
                ? "Already logged for this period"
                : checked.length === 0
                  ? "No tasks selected"
                  : `Mark ${checked.length} task${checked.length > 1 ? "s" : ""} as completed`}
          </button>

          <button
            onClick={() => setChecked(kpi.tasks?.map((t: any) => t.id) || [])}
            disabled={!canLogTasks}
            className={`w-full rounded-xl border border-border px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all sm:w-auto ${
              canLogTasks
                ? "cursor-pointer bg-card text-foreground hover:bg-secondary/50"
                : "cursor-not-allowed bg-secondary/30 text-muted-foreground opacity-50"
            }`}
          >
            Select all
          </button>
        </div>

        {/* Quick actions */}
        {checked.length > 0 &&
          checked.length < kpi.tasks?.length &&
          canLogTasks && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setChecked([])}
                className="cursor-pointer text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
              >
                Clear selection
              </button>
            </div>
          )}
      </div>

      {/* Chart section */}
      <div className="my-6">
        <KpiChart kpiId={Number(kpiId)} />
      </div>

      {/* Additional info section */}
      <div className="mt-8 flex flex-col gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 sm:flex-row sm:justify-between border-t border-border pt-6">
        {kpi.createdAt && (
          <span className="flex items-center gap-2">
             <div className="h-1 w-1 rounded-full bg-muted-foreground/30"></div>
             Created: {new Date(kpi.createdAt).toLocaleDateString()}
          </span>
        )}
        {kpi.isActive === false && (
          <span className="text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">✓ Finished</span>
        )}
      </div>
    </div>
  );
}
