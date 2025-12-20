import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages';
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

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  return {
    users,
    loading,
    handleToggleUserStatus,
  };
}
