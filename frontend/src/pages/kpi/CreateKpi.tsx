import { useState } from 'react';
import { createKpi } from '../../api/kpi';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

type KPIType = "DAILY" | "WEEKLY" | "MONTHLY";

export default function CreateKpi() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [tasks, setTasks] = useState<string[]>(['']);

  const addTask = () => setTasks([...tasks, '']);

  const updateTask = (i: number, value: string) => {
    const clone = [...tasks];
    clone[i] = value;
    setTasks(clone);
  };

  const removeTask = (index: number) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const submit = async () => {
    await createKpi({
      name,
      description,
      type,
      scope: 'PERSONAL',
      tasks: tasks.filter(t => t.trim()).map(t => ({ name: t })),
    });

    navigate('/kpis');
  };

  const isValid = name.trim() && tasks.some(t => t.trim());

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-6">
          <button
            onClick={() => navigate('/kpis')}
            className="rounded-xl py-2 md:py-3 px-3 md:px-4 bg-card border border-border cursor-pointer text-foreground hover:bg-secondary/50 transition shadow-sm"
          >
            ←
          </button>
          <h1 className="text-3xl font-bold text-foreground">Create Personal KPI</h1>
        </div>

        <div className="space-y-6">
          {/* Main Form Card */}
          <div className="rounded-2xl bg-card p-8 shadow-xl border border-border">
            <div className="space-y-5">
              {/* KPI Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  KPI Name <span className="text-destructive">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g., Daily Workout, Reading Goals"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="What do you want to achieve?"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {/* Type selector */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-foreground">
                  Frequency
                </label>
                <div className="flex flex-wrap gap-2">
                  {["DAILY", "WEEKLY", "MONTHLY"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t as KPIType)}
                      className={`min-w-[100px] cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-bold transition-all duration-300 ${type === t
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
                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-foreground">
                    Tasks <span className="text-destructive">*</span>
                  </label>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    {tasks.filter(t => t.trim()).length} task(s)
                  </span>
                </div>

                <div className="space-y-3">
                  {tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground/50">
                          {i + 1}.
                        </span>
                        <input
                          className="w-full rounded-xl border border-border bg-secondary/30 py-3 pl-10 pr-4 text-foreground transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder={`Task ${i + 1}`}
                          value={task}
                          onChange={e => updateTask(i, e.target.value)}
                        />
                      </div>

                      {tasks.length > 1 && (
                        <button
                          onClick={() => removeTask(i)}
                          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20 transition hover:bg-destructive/20"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  className="mt-6 flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:text-primary/80 group"
                  onClick={addTask}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 transition-all group-hover:scale-110">
                    <Plus size={16} />
                  </div>
                  Add Another Task
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/kpis')}
              className="flex-1 cursor-pointer rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-bold text-muted-foreground transition hover:bg-secondary/50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!isValid}
              className="flex-1 cursor-pointer rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/30 shadow-lg shadow-primary/20"
            >
              Create KPI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}