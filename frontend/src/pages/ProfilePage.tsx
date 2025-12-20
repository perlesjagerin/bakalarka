import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProfile } from '../hooks/useProfile';
import ProfileInfo from '../components/profile/ProfileInfo';
import ProfileEditForm, { profileSchema, ProfileFormData } from '../components/profile/ProfileEditForm';
import PasswordForm, { passwordSchema, PasswordFormData } from '../components/profile/PasswordForm';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { updateProfile, changePassword } = useProfile();
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
    const success = await updateProfile(data);
    if (success) {
      setIsEditing(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    const success = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    if (success) {
      resetPassword();
      setIsChangingPassword(false);
    }
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

        {/* Osobní údaje */}
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
            <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
              <ProfileEditForm
                register={registerProfile}
                errors={profileErrors}
                isSubmitting={isSubmittingProfile}
                onCancel={() => {
                  setIsEditing(false);
                  resetProfile();
                }}
              />
            </form>
          ) : (
            <ProfileInfo user={user!} />
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
            <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
              <PasswordForm
                register={registerPassword}
                errors={passwordErrors}
                isSubmitting={isSubmittingPassword}
                onCancel={() => {
                  setIsChangingPassword(false);
                  resetPassword();
                }}
              />
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
