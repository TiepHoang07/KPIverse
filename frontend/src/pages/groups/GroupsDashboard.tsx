import { useEffect, useState } from 'react';
import { getMyGroups } from '../../api/group';
import { useNavigate } from 'react-router-dom';

export default function GroupsDashboard() {
  const [groups, setGroups] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMyGroups().then(setGroups);
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">My Groups</h1>
        <button
          onClick={() => navigate('/groups/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          + Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(group => (
          <div
            key={group.id}
            className="border p-4 rounded-xl shadow-sm"
          >
            <h2 className="font-semibold text-lg">{group.name}</h2>
            <p className="text-gray-500">{group.description}</p>

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-400">
                Role: {group.role}
              </span>

              <button
                onClick={() => navigate(`/groups/${group.id}`)}
                className="text-blue-600 hover:underline"
              >
                View →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
