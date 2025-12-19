import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Tag } from 'lucide-react';
import { getCategoryStyle } from '../utils/eventDefaults';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  totalTickets: number;
  availableTickets: number;
  ticketPrice: number;
  imageUrl?: string;
  status: string;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.event);
    } catch (error) {
      toast.error('Nepodařilo se načíst detail akce');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (!isAuthenticated) {
      toast.error('Pro rezervaci se musíte přihlásit');
      navigate('/login');
      return;
    }

    if (ticketCount < 1 || ticketCount > (event?.availableTickets || 0)) {
      toast.error('Neplatný počet vstupenek');
      return;
    }

    setReserving(true);
    try {
      console.log('Creating reservation:', { eventId: id, ticketCount });
      const response = await api.post('/reservations', {
        eventId: id,
        ticketCount: ticketCount,
      });
      console.log('Reservation created:', response.data);
      
      toast.success('Rezervace byla vytvořena!');
      
      // Pokud je akce zdarma, přesměruj na rezervace, jinak na platbu
      if (Number(event?.ticketPrice) === 0 || response.data.reservation.totalAmount === 0) {
        navigate('/reservations');
      } else {
        navigate(`/reservations/${response.data.reservation.id}/payment`);
      }
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Chyba při vytváření rezervace';
      toast.error(errorMessage);
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Akce nenalezena</h2>
          <button onClick={() => navigate('/events')} className="btn-primary">
            Zpět na akce
          </button>
        </div>
      </div>
    );
  }

  const soldTickets = event.totalTickets - event.availableTickets;
  const soldPercentage = (soldTickets / event.totalTickets) * 100;
  const totalPrice = ticketCount * event.ticketPrice;
  const categoryStyle = getCategoryStyle(event.category);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero obrázek */}
      <div className="rounded-lg overflow-hidden mb-8 shadow-lg">
        {event.imageUrl && !imageError ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-96 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-96 ${categoryStyle.gradient} flex items-center justify-center`}>
            <span className="text-9xl" role="img" aria-label={event.category}>
              {categoryStyle.emoji}
            </span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Hlavní obsah */}
        <div className="md:col-span-2">
          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
              event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
              event.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {event.status === 'PUBLISHED' ? 'Aktivní' :
               event.status === 'CANCELLED' ? 'Zrušeno' :
               event.status}
            </span>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
            
            <div className="flex items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Tag size={20} />
                <span>{event.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span>Organizátor: {event.organizer.name}</span>
              </div>
            </div>
          </div>

          {/* Informace o akci */}
          <div className="card mb-6">
            <h2 className="text-2xl font-bold mb-4">O akci</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Datum a místo */}
          <div className="card mb-6">
            <h2 className="text-2xl font-bold mb-4">Kdy a kde</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="text-primary-600 mt-1" size={24} />
                <div>
                  <p className="font-semibold text-gray-900">Začátek akce</p>
                  <p className="text-gray-600">
                    {new Date(event.startDate).toLocaleString('cs-CZ', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="text-primary-600 mt-1" size={24} />
                <div>
                  <p className="font-semibold text-gray-900">Konec akce</p>
                  <p className="text-gray-600">
                    {new Date(event.endDate).toLocaleString('cs-CZ', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="text-primary-600 mt-1" size={24} />
                <div>
                  <p className="font-semibold text-gray-900">Místo konání</p>
                  <p className="text-gray-600">{event.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kontakt na organizátora */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Kontakt</h2>
            <div>
              <p className="font-semibold text-gray-900">{event.organizer.name}</p>
              <a 
                href={`mailto:${event.organizer.email}`}
                className="text-primary-600 hover:text-primary-700 underline"
              >
                {event.organizer.email}
              </a>
            </div>
          </div>
        </div>

        {/* Rezervační panel */}
        <div className="md:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-2xl font-bold mb-6">Rezervace vstupenek</h2>
            
            {event.status !== 'PUBLISHED' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium">
                  Tato akce není dostupná pro rezervaci.
                </p>
              </div>
            ) : event.availableTickets === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-medium">Vyprodáno</p>
                <p className="text-sm text-yellow-700 mt-2">
                  Všechny vstupenky byly již rezervovány.
                </p>
              </div>
            ) : (
              <>
                {/* Cena */}
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">Cena vstupenky</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Number(event.ticketPrice) === 0 ? 'Zadarmo' : `${Number(event.ticketPrice).toLocaleString('cs-CZ')} Kč`}
                  </p>
                </div>

                {/* Počet vstupenek */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Počet vstupenek
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                      className="btn-secondary px-4 py-2"
                      disabled={ticketCount <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={event.availableTickets}
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Math.max(1, Math.min(event.availableTickets, parseInt(e.target.value) || 1)))}
                      className="input text-center w-20"
                    />
                    <button
                      onClick={() => setTicketCount(Math.min(event.availableTickets, ticketCount + 1))}
                      className="btn-secondary px-4 py-2"
                      disabled={ticketCount >= event.availableTickets}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Dostupných: {event.availableTickets} vstupenek
                  </p>
                </div>

                {/* Celková cena */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Vstupenky ({ticketCount}x)</span>
                    <span className="font-medium">{Number(event.ticketPrice) === 0 ? 'Zadarmo' : `${(Number(event.ticketPrice) * ticketCount).toLocaleString('cs-CZ')} Kč`}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="font-bold text-lg">Celkem</span>
                    <span className="font-bold text-2xl text-primary-600">{Number(totalPrice) === 0 ? 'Zadarmo' : `${Number(totalPrice).toLocaleString('cs-CZ')} Kč`}</span>
                  </div>
                </div>

                {/* Tlačítko rezervace */}
                <button
                  onClick={handleReservation}
                  disabled={reserving}
                  className="btn-primary w-full py-3 text-lg"
                >
                  {reserving ? 'Vytvářím rezervaci...' : 'Rezervovat vstupenky'}
                </button>

                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Pro rezervaci se musíte <a href="/login" className="text-primary-600 underline">přihlásit</a>
                  </p>
                )}
              </>
            )}

            {/* Statistiky */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3 text-gray-900">Obsazenost</h3>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Prodáno {soldTickets}/{event.totalTickets}</span>
                  <span>{soldPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${soldPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
