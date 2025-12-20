import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { z } from 'zod';

export const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
  newPassword: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
  confirmPassword: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Hesla se neshodují",
  path: ["confirmPassword"],
});

export type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordFormProps {
  register: UseFormRegister<PasswordFormData>;
  errors: FieldErrors<PasswordFormData>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function PasswordForm({ 
  register, 
  errors, 
  isSubmitting, 
  onCancel 
}: PasswordFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Současné heslo *
        </label>
        <input
          {...register('currentPassword')}
          type="password"
          className={`input ${errors.currentPassword ? 'border-red-500' : ''}`}
        />
        {errors.currentPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.currentPassword.message}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Nové heslo *
        </label>
        <input
          {...register('newPassword')}
          type="password"
          className={`input ${errors.newPassword ? 'border-red-500' : ''}`}
        />
        {errors.newPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Potvrzení nového hesla *
        </label>
        <input
          {...register('confirmPassword')}
          type="password"
          className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? 'Měním heslo...' : 'Změnit heslo'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Zrušit
        </button>
      </div>
    </div>
  );
}
