import { useState, useEffect } from 'react';
import { Users, Mail, Calendar, Shield, Trash2, CheckCircle } from 'lucide-react';
import api from '../lib/axios';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, CONFIRMATION_MESSAGES } from '../constants/messages';
import { showErrorToast, showSuccessToast } from '../utils/errorHandling';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'USER' | 'ORGANIZER' | 'ADMIN'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users || []);
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.LOAD_USERS_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    console.log('Frontend - handleToggleUserStatus called with:', { userId, currentStatus });
    
    const action = currentStatus ? 'deaktivovat' : 'aktivovat';
    if (!confirm(`Opravdu chcete ${action} tohoto uživatele?`)) {
      return;
    }

    try {
      const response = await api.delete(`/users/${userId}`);
      console.log('Frontend - Backend response:', response.data);
      showSuccessToast(response.data.message);
      // Update user in list with new status using functional update
      setUsers(prevUsers => {
        const updated = prevUsers.map(u => 
          u.id === userId ? { ...u, isActive: response.data.isActive } : u
        );
        console.log('Frontend - Updated user in list, new isActive:', response.data.isActive);
        return updated;
      });
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.UPDATE_USER_ERROR);
    }
  };

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.role === filter);

  const getRoleBadge = (role: string) => {
    const badges = {
      USER: 'bg-blue-100 text-blue-800',
      ORGANIZER: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-red-100 text-red-800',
    };
    const labels = {
      USER: 'Uživatel',
      ORGANIZER: 'Organizátor',
      ADMIN: 'Administrátor',
    };
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badges[role as keyof typeof badges]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

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

  const stats = {
    total: users.length,
    users: users.filter(u => u.role === 'USER').length,
    organizers: users.filter(u => u.role === 'ORGANIZER').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Správa uživatelů</h1>
        <p className="text-gray-600">Spravujte všechny uživatele systému</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-gray-600 text-sm mb-1">Celkem uživatelů</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm mb-1">Uživatelé</p>
          <p className="text-3xl font-bold text-blue-600">{stats.users}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm mb-1">Organizátoři</p>
          <p className="text-3xl font-bold text-purple-600">{stats.organizers}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm mb-1">Administrátoři</p>
          <p className="text-3xl font-bold text-red-600">{stats.admins}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['all', 'USER', 'ORGANIZER', 'ADMIN'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Vše' : 
             f === 'USER' ? 'Uživatelé' :
             f === 'ORGANIZER' ? 'Organizátoři' :
             'Administrátoři'}
          </button>
        ))}
      </div>

      {/* Users list */}
      {filteredUsers.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Žádní uživatelé v této kategorii.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-bold ${user.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {user.firstName} {user.lastName}
                    </h3>
                    {getRoleBadge(user.role)}
                    {!user.isActive && (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                        Neaktivní
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Registrován: {new Date(user.createdAt).toLocaleDateString('cs-CZ')}</span>
                    </div>
                  </div>
                </div>

                {user.role === 'ADMIN' ? (
                  <button
                    className="text-sm flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
                    disabled
                    title="Nelze měnit stav administrátora"
                  >
                    <Shield size={16} />
                    Nelze deaktivovat
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                    className={`text-sm flex items-center gap-2 ${user.isActive ? 'btn-danger' : 'btn-primary'}`}
                    title={user.isActive ? 'Deaktivovat uživatele' : 'Aktivovat uživatele'}
                  >
                    {user.isActive ? <Trash2 size={16} /> : <CheckCircle size={16} />}
                    {user.isActive ? 'Deaktivovat' : 'Aktivovat'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
