import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Calendar, MapPin } from 'lucide-react';
import { EventFormData } from '../../types/eventForm';

interface EventFormDateTimeProps {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
}

export default function EventFormDateTime({ register, errors }: EventFormDateTimeProps) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Datum a místo</h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Začátek akce *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            {...register('startDate')}
            type="datetime-local"
            className={`input pl-10 ${errors.startDate ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.startDate && (
          <p className="text-red-600 text-sm mt-1">{errors.startDate.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Konec akce *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            {...register('endDate')}
            type="datetime-local"
            className={`input pl-10 ${errors.endDate ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.endDate && (
          <p className="text-red-600 text-sm mt-1">{errors.endDate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Místo konání *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            {...register('location')}
            type="text"
            placeholder="Např. Lucerna Music Bar, Praha"
            className={`input pl-10 ${errors.location ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.location && (
          <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
        )}
      </div>
    </div>
  );
}
