import { formatPriceStrict } from '../../utils/formatters';

interface Reservation {
  id: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  totalAmount: number;
}

interface ReservationStatsProps {
  reservations: Reservation[];
}

export default function ReservationStats({ reservations }: ReservationStatsProps) {
  const paidCount = reservations.filter(r => r.status === 'PAID').length;
  const pendingCount = reservations.filter(r => r.status === 'PENDING').length;
  const totalSpent = reservations
    .filter(r => r.status === 'PAID')
    .reduce((sum, r) => sum + Number(r.totalAmount), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="card">
        <p className="text-gray-600 mb-1">Celkem</p>
        <p className="text-3xl font-bold text-gray-900">{reservations.length}</p>
      </div>
      <div className="card">
        <p className="text-gray-600 mb-1">Zaplaceno</p>
        <p className="text-3xl font-bold text-green-600">{paidCount}</p>
      </div>
      <div className="card">
        <p className="text-gray-600 mb-1">Čeká na platbu</p>
        <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
      </div>
      <div className="card">
        <p className="text-gray-600 mb-1">Celková útrata</p>
        <p className="text-3xl font-bold text-primary-600">
          {formatPriceStrict(totalSpent)}
        </p>
      </div>
    </div>
  );
}
