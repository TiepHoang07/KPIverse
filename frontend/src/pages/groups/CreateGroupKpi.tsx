import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createGroupKpi } from "../../api/group";

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
    if (!name) return alert("KPI name is required");

    const cleanTasks = tasks.filter(t => t.name.trim() !== "");

    if (cleanTasks.length === 0) {
      return alert("Add at least one task");
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="rounded-lg p-2 hover:bg-gray-200 transition"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Group KPI</h1>
        </div>

        <div className="space-y-6">
          {/* Main Form Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-6">
              {/* KPI Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  KPI Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g., Team Daily Sales"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="What does this KPI measure?"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Type selector */}
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

              {/* Tasks */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Tasks <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400">
                    {tasks.filter(t => t.name.trim() !== "").length} added
                  </span>
                </div>

                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                          {index + 1}.
                        </span>
                        <input
                          className="w-full rounded-xl border border-gray-200 py-3 pl-8 pr-4 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder={`Task ${index + 1}`}
                          value={task.name}
                          onChange={(e) => updateTask(index, e.target.value)}
                        />
                      </div>

                      {tasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTask(index)}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-500"
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
                  className="mt-3 flex cursor-pointer items-center gap-1 text-sm text-blue-600 transition hover:text-blue-700"
                >
                  <span className="text-lg">+</span> Add another task
                </button>
                
                {tasks.length === 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    At least one task is required
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/groups/${groupId}`)}
              className="flex-1 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading || !name.trim() || tasks.filter(t => t.name.trim() !== "").length === 0}
              className="flex-1 cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading ? "Creating..." : "Create KPI"}
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-center text-xs text-gray-400">
            Create measurable tasks that your team can track
          </p>
        </div>
      </div>
    </div>
  );
}