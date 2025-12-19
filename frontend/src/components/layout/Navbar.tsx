import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Ticket, User, LogOut, Calendar, FileText, MessageSquare, Users } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-primary-600">
            <Ticket size={28} />
            <span>StudentTickets</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/events" className="text-gray-700 hover:text-primary-600 font-medium">
              Akce
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/reservations"
                  className="text-gray-700 hover:text-primary-600 font-medium flex items-center space-x-1"
                >
                  <Calendar size={18} />
                  <span>Moje rezervace</span>
                </Link>

                {user?.role === 'ADMIN' ? (
                  <Link
                    to="/admin/complaints"
                    className="text-gray-700 hover:text-primary-600 font-medium flex items-center space-x-1"
                  >
                    <MessageSquare size={18} />
                    <span>Správa reklamací</span>
                  </Link>
                ) : (
                  <Link
                    to="/complaints"
                    className="text-gray-700 hover:text-primary-600 font-medium flex items-center space-x-1"
                  >
                    <MessageSquare size={18} />
                    <span>Moje reklamace</span>
                  </Link>
                )}

                {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
                  <Link
                    to="/my-events"
                    className="text-gray-700 hover:text-primary-600 font-medium flex items-center space-x-1"
                  >
                    <FileText size={18} />
                    <span>{user?.role === 'ADMIN' ? 'Správa akcí' : 'Moje akce'}</span>
                  </Link>
                )}

                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin/users"
                    className="text-gray-700 hover:text-primary-600 font-medium flex items-center space-x-1"
                  >
                    <Users size={18} />
                    <span>Správa uživatelů</span>
                  </Link>
                )}

                <div className="flex items-center space-x-3">
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary-600 font-medium flex items-center space-x-1"
                  >
                    <User size={18} />
                    <span>{user?.firstName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 font-medium flex items-center space-x-1"
                  >
                    <LogOut size={18} />
                    <span>Odhlásit</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                  Přihlásit se
                </Link>
                <Link to="/register" className="btn-primary">
                  Registrace
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
