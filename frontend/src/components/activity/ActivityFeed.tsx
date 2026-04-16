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
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-border shadow-inner shadow-primary/10">
          <p className="text-muted-foreground font-medium">No activity yet!</p>
        </div>
      )}
      {filteredActivities.map((a) => (
        <ActivityCard key={a.id} activity={a} />
      ))}
    </div>
  );
}
