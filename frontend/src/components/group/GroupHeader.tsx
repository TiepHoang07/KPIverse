type Props = {
  group: any;
};

export default function GroupHeader({ group }: Props) {
  return (
    <div className="bg-white p-4 rounded shadow flex justify-between">
      <div>
        <h1 className="text-xl font-bold">{group.name}</h1>
        <p className="text-gray-500">{group.description}</p>
      </div>

      {group.myRole === 'ADMIN' && (
        <button className="text-indigo-600">
          Manage members
        </button>
      )}
    </div>
  );
}
