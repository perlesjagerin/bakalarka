interface User {
  id: string;
  role: 'USER' | 'ORGANIZER' | 'ADMIN';
}

interface UserStatsProps {
  users: User[];
}

export default function UserStats({ users }: UserStatsProps) {
  const stats = {
    total: users.length,
    users: users.filter(u => u.role === 'USER').length,
    organizers: users.filter(u => u.role === 'ORGANIZER').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
  };

  return (
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
  );
}
