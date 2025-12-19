import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Calendar, Shield, Edit2, Save, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  lastName: z.string().min(2, 'Příjmení musí mít alespoň 2 znaky'),
  email: z.string().email('Neplatný email'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
  newPassword: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
  confirmPassword: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Hesla se neshodují",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
      });
    }
  }, [user, resetProfile]);

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      };
      
      console.log('🚀 Sending to backend:', payload);
      
      const response = await api.patch('/users/profile', payload);
      
      console.log('✅ Backend response:', response.data);
      
      toast.success('Profil byl aktualizován');
      
      // Update user in store with response from backend
      if (response.data.user) {
        setUser(response.data.user);
      }
      
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Chyba při aktualizaci profilu');
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      await api.patch('/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Heslo bylo změněno');
      resetPassword();
      setIsChangingPassword(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Chyba při změně hesla');
    }
  };

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
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badges[role as keyof typeof badges]}`}>
        <Shield size={16} />
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center">
          <p className="text-gray-600">Načítání profilu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Můj profil</h1>

        {/* Základní informace */}
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Osobní údaje</h2>
              <p className="text-gray-600">Upravte své informace</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit2 size={16} />
                Upravit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Jméno *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    {...registerProfile('firstName')}
                    type="text"
                    className={`input pl-10 ${profileErrors.firstName ? 'border-red-500' : ''}`}
                  />
                </div>
                {profileErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Příjmení
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    {...registerProfile('lastName')}
                    type="text"
                    className={`input pl-10 ${profileErrors.lastName ? 'border-red-500' : ''}`}
                  />
                </div>
                {profileErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    {...registerProfile('email')}
                    type="email"
                    className={`input pl-10 ${profileErrors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {profileErrors.email && (
                  <p className="text-red-600 text-sm mt-1">{profileErrors.email.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save size={16} />
                  {isSubmittingProfile ? 'Ukládám...' : 'Uložit změny'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    resetProfile();
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X size={16} />
                  Zrušit
                </button>
              </div>
            </form>
          ) : (
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
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
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
          )}
        </div>

        {/* Změna hesla */}
        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Zabezpečení</h2>
              <p className="text-gray-600">Změňte své heslo</p>
            </div>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="btn-secondary"
              >
                Změnit heslo
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Současné heslo *
                </label>
                <input
                  {...registerPassword('currentPassword')}
                  type="password"
                  className={`input ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-600 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Nové heslo *
                </label>
                <input
                  {...registerPassword('newPassword')}
                  type="password"
                  className={`input ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-600 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Potvrzení nového hesla *
                </label>
                <input
                  {...registerPassword('confirmPassword')}
                  type="password"
                  className={`input ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="btn-primary"
                >
                  {isSubmittingPassword ? 'Měním heslo...' : 'Změnit heslo'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    resetPassword();
                  }}
                  className="btn-secondary"
                >
                  Zrušit
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600">
              Klikněte na tlačítko "Změnit heslo" pro nastavení nového hesla.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
