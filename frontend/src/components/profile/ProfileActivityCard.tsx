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
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    indigo: 'bg-indigo-50 border-indigo-200',
    orange: 'bg-orange-50 border-orange-200',
    teal: 'bg-teal-50 border-teal-200',
    red: 'bg-red-50 border-red-200',
    gray: 'bg-gray-50 border-gray-200',
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
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${colorClasses[details.color as keyof typeof colorClasses]}`}>
      <span className="text-xl">{details.icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{details.text}</p>
        <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
      </div>
    </div>
  );
}