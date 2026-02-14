import { useState } from 'react';
import { createKpi } from '../../api/kpi';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Create KPI</h1>

      <input
        className="w-full mb-3 p-2 border rounded"
        placeholder="KPI name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <textarea
        className="w-full mb-3 p-2 border rounded"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <select
        className="w-full mb-4 p-2 border rounded"
        value={type}
        onChange={e => setType(e.target.value as any)}
      >
        <option value="DAILY">Daily</option>
        <option value="WEEKLY">Weekly</option>
        <option value="MONTHLY">Monthly</option>
      </select>

      <h2 className="font-semibold mb-2">Tasks</h2>

      {tasks.map((task, i) => (
        <input
          key={i}
          className="w-full mb-2 p-2 border rounded"
          placeholder={`Task ${i + 1}`}
          value={task}
          onChange={e => updateTask(i, e.target.value)}
        />
      ))}

      <button
        className="text-blue-600 text-sm mb-4"
        onClick={addTask}
      >
        + Add task
      </button>

      <button
        className="w-full bg-green-600 text-white py-2 rounded"
        onClick={submit}
      >
        Create KPI
      </button>
    </div>
  );
}
