import { useNavigate } from "react-router-dom";

type Props = {
  group: any;
};

export default function GroupHeader({ group }: Props) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between rounded bg-white p-4 shadow">
      <div>
        <h1 className="text-xl font-bold">{group.group.name}</h1>
        <p className="text-sm">{group.group.description}</p>
        <p className="mt-3 text-gray-500">role: {group.membership.role}</p>
        <p className="text-gray-500">{group.members?.length || 0} members</p>
      </div>

      <button
        onClick={() => navigate(`/groups/${group.group.id}/members`)}
        className="transform cursor-pointer rounded-2xl bg-blue-600 px-4 py-3 text-white shadow-md transition-all hover:scale-102 hover:bg-blue-700 hover:shadow-lg"
      >
        Group members
      </button>
    </div>
  );
}
