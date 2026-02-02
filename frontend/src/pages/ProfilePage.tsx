import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    api.get('/users/me').then(res => setMe(res.data));
  }, []);

  if (!me) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded shadow text-center">
        <img
          src={me.avatarUrl || '/avatar.png'}
          className="w-20 h-20 rounded-full mx-auto"
        />
        <h2 className="text-xl font-bold mt-2">{me.name}</h2>
        <p className="text-gray-500">{me.email}</p>
      </div>

      <div className="bg-white p-4 rounded shadow flex justify-around">
        <Stat label="Points" value={me.points} />
        <Stat label="Friends" value={me.friendsCount} />
        <Stat label="Groups" value={me.groupsCount} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="font-bold text-lg">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  );
}
