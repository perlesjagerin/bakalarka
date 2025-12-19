import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Users, DollarSign, FileText, Image } from 'lucide-react';
import { EVENT_CATEGORIES } from '../constants/categories';

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

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const navigate = useNavigate();
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

  const onSubmit = async (data: EventFormData) => {
    try {
      console.log('Creating event with data:', data);
      
      // Připravit data - neposlat imageUrl pokud je prázdná
      const eventData: any = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      
      // Odstranit imageUrl pokud je prázdná
      if (!eventData.imageUrl || eventData.imageUrl.trim() === '') {
        delete eventData.imageUrl;
      }
      
      const response = await api.post('/events', eventData);
      console.log('Event created successfully:', response.data);
      
      toast.success('Akce byla vytvořena!');
      navigate(`/events/${response.data.event.id}`);
    } catch (error: any) {
      console.error('Error creating event:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Chyba při vytváření akce';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vytvořit novou akci</h1>
        <p className="text-gray-600 mb-8">Vyplňte informace o vaší akci</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Základní informace */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Základní informace</h2>
            
            {/* Název */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Název akce *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  {...register('title')}
                  type="text"
                  placeholder="Např. Letní hudební festival"
                  className={`input pl-10 ${errors.title ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Popis */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Popis akce *
              </label>
              <textarea
                {...register('description')}
                rows={5}
                placeholder="Podrobný popis vaší akce..."
                className={`input ${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Kategorie */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Kategorie *
              </label>
              <select
                {...register('category')}
                className={`input ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="">Vyberte kategorii</option>
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Obrázek */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                URL obrázku
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  {...register('imageUrl')}
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className={`input pl-10 ${errors.imageUrl ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.imageUrl && (
                <p className="text-red-600 text-sm mt-1">{errors.imageUrl.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Zatím podporujeme pouze URL obrázků. Upload bude přidán později.
              </p>
            </div>
          </div>

          {/* Datum a místo */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Datum a místo</h2>

            {/* Datum začátku */}
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

            {/* Datum konce */}
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

            {/* Místo */}
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

          {/* Vstupenky a cena */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Vstupenky</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Kapacita */}
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
                  />
                </div>
                {errors.totalTickets && (
                  <p className="text-red-600 text-sm mt-1">{errors.totalTickets.message}</p>
                )}
              </div>

              {/* Cena */}
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
                  />
                </div>
                {errors.ticketPrice && (
                  <p className="text-red-600 text-sm mt-1">{errors.ticketPrice.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Pro bezplatné akce zadejte 0
                </p>
              </div>
            </div>
          </div>

          {/* Tlačítka */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'Vytvářím...' : 'Vytvořit akci (jako koncept)'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-events')}
              className="btn-secondary"
            >
              Zrušit
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
