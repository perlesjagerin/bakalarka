import { useState } from 'react';
import { Calendar, MapPin, Ticket, Download } from 'lucide-react';
import { getCategoryStyle } from '../../utils/eventDefaults';
import { formatDateLong, formatDateTime, formatPrice } from '../../utils/formatters';

interface Reservation {
  id: string;
  reservationCode: string;
  ticketCount: number;
  totalAmount: number;
  status: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    category: string;
    imageUrl?: string;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
    paidAt: string;
  };
}

interface ReservationDetailsProps {
  reservation: Reservation;
  onDownloadTicket: () => void;
  onViewReservations: () => void;
}

export default function ReservationDetails({
  reservation,
  onDownloadTicket,
  onViewReservations,
}: ReservationDetailsProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="card mb-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Rezervace potvrzena</h2>
          <p className="text-gray-600">
            Kód: <span className="font-mono font-semibold">{reservation.reservationCode}</span>
          </p>
        </div>
        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          Zaplaceno
        </span>
      </div>

      {/* Event info */}
      <div className="mb-6">
        {reservation.event.imageUrl && !imageError ? (
          <img
            src={reservation.event.imageUrl}
            alt={reservation.event.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`w-full h-48 ${getCategoryStyle(reservation.event.category).gradient} rounded-lg mb-4 flex items-center justify-center`}
          >
            <span className="text-8xl" role="img" aria-label={reservation.event.category}>
              {getCategoryStyle(reservation.event.category).emoji}
            </span>
          </div>
        )}
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {reservation.event.title}
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar size={20} />
            <div>
              <p className="font-medium text-gray-900">
                {formatDateLong(reservation.event.startDate)}
              </p>
              <p className="text-sm">
                {new Date(reservation.event.startDate).toLocaleTimeString('cs-CZ', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' - '}
                {new Date(reservation.event.endDate).toLocaleTimeString('cs-CZ', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <MapPin size={20} />
            <span>{reservation.event.location}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <Ticket size={20} />
            <span>{reservation.ticketCount}x vstupenka</span>
          </div>
        </div>
      </div>

      {/* Payment info */}
      {reservation.payment && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-3">Platební údaje</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Částka:</span>
              <span className="font-medium">
                {formatPrice(Number(reservation.payment.amount))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Zaplaceno:</span>
              <span className="font-medium">
                {reservation.payment.paidAt
                  ? formatDateTime(reservation.payment.paidAt)
                  : 'Právě teď'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ID platby:</span>
              <span className="font-mono text-xs">{reservation.payment.id}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onDownloadTicket}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <Download size={20} />
          Stáhnout vstupenku
        </button>
        <button onClick={onViewReservations} className="btn-secondary flex-1">
          Moje rezervace
        </button>
      </div>
    </div>
  );
}
