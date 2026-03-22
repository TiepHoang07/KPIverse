import { useState } from 'react';
import { createGroup } from '../../api/group';
import { useNavigate } from 'react-router-dom';

export default function CreateGroup() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    await createGroup({ name, description });
    navigate('/groups');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-3xl font-bold text-foreground">Create New Group</h1>
        
        <div className="rounded-2xl bg-card p-6 shadow-xl border border-border">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Group Name
              </label>
              <input
                className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g., Study Group, Fitness Squad..."
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
 
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-foreground transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="What is this group about?"
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
 
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => navigate('/groups')}
                className="flex-1 cursor-pointer rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-muted-foreground transition hover:bg-secondary/50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!name.trim()}
                className="flex-1 cursor-pointer rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/30 shadow-lg shadow-primary/20 hover:-translate-y-0.5"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
 
        <p className="mt-6 text-center text-xs text-muted-foreground font-medium uppercase tracking-widest">
          Collaborate and track progress together
        </p>
      </div>
    </div>
  );
}