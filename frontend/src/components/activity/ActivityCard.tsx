import type { Activity } from "../../types/activity";

type Props = {
  activity: Activity;
};

export default function ActivityCard({ activity }: Props) {
  console.log(activity);
  return (
    <div className="space-y-2 rounded bg-white p-4 shadow">
      <div className="flex items-center gap-2">
        <img
          src={activity.user.avatarUrl || "https://ui-avatars.com/api/?name=" + activity.user.name}
          className="h-8 w-8 rounded-full"
        />
        <span className="font-semibold">{activity.user.name}</span>
      </div>

      <p className="text-sm text-gray-800">{renderActivityText(activity)}</p>
      <p className="text-[12px] text-gray-700">{new Date(activity.createdAt).toLocaleString()}</p>
    </div>
  );
}

function renderActivityText(activity: any) {
  switch (activity.type) {
      case 'KPI_CREATED':
        return `created a new KPI: ${activity.kpiName}`;
      case 'KPI_LOG':
        return `completed ${activity.completedTasks} task(s) for ${activity.kpiName}`;
      case 'REQUEST_ADD_FRIEND':
        return `sent a friend request`;
      case 'FRIEND_REQUEST_ACCEPTED':
        return `accepted a friend request`;
      case 'CREATE_GROUP':
        return `created group: ${activity.groupName}`;
      case 'JOIN_GROUP':
        return `joined group: ${activity.groupName}`;
      case 'LEAVE_GROUP':
        return `left group: ${activity.groupName}`;
      default:
        return `performed an action`;
    }
}
