import { useState } from 'react';
import api from '../lib/axios';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages';
import { showErrorToast, showSuccessToast } from '../utils/errorHandling';
import { useAuthStore } from '../store/authStore';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
}

export const useProfile = () => {
  const { setUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = async (data: ProfileData) => {
    setIsUpdating(true);
    try {
      const response = await api.patch('/users/profile', data);
      showSuccessToast(SUCCESS_MESSAGES.PROFILE_UPDATED);
      
      if (response.data.user) {
        setUser(response.data.user);
      }
      
      return true;
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.UPDATE_PROFILE_ERROR);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const changePassword = async (data: PasswordData) => {
    setIsUpdating(true);
    try {
      await api.patch('/users/password', data);
      showSuccessToast(SUCCESS_MESSAGES.PASSWORD_CHANGED);
      return true;
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.CHANGE_PASSWORD_ERROR);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProfile,
    changePassword,
    isUpdating,
  };
};
