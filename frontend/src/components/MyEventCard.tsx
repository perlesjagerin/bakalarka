import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Edit, Trash2, Eye } from 'lucide-react';
import { getCategoryStyle } from '../utils/eventDefaults';
import StatusBadge from './common/StatusBadge';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  status: string;
  totalTickets: number;
  availableTickets: number;
  ticketPrice: number;
  imageUrl?: string | null;
  organizer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface MyEventCardProps {
  event: Event;
  userRole?: string;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

export default function MyEventCard({ event, userRole, onDelete, onStatusChange }: MyEventCardProps) {
  const [imageError, setImageError] = useState(false);
  const categoryStyle = getCategoryStyle(event.category);
  
  const soldTickets = Math.max(0, event.totalTickets - event.availableTickets);
  const soldPercentage = event.totalTickets > 0 ? (soldTickets / event.totalTickets) * 100 : 0;
  const revenue = soldTickets * event.ticketPrice;

  // Určit dostupné stavy podle aktuálního stavu
  const getAvailableStatusTransitions = () => {
    switch (event.status) {
      case 'DRAFT':
        return [
          { value: 'PUBLISHED', label: 'Publikovat' }
        ];
      case 'PUBLISHED':
        return [
          { value: 'COMPLETED', label: 'Označit jako proběhlo' },
          { value: 'CANCELLED', label: 'Zrušit akci' }
        ];
      case 'CANCELLED':
        return [
          { value: 'DRAFT', label: 'Vrátit do konceptů' }
        ];
      case 'COMPLETED':
        return [];
      default:
        return [];
    }
  };

  const availableTransitions = getAvailableStatusTransitions();

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image */}
        <div className="md:w-48 h-32 flex-shrink-0">
          {event.imageUrl && !imageError ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full ${categoryStyle.gradient} rounded-lg flex items-center justify-center`}>
              <span className="text-6xl" role="img" aria-label={event.category}>
                {categoryStyle.emoji}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h3>
              {userRole === 'ADMIN' && event.organizer && (
                <p className="text-sm text-gray-600 mb-1">
                  Organizátor: {event.organizer.firstName} {event.organizer.lastName} ({event.organizer.email})
                </p>
              )}
              <StatusBadge status={event.status as any} type="event" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} />
              <span>{new Date(event.startDate).toLocaleDateString('cs-CZ')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={16} />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={16} />
              <span>{soldTickets} / {event.totalTickets}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign size={16} />
              <span>{event.ticketPrice} Kč</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Prodáno vstupenek</div>
              <div className="text-xl font-bold text-blue-600">{soldTickets}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ width: `${soldPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Celkový výnos</div>
              <div className="text-xl font-bold text-green-600">
                {revenue.toLocaleString('cs-CZ')} Kč
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Link 
              to={`/events/${event.id}`}
              className="btn-secondary flex items-center gap-2"
            >
              <Eye size={16} />
              Detail
            </Link>
            <Link 
              to={`/events/${event.id}/edit`}
              className="btn-primary flex items-center gap-2"
            >
              <Edit size={16} />
              Upravit
            </Link>
            
            {/* Změna stavu */}
            {availableTransitions.length > 0 && (
              <div className="flex gap-2">
                {availableTransitions.map((transition) => (
                  <button
                    key={transition.value}
                    onClick={() => onStatusChange(event.id, transition.value)}
                    className={`btn-sm flex items-center gap-1 ${
                      transition.value === 'PUBLISHED' ? 'bg-green-600 hover:bg-green-700 text-white' :
                      transition.value === 'CANCELLED' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                      transition.value === 'COMPLETED' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                      'bg-gray-600 hover:bg-gray-700 text-white'
                    } px-3 py-1.5 rounded-lg transition-colors`}
                  >
                    {transition.label}
                  </button>
                ))}
              </div>
            )}
            
            {/* Zrušit akci - pouze pro drafty (zrušené už zrušené být nemohou) */}
            {event.status === 'DRAFT' && (
              <button
                onClick={() => onDelete(event.id)}
                className="btn-danger flex items-center gap-2"
              >
                <Trash2 size={16} />
                Zrušit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
