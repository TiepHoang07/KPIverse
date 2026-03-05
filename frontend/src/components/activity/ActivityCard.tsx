import type { Activity } from "../../types/activity";

type Props = {
  activity: Activity;
};

// Color mapping based on activity type
const getActivityColor = (type: string) => {
  switch (type) {
    case "KPI_CREATED":
      return "purple";
    case "KPI_LOG":
      return "green";
    case "REQUEST_ADD_FRIEND":
      return "blue";
    case "FRIEND_REQUEST_ACCEPTED":
      return "indigo";
    case "CREATE_GROUP":
      return "orange";
    case "JOIN_GROUP":
      return "teal";
    case "LEAVE_GROUP":
      return "red";
    default:
      return "gray";
  }
};

const colorClasses = {
  purple: "border-purple-300",
  green: "border-green-300",
  blue: "border-blue-300",
  indigo: "border-indigo-300",
  orange: "border-orange-300",
  teal: "border-teal-300",
  red: "border-red-300",
  gray: "border-gray-300",
};

export default function ActivityCard({ activity }: Props) {
  const color = getActivityColor(activity.type);
  const bgColorClass = colorClasses[color as keyof typeof colorClasses];

  return (
    <div className={`space-y-2 p-4 shadow ${bgColorClass} border-2`}>
      <div className="flex items-center gap-2">
        <img
          src={
            activity.user.avatarUrl ||
            `https://ui-avatars.com/api/?name=${activity.user.name}&background=6babff&color=fff`
          }
          className="h-8 w-8 rounded-full"
        />
        <span className="font-semibold">{activity.user.name}</span>
      </div>

      <p className="my-3 text-sm text-gray-800 font-medium">
        {renderActivityText(activity)}
      </p>
      <p className="mt-4 text-[12px] text-gray-700">
        {new Date(activity.createdAt).toLocaleString()}
      </p>
    </div>
  );
}

function renderActivityText(activity: any) {
  switch (activity.type) {
    case "KPI_CREATED":
      return `📊 created a new KPI: ${activity.kpiName}`;
    case "KPI_LOG":
      return `✅ completed ${activity.completedTasks} task(s) for ${activity.kpiName}`;
    case "REQUEST_ADD_FRIEND":
      return `👋 sent a friend request to ${activity.description}`;
    case "FRIEND_REQUEST_ACCEPTED":
      return `🤝 accepted a friend request: ${activity.description}`;
    case "CREATE_GROUP":
      return `👥 created group: ${activity.groupName}`;
    case "JOIN_GROUP":
      return `🚪 joined group: ${activity.groupName}`;
    case "LEAVE_GROUP":
      return `🚶 left group: ${activity.groupName}`;
    default:
      return `performed an action`;
  }
}
