import { User, Mail, Shield, Calendar } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

interface ProfileInfoProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <User className="text-gray-400" size={20} />
        <div>
          <p className="text-sm text-gray-600">Jméno a příjmení</p>
          <p className="font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Mail className="text-gray-400" size={20} />
        <div>
          <p className="text-sm text-gray-600">Email</p>
          <p className="font-medium text-gray-900">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Shield className="text-gray-400" size={20} />
        <div>
          <p className="text-sm text-gray-600">Role</p>
          <div className="mt-1">
            <StatusBadge status={user.role as any} type="role" icon={<Shield size={16} />} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Calendar className="text-gray-400" size={20} />
        <div>
          <p className="text-sm text-gray-600">Člen od</p>
          <p className="font-medium text-gray-900">
            {new Date(user.createdAt).toLocaleDateString('cs-CZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
