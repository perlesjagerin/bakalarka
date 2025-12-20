import { Mail, Calendar, Shield, Trash2, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

interface UserCardProps {
  user: User;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
}

export default function UserCard({ user, onToggleStatus }: UserCardProps) {
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

  return (
    <div className="card hover:shadow-lg transition-shadow">
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
            onClick={() => onToggleStatus(user.id, user.isActive)}
            className={`text-sm flex items-center gap-2 ${user.isActive ? 'btn-danger' : 'btn-primary'}`}
            title={user.isActive ? 'Deaktivovat uživatele' : 'Aktivovat uživatele'}
          >
            {user.isActive ? <Trash2 size={16} /> : <CheckCircle size={16} />}
            {user.isActive ? 'Deaktivovat' : 'Aktivovat'}
          </button>
        )}
      </div>
    </div>
  );
}
