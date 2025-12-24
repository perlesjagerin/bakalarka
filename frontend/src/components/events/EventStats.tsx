import { formatPriceStrict } from '../../utils/formatters';

interface Event {
  id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  totalTickets: number;
  availableTickets: number;
  ticketPrice: number;
  confirmedRevenue?: number;
  confirmedTicketsSold?: number;
}

interface EventStatsProps {
  events: Event[];
  userRole?: string;
}

export default function EventStats({ events, userRole }: EventStatsProps) {
  console.log('EventStats received events:', events.length);
  
  const stats = {
    total: events.length,
    published: events.filter(e => e.status === 'PUBLISHED').length,
    draft: events.filter(e => e.status === 'DRAFT').length,
    completed: events.filter(e => e.status === 'COMPLETED').length,
    cancelled: events.filter(e => e.status === 'CANCELLED').length,
    totalRevenue: events.reduce((sum, e) => {
      // Používáme confirmedRevenue z backendu (pouze PAID a CONFIRMED rezervace)
      const revenue = Number(e.confirmedRevenue) || 0;
      console.log(`EventStats: ${e.title} -> confirmedRevenue: ${e.confirmedRevenue}, revenue: ${revenue}, sum: ${sum + revenue}`);
      return sum + revenue;
    }, 0),
  };

  console.log('EventStats - Final totalRevenue:', stats.totalRevenue);

  return (
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
        <p className="text-gray-600 mb-1">{userRole === 'ADMIN' ? 'Celkový příjem všech akcí' : 'Celkový příjem'}</p>
        <p className="text-3xl font-bold text-primary-600">
          {formatPriceStrict(stats.totalRevenue)}
        </p>
      </div>
    </div>
  );
}
