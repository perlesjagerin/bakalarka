import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Users, DollarSign } from 'lucide-react';
import { EventFormData } from '../../types/eventForm';

interface EventFormTicketsProps {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  showCapacityWarning?: boolean;
}

export default function EventFormTickets({ 
  register, 
  errors,
  showCapacityWarning = false 
}: EventFormTicketsProps) {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Vstupenky</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Celková kapacita *
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              {...register('totalTickets')}
              type="number"
              min="1"
              placeholder="100"
              className={`input pl-10 ${errors.totalTickets ? 'border-red-500' : ''}`}
              data-testid="event-total-tickets-input"
            />
          </div>
          {errors.totalTickets && (
            <p className="text-red-600 text-sm mt-1">{errors.totalTickets.message}</p>
          )}
          {showCapacityWarning && (
            <p className="text-sm text-gray-500 mt-1">
              Pozor: snížení kapacity může ovlivnit existující rezervace
            </p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Cena vstupenky (Kč) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              {...register('ticketPrice')}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              className={`input pl-10 ${errors.ticketPrice ? 'border-red-500' : ''}`}
              data-testid="event-ticket-price-input"
            />
          </div>
          {errors.ticketPrice && (
            <p className="text-red-600 text-sm mt-1">{errors.ticketPrice.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
