import { Tag, Users, Calendar, Clock, MapPin } from 'lucide-react';

interface Event {
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  startDate: string;
  endDate: string;
  organizer: {
    name: string;
    email: string;
  };
}

interface EventInfoProps {
  event: Event;
}

export default function EventInfo({ event }: EventInfoProps) {
  return (
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

      <div className="card mb-6">
        <h2 className="text-2xl font-bold mb-4">O akci</h2>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
          {event.description}
        </p>
      </div>

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
  );
}
