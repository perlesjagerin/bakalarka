import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { User, Mail, Save, X } from 'lucide-react';
import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  lastName: z.string().min(2, 'Příjmení musí mít alespoň 2 znaky'),
  email: z.string().email('Neplatný email'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function ProfileEditForm({ 
  register, 
  errors, 
  isSubmitting, 
  onCancel 
}: ProfileEditFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Jméno *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            {...register('firstName')}
            type="text"
            className={`input pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Příjmení
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            {...register('lastName')}
            type="text"
            className={`input pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.lastName && (
          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Email *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            {...register('email')}
            type="email"
            className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={16} />
          {isSubmitting ? 'Ukládám...' : 'Uložit změny'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex items-center gap-2"
        >
          <X size={16} />
          Zrušit
        </button>
      </div>
    </div>
  );
}
