import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Download, X, AlertCircle, Edit } from 'lucide-react';
import { getCategoryStyle } from '../utils/eventDefaults';
import StatusBadge from './common/StatusBadge';
import { formatDateLong, formatDateTime, formatPrice } from '../utils/formatters';


interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  ticketPrice: number;
  imageUrl?: string | null;
  availableTickets: number;
}

interface Payment {
  paidAt?: string;
}

interface Reservation {
  id: string;
  reservationCode: string;
  ticketCount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  event: Event;
  payment?: Payment;
}

interface ReservationCardProps {
  reservation: Reservation;
  onCancel: (id: string) => void;
  downloadTicket: (reservation: any) => void;
  editingReservationId: string | null;
  newTicketCount: number;
  setNewTicketCount: (count: number) => void;
  handleUpdateReservation: (id: string) => void;
  handleCancelEdit: () => void;
  handleEditReservation: (reservation: any) => void;
}

function ReservationCard({ 
  reservation, 
  onCancel, 
  downloadTicket,
  editingReservationId,
  newTicketCount,
  setNewTicketCount,
  handleUpdateReservation,
  handleCancelEdit,
  handleEditReservation
}: ReservationCardProps) {
  const [imageError, setImageError] = useState(false);
  const categoryStyle = getCategoryStyle(reservation.event.category);

  const isUpcoming = new Date(reservation.event.startDate) > new Date();
  const isPast = new Date(reservation.event.endDate) < new Date();
  const canCancel = (reservation.status === 'PAID' || reservation.status === 'CONFIRMED') && isUpcoming;
  const canPay = reservation.status === 'PENDING';

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image */}
        <div className="md:w-48 h-32 flex-shrink-0">
          {reservation.event.imageUrl && !imageError ? (
            <img
              src={reservation.event.imageUrl}
              alt={reservation.event.title}
              className="w-full h-full object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full ${categoryStyle.gradient} rounded-lg flex items-center justify-center`}>
              <span className="text-6xl" role="img" aria-label={reservation.event.category}>
                {categoryStyle.emoji}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <div>
              <Link 
                to={`/events/${reservation.event.id}`}
                className="text-xl font-bold text-gray-900 hover:text-primary-600 mb-1 block"
              >
                {reservation.event.title}
              </Link>
              <StatusBadge status={reservation.status as any} type="reservation" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} />
              <div>
                <p className="font-medium">{formatDateLong(reservation.event.startDate)}</p>
                <p className="text-xs">
                  {new Date(reservation.event.startDate).toLocaleTimeString('cs-CZ', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={16} />
              <span>{reservation.event.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Ticket size={16} />
              {editingReservationId === reservation.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={reservation.event.availableTickets}
                    value={newTicketCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setNewTicketCount(value);
                    }}
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                  />
                  <span>x vstupenka (max {reservation.event.availableTickets})</span>
                </div>
              ) : (
                <span>{reservation.ticketCount}x vstupenka</span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {reservation.reservationCode}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-4">
            <p className="text-2xl font-bold text-primary-600">
              {editingReservationId === reservation.id 
                ? formatPrice(Math.round(newTicketCount * (Number(reservation.totalAmount) / reservation.ticketCount)))
                : formatPrice(Number(reservation.totalAmount))}
            </p>
            {reservation.payment && reservation.status === 'PAID' && reservation.payment.paidAt && (
              <p className="text-sm text-gray-500">
                Zaplaceno {formatDateTime(reservation.payment.paidAt)}
              </p>
            )}
          </div>

          {/* Status info */}
          {isPast && (reservation.status === 'PAID' || reservation.status === 'CONFIRMED') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm">
              <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-blue-800">Tato akce již proběhla.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {editingReservationId === reservation.id ? (
              <>
                <button
                  onClick={() => handleUpdateReservation(reservation.id)}
                  className="btn-primary text-sm"
                >
                  Uložit změny
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="btn-secondary text-sm"
                >
                  Zrušit úpravy
                </button>
              </>
            ) : (
              <>
                {canPay && (
                  <>
                    <Link
                      to={`/reservations/${reservation.id}/payment`}
                      className="btn-primary text-sm"
                    >
                      Zaplatit
                    </Link>
                    <button
                      onClick={() => handleEditReservation(reservation)}
                      className="btn-secondary text-sm flex items-center gap-1"
                    >
                      <Edit size={16} />
                      Upravit počet vstupenek
                    </button>
                  </>
                )}
                
                {(reservation.status === 'PAID' || reservation.status === 'CONFIRMED') && (
                  <>
                    <button
                      onClick={() => downloadTicket(reservation)}
                      className="btn-secondary text-sm flex items-center gap-1"
                    >
                      <Download size={16} />
                      Stáhnout vstupenku
                    </button>
                    <Link
                      to={`/complaints?reservationId=${reservation.id}`}
                      className="btn-secondary text-sm flex items-center gap-1"
                    >
                      <AlertCircle size={16} />
                      Podat reklamaci
                    </Link>
                  </>
                )}
                
                <Link
                  to={`/events/${reservation.event.id}`}
                  className="btn-secondary text-sm"
                >
                  Detail akce
                </Link>
                
                {canCancel && (
                  <button
                    onClick={() => onCancel(reservation.id)}
                    className="btn-danger text-sm flex items-center gap-1"
                    data-testid="cancel-reservation"
                  >
                    <X size={16} />
                    Zrušit rezervaci
                  </button>
                )}

                {canPay && (
                  <button
                    onClick={() => onCancel(reservation.id)}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <X size={16} />
                    Zrušit
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ReservationCard);
