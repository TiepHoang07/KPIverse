// components/kpi/KpiTaskItem.tsx
interface KpiTaskItemProps {
  task: any;
  checked: boolean;
  onToggle: (taskId: number) => void;
  disabled?: boolean;
}

export default function KpiTaskItem({ task, checked, onToggle, disabled = false }: KpiTaskItemProps) {
  return (
    <div 
      className={`flex items-center gap-3 p-2 rounded-lg transition
        ${disabled ? 'opacity-50' : 'hover:bg-gray-50 cursor-pointer'}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => !disabled && onToggle(task.id)}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:cursor-not-allowed"
      />
      <span className={`text-sm ${checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
        {task.name}
      </span>
    </div>
  );
}