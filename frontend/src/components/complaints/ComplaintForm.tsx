import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { XCircle, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../../constants/messages';

export const complaintSchema = z.object({
  reservationId: z.string().min(1, VALIDATION_MESSAGES.REQUIRED_FIELD),
  reason: z.string().min(1, VALIDATION_MESSAGES.REQUIRED_FIELD),
  description: z.string().min(20, VALIDATION_MESSAGES.MIN_DESCRIPTION_LENGTH),
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;

const complaintReasons = [
  'Akce byla zrušena',
  'Akce nesplnila očekávání',
  'Technické problémy',
  'Špatná kvalita služeb',
  'Chybné informace o akci',
  'Jiný důvod',
];

interface Reservation {
  id: string;
  reservationCode: string;
  event: {
    title: string;
  };
}

interface ComplaintFormProps {
  register: UseFormRegister<ComplaintFormData>;
  errors: FieldErrors<ComplaintFormData>;
  isSubmitting: boolean;
  reservations: Reservation[];
  onCancel: () => void;
}

export default function ComplaintForm({
  register,
  errors,
  isSubmitting,
  reservations,
  onCancel,
}: ComplaintFormProps) {
  return (
    <div className="card mb-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold">Nová reklamace</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <XCircle size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Vyberte rezervaci *
          </label>
          <select
            {...register('reservationId')}
            className={`input ${errors.reservationId ? 'border-red-500' : ''}`}
          >
            <option value="">-- Vyberte rezervaci --</option>
            {reservations.map((reservation) => (
              <option key={reservation.id} value={reservation.id}>
                {reservation.reservationCode} - {reservation.event.title}
              </option>
            ))}
          </select>
          {errors.reservationId && (
            <p className="text-red-600 text-sm mt-1">{errors.reservationId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Důvod reklamace *
          </label>
          <select
            {...register('reason')}
            className={`input ${errors.reason ? 'border-red-500' : ''}`}
          >
            <option value="">-- Vyberte důvod --</option>
            {complaintReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          {errors.reason && (
            <p className="text-red-600 text-sm mt-1">{errors.reason.message}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Detailní popis *
          </label>
          <textarea
            {...register('description')}
            rows={5}
            placeholder="Popište podrobně váš problém..."
            className={`input ${errors.description ? 'border-red-500' : ''}`}
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Prosím uveďte co nejvíce informací pro rychlejší vyřízení
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informace o reklamaci</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Reklamace bude vyřízena do 14 dnů</li>
              <li>Budete informováni o průběhu emailem</li>
              <li>V případě schválení bude provedena refundace</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Odesílám...' : 'Podat reklamaci'}
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
    </div>
  );
}
