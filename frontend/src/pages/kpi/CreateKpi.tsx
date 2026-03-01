import { useState } from 'react';
import { createKpi } from '../../api/kpi';
import { useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/kpis')}
            className="rounded-lg p-2 hover:bg-gray-200 transition"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Personal KPI</h1>
        </div>

        <div className="space-y-6">
          {/* Main Form Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-5">
              {/* KPI Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  KPI Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g., Daily Workout, Reading Goals"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="What do you want to achieve?"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {/* Type selector */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Frequency
                </label>
                <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Frequency
                </label>
                <div className="flex flex-wrap gap-2">
                  {["DAILY", "WEEKLY", "MONTHLY"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t as KPIType)}
                      className={`min-w-[90px] cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        type === t
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              </div>

              {/* Tasks */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Tasks <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400">
                    {tasks.filter(t => t.trim()).length} task(s)
                  </span>
                </div>

                <div className="space-y-3">
                  {tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          {i + 1}.
                        </span>
                        <input
                          className="w-full rounded-xl border border-gray-200 py-3 pl-8 pr-4 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder={`Task ${i + 1}`}
                          value={task}
                          onChange={e => updateTask(i, e.target.value)}
                        />
                      </div>
                      
                      {tasks.length > 1 && (
                        <button
                          onClick={() => removeTask(i)}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  className="mt-3 flex cursor-pointer items-center gap-1 text-sm text-blue-600 transition hover:text-blue-700"
                  onClick={addTask}
                >
                  <span className="text-lg">+</span> Add another task
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/kpis')}
              className="flex-1 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!isValid}
              className="flex-1 cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              Create KPI
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-center text-xs text-gray-400">
            Create measurable tasks to track your progress
          </p>
        </div>
      </div>
    </div>
  );
}