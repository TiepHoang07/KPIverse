export default function ProfileActivityCard({ activity }: { activity: any }) {
  const getActivityDetails = () => {
    switch (activity.type) {
      case 'KPI_CREATED':
        return { icon: '📊', text: `Created KPI: ${activity.kpiName}`, color: 'purple' };
      case 'KPI_LOG':
        return { icon: '✅', text: `Completed ${activity.completedTasks} tasks - ${activity.kpiName}`, color: 'green' };
      case 'REQUEST_ADD_FRIEND':
        return { icon: '👋', text: 'Sent friend request to ' + activity.description, color: 'blue' };
      case 'FRIEND_REQUEST_ACCEPTED':
        return { icon: '🤝', text: `Friend request of ${activity.description} accepted`, color: 'indigo' };
      case 'CREATE_GROUP':
        return { icon: '👥', text: `Created group: ${activity.groupName}`, color: 'orange' };
      case 'JOIN_GROUP':
        return { icon: '🚪', text: `Joined group: ${activity.groupName}`, color: 'teal' };
      case 'LEAVE_GROUP':
        return { icon: '🚶', text: `Left group: ${activity.groupName}`, color: 'red' };
      default:
        return { icon: '📌', text: 'Activity', color: 'gray' };
    }
  };

  const details = getActivityDetails();

  const colorClasses = {
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    orange: 'bg-orange-500/10 border-orange-200/20 text-orange-400',
    teal: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    gray: 'bg-secondary/30 border-border text-muted-foreground',
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return d.toLocaleDateString();
  };

  return (
    <div className={`flex items-center gap-4 rounded-xl border p-4 transition-all hover:scale-[1.02] ${colorClasses[details.color as keyof typeof colorClasses]}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-current/10 shadow-inner">
        <span className="text-xl">{details.icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground">{details.text}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">{formatDate(activity.createdAt)}</p>
      </div>
    </div>
  );
}