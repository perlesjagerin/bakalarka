import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEvent } from '../hooks/useCreateEvent';
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
});

export default function CreateEventPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      ticketPrice: 0,
      imageUrl: '',
    },
  });

  const { createEvent } = useCreateEvent();

  const onSubmit = async (data: EventFormData) => {
    await createEvent(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vytvořit novou akci</h1>
        <p className="text-gray-600 mb-8">Vyplňte informace o vaší akci</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <EventFormBasicInfo 
            register={register} 
            errors={errors}
          />
          
          <EventFormDateTime 
            register={register} 
            errors={errors}
          />
          
          <EventFormTickets 
            register={register} 
            errors={errors}
          />

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
              data-testid="create-event-submit-button"
            >
              {isSubmitting ? 'Vytvářím...' : 'Vytvořit akci (jako koncept)'}
            </button>
          </div>

          <p className="text-sm text-gray-500 text-center">
            * Povinná pole. Akce bude vytvořena jako koncept a můžete ji publikovat později.
          </p>
        </form>
      </div>
    </div>
  );
}
