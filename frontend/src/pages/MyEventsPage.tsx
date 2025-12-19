import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import MyEventCard from '../components/MyEventCard';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

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
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  organizer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count: {
    reservations: number;
  };
}

export default function MyEventsPage() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'>('all');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await api.get('/events/my');
      setEvents(response.data.events);
    } catch (error) {
      toast.error('Nepodařilo se načíst vaše akce');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Opravdu chcete smazat tuto akci?')) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      toast.success('Akce byla smazána');
      setEvents(events.filter(e => e.id !== eventId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Chyba při mazání akce');
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    // Confirm pro kritické změny
    if (newStatus === 'CANCELLED') {
      if (!confirm('Opravdu chcete zrušit tuto akci? Všechny rezervace budou stornovány.')) {
        return;
      }
    } else if (newStatus === 'PUBLISHED') {
      if (!confirm('Opravdu chcete publikovat tuto akci? Stane se veřejně dostupnou.')) {
        return;
      }
    }

    try {
      await api.patch(`/events/${eventId}`, { status: newStatus });
      
      const statusMessages: Record<string, string> = {
        'PUBLISHED': 'Akce byla publikována',
        'CANCELLED': 'Akce byla zrušena',
        'COMPLETED': 'Akce byla označena jako proběhlá',
        'DRAFT': 'Akce byla vrácena do konceptů'
      };
      
      toast.success(statusMessages[newStatus] || 'Stav akce byl změněn');
      fetchMyEvents();
    } catch (error: any) {
      console.error('Error changing event status:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Chyba při změně stavu akce';
      toast.error(errorMessage);
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.status === filter);

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      DRAFT: 'Koncept',
      PUBLISHED: 'Publikováno',
      CANCELLED: 'Zrušeno',
      COMPLETED: 'Proběhlo',
    };
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const stats = {
    total: events.length,
    published: events.filter(e => e.status === 'PUBLISHED').length,
    draft: events.filter(e => e.status === 'DRAFT').length,
    completed: events.filter(e => e.status === 'COMPLETED').length,
    cancelled: events.filter(e => e.status === 'CANCELLED').length,
    totalRevenue: events.reduce((sum, e) => {
      // Zajistit, že sold je vždy alespoň 0 (může být záporné kvůli refundacím)
      const sold = Math.max(0, e.totalTickets - e.availableTickets);
      return sum + (sold * e.ticketPrice);
    }, 0),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === 'ADMIN' ? 'Správa všech akcí' : 'Moje akce'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'ADMIN' 
              ? 'Spravujte všechny akce všech organizátorů' 
              : 'Spravujte své události a sledujte prodej vstupenek'}
          </p>
        </div>
        <Link to="/events/create" className="btn-primary flex items-center gap-2" data-testid="create-event-button">
          <Plus size={20} />
          Vytvořit akci
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <p className="text-gray-600 mb-1">Celkem akcí</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 mb-1">Publikováno</p>
          <p className="text-3xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 mb-1">Koncepty</p>
          <p className="text-3xl font-bold text-gray-600">{stats.draft}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 mb-1">Proběhlé</p>
          <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 mb-1">Celkový příjem</p>
          <p className="text-3xl font-bold text-primary-600">{stats.totalRevenue.toLocaleString('cs-CZ')} Kč</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['all', 'PUBLISHED', 'DRAFT', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Vše' : 
             f === 'PUBLISHED' ? 'Publikováno' :
             f === 'DRAFT' ? 'Koncepty' :
             f === 'CANCELLED' ? 'Zrušeno' :
             'Proběhlo'}
          </button>
        ))}
      </div>

      {/* Events list */}
      {filteredEvents.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">
            {filter === 'all' ? 'Zatím jste nevytvořili žádnou akci.' : 'Žádné akce v této kategorii.'}
          </p>
          {filter === 'all' && (
            <Link to="/events/create" className="btn-primary inline-flex items-center gap-2" data-testid="create-first-event-button">
              <Plus size={20} />
              Vytvořit první akci
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <MyEventCard
              key={event.id}
              event={event}
              userRole={user?.role}
              onDelete={handleDeleteEvent}
              onStatusChange={handleStatusChange}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      )}
    </div>
  );
}
