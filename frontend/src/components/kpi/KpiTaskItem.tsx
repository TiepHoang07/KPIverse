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
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border border-transparent
        ${disabled ? 'opacity-50' : 'hover:bg-secondary/50 hover:border-border cursor-pointer group'}`}
      onClick={() => !disabled && onToggle(task.id)}
    >
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => !disabled && onToggle(task.id)}
          disabled={disabled}
          className="w-5 h-5 rounded-md border-border bg-secondary text-primary focus:ring-primary focus:ring-offset-background cursor-pointer disabled:cursor-not-allowed transition-all"
        />
      </div>
      <span className={`text-sm font-medium transition-all ${checked ? 'line-through text-muted-foreground/50' : 'text-foreground group-hover:text-primary'}`}>
        {task.name}
      </span>
    </div>
  );
}