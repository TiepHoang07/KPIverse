import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createGroupKpi } from "../../api/group";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

type KPIType = "DAILY" | "WEEKLY" | "MONTHLY";

export default function CreateGroupKpi() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<KPIType>("DAILY");
  const [tasks, setTasks] = useState([{ name: "" }]);
  const [loading, setLoading] = useState(false);

  const addTask = () => {
    setTasks([...tasks, { name: "" }]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, value: string) => {
    const updated = [...tasks];
    updated[index].name = value;
    setTasks(updated);
  };

  const submit = async () => {
    if (!groupId) return;
    if (!name) return toast.error("KPI name is required");

    const cleanTasks = tasks.filter(t => t.name.trim() !== "");

    if (cleanTasks.length === 0) {
      return toast.error("Add at least one task");
    }

    try {
      setLoading(true);

      await createGroupKpi(
        {
          name,
          description,
          type,
          scope: "GROUP",
          tasks: cleanTasks,
        },
        Number(groupId)
      );

      navigate(`/groups/${groupId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-secondary/50 hover:text-primary"
          >
            ←
          </button>
          <h1 className="text-3xl font-bold text-foreground">Create Group KPI</h1>
        </div>
 
        <div className="space-y-8">
          {/* Main Form Card */}
          <div className="rounded-2xl bg-card p-8 shadow-xl border border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary to-purple-500"></div>
            
            <div className="space-y-8">
              {/* KPI Name */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                  KPI Name <span className="text-destructive">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3.5 text-foreground transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30"
                  placeholder="e.g., Team Daily Sales"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
 
              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                  Description <span className="text-muted-foreground/40 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3.5 text-foreground transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30"
                  placeholder="What does this KPI measure?"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
 
              {/* Type selector */}
              <div>
                <label className="mb-3 block text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                  Frequency
                </label>
                <div className="flex flex-wrap gap-3">
                  {["DAILY", "WEEKLY", "MONTHLY"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t as KPIType)}
                      className={`min-w-[100px] cursor-pointer rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                        type === t
                          ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                          : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Tasks */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <label className="block text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                    Tasks <span className="text-destructive">*</span>
                  </label>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                    {tasks.filter(t => t.name.trim() !== "").length} added
                  </span>
                </div>
 
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground/30">
                          {index + 1}.
                        </span>
                        <input
                          className="w-full rounded-xl border border-border bg-secondary/30 py-3.5 pl-10 pr-4 text-foreground transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/20"
                          placeholder={`Enter task ${index + 1}...`}
                          value={task.name}
                          onChange={(e) => updateTask(index, e.target.value)}
                        />
                      </div>
 
                      {tasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTask(index)}
                          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-destructive transition-all hover:bg-destructive hover:text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
 
                <button
                  type="button"
                  onClick={addTask}
                  className="mt-6 flex cursor-pointer items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary transition-all hover:gap-3"
                >
                  <Plus size={18} /> Add another task
                </button>
                
                {tasks.length === 0 && (
                  <p className="mt-4 text-xs font-medium text-destructive">
                    At least one task is required
                  </p>
                )}
              </div>
            </div>
          </div>
 
          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/groups/${groupId}`)}
              className="flex-1 cursor-pointer rounded-xl border border-border bg-card px-4 py-4 text-sm font-bold uppercase tracking-widest text-muted-foreground transition hover:bg-secondary/50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading || !name.trim() || tasks.filter(t => t.name.trim() !== "").length === 0}
              className="flex-1 cursor-pointer rounded-xl bg-primary px-4 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-30 shadow-lg shadow-primary/20 hover:-translate-y-0.5"
            >
              {loading ? "Creating..." : "Create Group KPI"}
            </button>
          </div>
 
          {/* Helper Text */}
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Create measurable tasks that your team can track together
          </p>
        </div>
      </div>
    </div>
  );
}