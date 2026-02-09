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
    <div className="p-6 max-w-md">
      <h1 className="text-xl font-bold mb-4">Create Group</h1>

      <input
        className="w-full border p-2 mb-3"
        placeholder="Group name"
        onChange={e => setName(e.target.value)}
      />

      <textarea
        className="w-full border p-2 mb-4"
        placeholder="Description"
        onChange={e => setDescription(e.target.value)}
      />

      <button
        onClick={submit}
        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        Create
      </button>
    </div>
  );
}
