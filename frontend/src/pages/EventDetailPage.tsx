import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventDetail } from '../hooks/useEventDetail';
import EventHero from '../components/events/EventHero';
import EventInfo from '../components/events/EventInfo';
import EventReservation from '../components/events/EventReservation';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { event, loading, reserving, createReservation, isAuthenticated } = useEventDetail(id);
  const [imageError, setImageError] = useState(false);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <EventHero
        imageUrl={event.imageUrl}
        title={event.title}
        category={event.category}
        imageError={imageError}
        onImageError={() => setImageError(true)}
      />

      <div className="grid md:grid-cols-3 gap-8">
        <EventInfo event={event} />
        <EventReservation
          event={event}
          reserving={reserving}
          isAuthenticated={isAuthenticated}
          onReserve={createReservation}
        />
      </div>
    </div>
  );
}
