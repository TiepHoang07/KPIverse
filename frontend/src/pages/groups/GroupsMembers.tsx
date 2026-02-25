import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getGroupMembers,
  removeGroupMember,
  addGroupMember,
  updateMemberRole,
  searchUsers,
  getGroup,
  transferAdmin,
} from '../../api/group';
import { UserPlus, X, Search, ArrowLeft, Crown, Mail, Calendar } from 'lucide-react';
import api from '../../api/axios';

interface Member {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export default function GroupsMembers() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState<Member | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [addingMember, setAddingMember] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Get current user ID from JWT token
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get('/users/me');
        setCurrentUserId(res.data.user.id);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Check if current user is admin
  const isAdmin = members.some(m => m.id === currentUserId && m.role === 'ADMIN');

  useEffect(() => {
    if (groupId) {
      fetchData();
    }
  }, [groupId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, groupRes] = await Promise.all([
        getGroupMembers(Number(groupId)),
        getGroup(Number(groupId))
      ]);
      
      setMembers(membersRes.data.members || []);
      setGroupName(groupRes.data.group.name);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (member: Member) => {
    try {
      setProcessingId(member.id);
      await removeGroupMember(Number(groupId), member.id);
      setMembers(prev => prev.filter(m => m.id !== member.id));
      setShowRemoveModal(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateRole = async (member: Member) => {
    const newRole = member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    
    try {
      setProcessingId(member.id);
      await updateMemberRole(Number(groupId), member.id, newRole);
      setMembers(prev =>
        prev.map(m => (m.id === member.id ? { ...m, role: newRole } : m))
      );
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update role');
    } finally {
      setProcessingId(null);
    }
  };

  const handleTransferAdmin = async (member: Member) => {
    try {
      setProcessingId(member.id);
      await transferAdmin(Number(groupId), member.id);
      
      setMembers(prev =>
        prev.map(m => ({
          ...m,
          role: m.id === member.id ? 'ADMIN' : 
                m.id === currentUserId ? 'MEMBER' : m.role
        }))
      );
    } catch (error) {
      console.error('Failed to transfer admin:', error);
      alert('Failed to transfer admin');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const res = await searchUsers(query);
      const memberIds = new Set(members.map(m => m.id));
      const filtered = res.data.filter((user: any) => !memberIds.has(user.id));
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      setAddingMember(true);
      await addGroupMember(Number(groupId), selectedUser.id);
      setShowAddModal(false);
      setSelectedUser(null);
      setSearchQuery('');
      fetchData();
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  if (loading || !currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="rounded p-2 hover:bg-gray-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{groupName}</h1>
            <p className="text-sm text-gray-500">{members.length} members</p>
          </div>
        </div>

        {/* Add Member Button - Only visible to admins */}
        {isAdmin && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              <UserPlus size={18} />
              Add Member
            </button>
          </div>
        )}

        {/* Members List */}
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="rounded-lg bg-white p-4 shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      member.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${member.name}`
                    }
                    alt={member.name}
                    className="h-12 w-12 rounded-full"
                  />
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {member.name}
                        {member.id === currentUserId && (
                          <span className="ml-2 text-xs text-gray-400">(you)</span>
                        )}
                      </h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        member.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {member.role}
                      </span>
                      {member.role === 'ADMIN' && (
                        <Crown size={14} className="text-purple-600" />
                      )}
                    </div>
                    
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail size={12} />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin actions - Only visible to admins and not for current user */}
                {isAdmin && member.id !== currentUserId && (
                  <div className="flex gap-2">
                    {member.role === 'MEMBER' && (
                      <button
                        onClick={() => handleTransferAdmin(member)}
                        disabled={processingId === member.id}
                        className="text-sm text-purple-600 hover:text-purple-800 disabled:opacity-50"
                      >
                        Transfer Admin
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleUpdateRole(member)}
                      disabled={processingId === member.id}
                      className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      {member.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                    </button>

                    <button
                      onClick={() => setShowRemoveModal(member)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Member</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedUser(null);
                  setSearchQuery('');
                }}
                className="rounded p-1 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded border border-gray-200 py-2 pl-9 pr-4"
                autoFocus
              />
            </div>

            <div className="max-h-60 space-y-2 overflow-y-auto">
              {searching && <div className="py-4 text-center text-gray-400">Searching...</div>}

              {!searching && searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`flex w-full items-center gap-3 rounded p-2 ${
                    selectedUser?.id === user.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <img
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                    alt={user.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="text-left">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded border border-gray-200 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUser || addingMember}
                className="flex-1 rounded bg-blue-600 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {addingMember ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-2 text-lg font-semibold">Remove Member</h3>
            <p className="text-gray-600">
              Remove {showRemoveModal.name} from the group?
            </p>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowRemoveModal(null)}
                className="flex-1 rounded border border-gray-200 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(showRemoveModal)}
                className="flex-1 rounded bg-red-600 py-2 text-sm text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}