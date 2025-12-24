import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import MyEventCard from '../components/MyEventCard';
import EventStats from '../components/events/EventStats.tsx';
import EventFilters from '../components/events/EventFilters.tsx';
import { useMyEvents } from '../hooks/useMyEvents';
import { useAuthStore } from '../store/authStore';
import EmptyState from '../components/common/EmptyState';


type FilterType = 'all' | 'PUBLISHED' | 'DRAFT' | 'COMPLETED' | 'CANCELLED';

export default function MyEventsPage() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const { events, loading, handleDeleteEvent, handleStatusChange } = useMyEvents();

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.status === filter);

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

  return (
    <div className="container mx-auto px-4 py-8">
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
        <Link
          to="/events/create"
          className="btn-primary flex items-center gap-2"
          data-testid="create-event-button"
        >
          <Plus size={20} />
          Vytvořit akci
        </Link>
      </div>

      <EventStats events={events} userRole={user?.role} />

      <EventFilters filter={filter} setFilter={setFilter} />

      {filteredEvents.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Calendar size={48} className="text-gray-400" />}
            title={filter === 'all' ? 'Zatím jste nevytvořili žádnou akci.' : 'Žádné akce v této kategorii.'}
            action={
              filter === 'all' ? (
                <Link
                  to="/events/create"
                  className="btn-primary inline-flex items-center gap-2"
                  data-testid="create-first-event-button"
                >
                  <Plus size={20} />
                  Vytvořit první akci
                </Link>
              ) : undefined
            }
          />
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
