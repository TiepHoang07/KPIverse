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
import { 
  UserPlus, 
  X, 
  Search, 
  ChevronDown, 
  Shield, 
  User,
  ArrowLeft,
  Crown,
  MoreVertical,
  Mail,
  Calendar,
  Award,
  AlertTriangle
} from 'lucide-react';

interface Member {
  id: number;
  userId: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'ADMIN' | 'MEMBER';
  points: number;
  joinedAt: string;
  kpiLogsCount?: number;
}

interface GroupInfo {
  id: number;
  name: string;
  description: string;
  myRole: string;
  membersCount: number;
}

export default function GroupsMembers() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number>(1); // Get from auth context
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState<Member | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState<Member | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Member | null>(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Action states
  const [addingMember, setAddingMember] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  // Filter states
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'MEMBER'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'points' | 'joined'>('points');

  const isAdmin = groupInfo?.myRole === 'ADMIN';

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
      
      setMembers(membersRes.data);
      setGroupInfo({
        id: groupRes.data.group.id,
        name: groupRes.data.group.name,
        description: groupRes.data.group.description,
        myRole: groupRes.data.myRole,
        membersCount: membersRes.data.length
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (member: Member) => {
    try {
      setProcessingId(member.id);
      await removeGroupMember(Number(groupId), member.userId);
      setMembers(prev => prev.filter(m => m.id !== member.id));
      setShowRemoveModal(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateRole = async (member: Member, newRole: 'ADMIN' | 'MEMBER') => {
    try {
      setProcessingId(member.id);
      await updateMemberRole(Number(groupId), member.userId, newRole);
      setMembers(prev =>
        prev.map(m => (m.id === member.id ? { ...m, role: newRole } : m))
      );
      setShowRoleModal(null);
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update role');
    } finally {
      setProcessingId(null);
    }
  };

  const handleTransferAdmin = async () => {
    if (!selectedAdmin) return;
    
    try {
      setProcessingId(selectedAdmin.id);
      await transferAdmin(Number(groupId), selectedAdmin.userId);
      setMembers(prev =>
        prev.map(m => ({
          ...m,
          role: m.userId === selectedAdmin.userId ? 'ADMIN' : 
                m.userId === currentUserId ? 'MEMBER' : m.role
        }))
      );
      setGroupInfo(prev => prev ? { ...prev, myRole: 'MEMBER' } : null);
      setShowTransferModal(false);
      setSelectedAdmin(null);
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
      const memberUserIds = new Set(members.map(m => m.userId));
      const filtered = res.data.filter((user: any) => !memberUserIds.has(user.id));
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
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const filteredAndSortedMembers = () => {
    let filtered = members;
    
    // Apply role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(m => m.role === roleFilter);
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'points':
          return b.points - a.points;
        case 'joined':
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        default:
          return 0;
      }
    });
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'ADMIN' 
      ? 'bg-purple-100 text-purple-700 border-purple-200' 
      : 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-white shadow" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/groups/${groupId}`)}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{groupInfo?.name}</h1>
              <p className="text-sm text-gray-500">{groupInfo?.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Total Members</div>
            <div className="text-2xl font-bold">{members.length}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Admins</div>
            <div className="text-2xl font-bold">
              {members.filter(m => m.role === 'ADMIN').length}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Total Points</div>
            <div className="text-2xl font-bold">
              {members.reduce((sum, m) => sum + m.points, 0)}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admins</option>
              <option value="MEMBER">Members</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="points">Sort by Points</option>
              <option value="name">Sort by Name</option>
              <option value="joined">Sort by Join Date</option>
            </select>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <UserPlus size={18} />
              Add Member
            </button>
          )}
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {filteredAndSortedMembers().map((member) => (
            <div
              key={member.id}
              className="group rounded-lg bg-white p-4 shadow transition hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      member.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${member.name}&background=random&size=128`
                    }
                    alt={member.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {member.name}
                        {member.userId === currentUserId && (
                          <span className="ml-2 text-xs text-gray-400">(you)</span>
                        )}
                      </h3>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>
                      {member.role === 'ADMIN' && (
                        <Crown size={14} className="text-purple-600" />
                      )}
                    </div>
                    
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail size={12} />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award size={12} />
                        {member.points} points
                      </span>
                      {member.kpiLogsCount !== undefined && (
                        <span className="flex items-center gap-1">
                          {member.kpiLogsCount} logs
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isAdmin && member.userId !== currentUserId && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowTransferModal(true)}
                      className="rounded-lg px-3 py-1.5 text-sm text-purple-600 transition hover:bg-purple-50"
                    >
                      Transfer Admin
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowRoleModal(showRoleModal === member ? null : member)}
                        className="rounded-lg px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
                      >
                        Change Role
                      </button>
                      
                      {showRoleModal === member && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowRoleModal(null)}
                          />
                          <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg bg-white py-1 shadow-lg">
                            <button
                              onClick={() => handleUpdateRole(member, 'MEMBER')}
                              disabled={member.role === 'MEMBER'}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                              <User size={14} />
                              Make Member
                            </button>
                            <button
                              onClick={() => handleUpdateRole(member, 'ADMIN')}
                              disabled={member.role === 'ADMIN'}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                              <Shield size={14} />
                              Make Admin
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setShowRemoveModal(member)}
                      className="rounded-lg px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Member to {groupInfo?.name}</h3>
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

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 focus:border-indigo-500 focus:outline-none"
                autoFocus
              />
            </div>

            {/* Search results */}
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {searching && (
                <div className="py-4 text-center text-gray-400">Searching...</div>
              )}

              {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="py-4 text-center text-gray-400">No users found</div>
              )}

              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`flex w-full items-center gap-3 rounded-lg p-2 transition ${
                    selectedUser?.id === user.id
                      ? 'bg-indigo-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <img
                    src={
                      user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${user.name}`
                    }
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedUser(null);
                  setSearchQuery('');
                }}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUser || addingMember}
                className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {addingMember ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center gap-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-semibold">Remove Member</h3>
            </div>
            
            <p className="text-gray-600">
              Are you sure you want to remove <span className="font-medium">{showRemoveModal.name}</span> from the group?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowRemoveModal(null)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(showRemoveModal)}
                disabled={processingId === showRemoveModal.id}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {processingId === showRemoveModal.id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Admin Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center gap-3 text-purple-600">
              <Crown size={24} />
              <h3 className="text-lg font-semibold">Transfer Admin Role</h3>
            </div>
            
            <p className="text-gray-600">
              Select a member to transfer admin privileges to. You will become a regular member.
            </p>

            <div className="my-4 max-h-60 space-y-2 overflow-y-auto">
              {members
                .filter(m => m.role === 'MEMBER')
                .map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedAdmin(member)}
                    className={`flex w-full items-center gap-3 rounded-lg p-2 transition ${
                      selectedAdmin?.id === member.id
                        ? 'bg-purple-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={
                        member.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${member.name}`
                      }
                      alt={member.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="text-sm font-medium">{member.name}</span>
                  </button>
                ))}
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedAdmin(null);
                }}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferAdmin}
                disabled={!selectedAdmin || processingId === selectedAdmin.id}
                className="flex-1 rounded-lg bg-purple-600 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
              >
                {processingId === selectedAdmin?.id ? 'Transferring...' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}