import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { getCategoryStyle } from '../utils/eventDefaults';
import { formatPrice } from '../utils/formatters';


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
}

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  const [imageError, setImageError] = useState(false);
  const categoryStyle = getCategoryStyle(event.category);
  
  return (
    <Link to={`/events/${event.id}`} className="card hover:shadow-xl transition-shadow" data-testid="event-card">
      {event.imageUrl && !imageError ? (
        <img
          src={event.imageUrl}
          alt={event.title}
          width="400"
          height="192"
          loading="lazy"
          className="w-full h-48 object-cover rounded-lg mb-4"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`w-full h-48 ${categoryStyle.gradient} rounded-lg mb-4 flex items-center justify-center`}>
          <span className="text-8xl" role="img" aria-label={event.category}>
            {categoryStyle.emoji}
          </span>
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
            {event.category}
          </span>
        </div>

        <p className="text-gray-600 line-clamp-2">{event.description}</p>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar size={16} />
            <span>
              {format(new Date(event.startDate), 'PPP', { locale: cs })}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Ticket size={16} />
            <span>
              Volných: {event.availableTickets} / {event.totalTickets}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-2xl font-bold text-primary-600">
            {formatPrice(Number(event.ticketPrice))}
          </span>
          <button className="btn-primary">
            Zobrazit detail
          </button>
        </div>
      </div>
    </Link>
  );
}

export default memo(EventCard);
