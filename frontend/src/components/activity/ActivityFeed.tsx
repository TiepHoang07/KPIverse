import { useEffect, useState } from 'react';
import { fetchFeed } from '../../api/activity';
import ActivityCard from './ActivityCard';
import type { Activity } from '../../types/activity';
import { useAuth } from '../../auth/AuthContext';

export default function ActivityFeed({ view }: { view: 'all' | 'mine' }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchFeed().then((res) => setActivities(res.data));
  }, []);

  const { user } = useAuth();

  const filteredActivities = view === 'mine'
    ? activities.filter(a => a.user.id === user?.id)
    : activities;

  return (
    <div className="space-y-4">
      {filteredActivities.length === 0 && (
        <p className='text-gray-500 text-md'>No activity yet.</p>
      )}
      {filteredActivities.map((a) => (
        <ActivityCard key={a.id} activity={a} />
      ))}
    </div>
  );
}
