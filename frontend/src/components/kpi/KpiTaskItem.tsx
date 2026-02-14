// components/kpi/KpiTaskItem.tsx
type Props = {
  task: {
    id: number;
    name: string;
  };
  checked: boolean;
  onToggle: (taskId: number) => void;
};

export default function KpiTaskItem({ task, checked, onToggle }: Props) {
  return (
    <label className="flex items-center gap-2 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(task.id)}
      />
      <span className={checked ? 'line-through text-gray-400' : ''}>
        {task.name}
      </span>
    </label>
  );
}
