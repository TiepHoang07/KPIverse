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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create New Group</h1>
        
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Group Name
              </label>
              <input
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="e.g., Study Group, Fitness Squad..."
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="What is this group about?"
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => navigate('/groups')}
                className="flex-1 cursor-pointer rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!name.trim()}
                className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Create a space to collaborate and track progress together
        </p>
      </div>
    </div>
  );
}