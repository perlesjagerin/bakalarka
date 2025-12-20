import { useState } from 'react';
import { Users } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import UserStats from '../components/admin/UserStats';
import UserFilters from '../components/admin/UserFilters';
import UserCard from '../components/admin/UserCard';

type FilterType = 'all' | 'USER' | 'ORGANIZER' | 'ADMIN';

export default function AdminUsersPage() {
  const { users, loading, handleToggleUserStatus } = useAdminUsers();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.role === filter);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Správa uživatelů</h1>
        <p className="text-gray-600">Spravujte všechny uživatele systému</p>
      </div>

      {/* Stats */}
      <UserStats users={users} />

      {/* Filters */}
      <UserFilters filter={filter} setFilter={setFilter} />

      {/* Users list */}
      {filteredUsers.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Žádní uživatelé v této kategorii.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onToggleStatus={handleToggleUserStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
