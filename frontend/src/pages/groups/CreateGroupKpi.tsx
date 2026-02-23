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
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Create Group KPI</h1>

      <div className="bg-white p-6 rounded-2xl shadow-md space-y-5">

        {/* KPI Name */}
        <div>
          <label className="block text-sm mb-1 font-medium">KPI Name</label>
          <input
            className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Example: Team Daily Sales"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm mb-1 font-medium">
            Description (optional)
          </label>
          <textarea
            className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Short description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Type selector */}
        <div>
          <label className="block text-sm mb-2 font-medium">Type</label>
          <div className="flex gap-3">
            {["DAILY", "WEEKLY", "MONTHLY"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t as KPIType)}
                className={`px-4 py-2 rounded-xl cursor-pointer border transition ${
                  type === t
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div>
          <label className="block text-sm mb-2 font-medium">Tasks</label>

          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="flex-1 border rounded-xl p-2"
                  placeholder={`Task ${index + 1}`}
                  value={task.name}
                  onChange={(e) => updateTask(index, e.target.value)}
                />

                {tasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="text-red-500 px-3"
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
            className="text-sm text-blue-600 mt-3 cursor-pointer"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Creating..." : "Create KPI"}
      </button>
    </div>
  );
}
