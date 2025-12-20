import { formatDate, formatPrice } from '../../utils/formatters';

interface Reservation {
  reservationCode: string;
  ticketCount: number;
  totalAmount: number;
  event: {
    title: string;
    startDate: string;
    location: string;
  };
}

interface PaymentSummaryProps {
  reservation: Reservation;
}

export default function PaymentSummary({ reservation }: PaymentSummaryProps) {
  return (
    <div className="card mb-8">
      <h2 className="text-xl font-bold mb-4">Shrnutí objednávky</h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Rezervační kód:</span>
          <span className="font-mono font-semibold">{reservation.reservationCode}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Akce:</span>
          <span className="font-medium">{reservation.event.title}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Datum:</span>
          <span>{formatDate(reservation.event.startDate)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Místo:</span>
          <span>{reservation.event.location}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Počet vstupenek:</span>
          <span>{reservation.ticketCount}x</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">Celková cena:</span>
          <span className="text-2xl font-bold text-primary-600">
            {formatPrice(Number(reservation.totalAmount))}
          </span>
        </div>
      </div>
    </div>
  );
}
