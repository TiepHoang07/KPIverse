import { useEffect, useState } from 'react';
import { getMyGroups } from '../../api/group';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight, Plus, Shield, Calendar, UserPlus } from 'lucide-react';

export default function GroupsDashboard() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await getMyGroups();
      setGroups(res);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'ADMIN' 
      ? 'bg-purple-100 text-purple-700 border-purple-200' 
      : 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getRoleIcon = (role: string) => {
    return role === 'ADMIN' ? <Shield size={14} className="mr-1" /> : <UserPlus size={14} className="mr-1" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  console.log(groups);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
              <p className="text-gray-500 mt-1">
                Manage and collaborate with your groups
              </p>
            </div>
            
            <button
              onClick={() => navigate('/groups/create')}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-2xl transition-all transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
            >
              <Plus size={20} />
              <span className="font-medium">New Group</span>
            </button>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {groups.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <Users size={48} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No groups yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first group to start collaborating with others on shared KPIs and goals.
            </p>
            <button
              onClick={() => navigate('/groups/create')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all"
            >
              <Plus size={20} />
              <span>Create Your First Group</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                {/* Card Header with Gradient */}
                <div className="h-2 bg-linear-to-r from-blue-500 to-purple-500" />
                
                <div className="p-6">
                  {/* Title and Role */}
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {group.name}
                    </h2>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(group.role)}`}>
                      {getRoleIcon(group.role)}
                      {group.role}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-10">
                    {group.description || 'No description provided'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{group.membersCount || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>Joined {new Date(group.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                    <span className="inline-flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                      View Group Details
                      <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}