import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditEvent } from '../hooks/useEditEvent';
import EventFormBasicInfo from '../components/events/EventFormBasicInfo';
import EventFormDateTime from '../components/events/EventFormDateTime';
import EventFormTickets from '../components/events/EventFormTickets';
import { EventFormData } from '../types/eventForm';

const eventSchema = z.object({
  title: z.string().min(3, 'Název musí mít alespoň 3 znaky'),
  description: z.string().min(20, 'Popis musí mít alespoň 20 znaků'),
  location: z.string().min(3, 'Místo je povinné'),
  startDate: z.string().min(1, 'Datum začátku je povinné'),
  endDate: z.string().min(1, 'Datum konce je povinné'),
  category: z.string().min(1, 'Kategorie je povinná'),
  totalTickets: z.coerce.number().int().positive('Kapacita musí být kladné číslo'),
  ticketPrice: z.coerce.number().nonnegative('Cena nemůže být záporná'),
  imageUrl: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'Neplatná URL'
  }),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
});

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const { updateEvent } = useEditEvent(id, reset);

  const onSubmit = async (data: EventFormData) => {
    await updateEvent(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upravit akci</h1>
          <p className="text-gray-600">Aktualizujte informace o vaší akci</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <EventFormBasicInfo 
            register={register} 
            errors={errors}
            showStatus={true}
          />
          
          <EventFormDateTime 
            register={register} 
            errors={errors}
          />
          
          <EventFormTickets 
            register={register} 
            errors={errors}
            showCapacityWarning={true}
          />

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'Ukládám...' : 'Uložit změny'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-events')}
              className="btn-secondary"
            >
              Zrušit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
