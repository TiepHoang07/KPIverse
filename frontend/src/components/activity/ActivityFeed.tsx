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
      {activities.map((a) => (
        <ActivityCard key={a.id} activity={a} />
      ))}
    </div>
  );
}
