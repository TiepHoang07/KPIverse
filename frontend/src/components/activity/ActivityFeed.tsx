import { useEffect, useState } from 'react';
import { fetchFeed } from '../../api/activity';
import ActivityCard from './ActivityCard';
import type { Activity } from '../../types/activity';

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchFeed().then((res) => setActivities(res.data));
  }, []);

  return (
    <div className="space-y-4">
      {activities.length === 0 && (
        <p className='text-gray-500 text-md'>No activity yet.</p>
      )}
      {activities.map((a) => (
        <ActivityCard key={a.id} activity={a} />
      ))}
    </div>
  );
}
