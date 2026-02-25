import { useNavigate } from "react-router-dom";

type Props = {
  group: any;
};

export default function GroupHeader({ group }: Props) {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-center rounded bg-white p-4 shadow">
      <div>
        <h1 className="text-xl font-bold">{group.group.name}</h1>
        <p className="text-sm">{group.group.description}</p>
        <p className="text-gray-500 mt-3">role: {group.membership.role}</p>
        <p className="text-gray-500">{group.members?.length || 0} members</p>
      </div>

      {group.membership.role === "ADMIN" && (
        <button onClick={() => navigate(`/groups/${group.group.id}/members`)} className=" bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-2xl transition-all transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer">
          Group members
        </button>
      )}
    </div>
  );
}
