import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, Calendar, MapPin, Ticket } from 'lucide-react';
import { getCategoryStyle } from '../utils/eventDefaults';
import api from '../lib/axios';
import { ERROR_MESSAGES } from '../constants/messages';
import { showErrorToast } from '../utils/errorHandling';

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

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reservationId = searchParams.get('reservationId');

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!reservationId) {
      showErrorToast(ERROR_MESSAGES.INVALID_RESERVATION);
      navigate('/reservations');
      return;
    }

    fetchReservation();
  }, [reservationId]);

  const fetchReservation = async () => {
    try {
      const response = await api.get(`/reservations/${reservationId}`);
      setReservation(response.data.reservation);
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.LOAD_RESERVATIONS_ERROR);
      navigate('/reservations');
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async () => {
    if (!reservation) return;

    try {
      const response = await api.get(`/tickets/download/${reservation.id}`, {
        responseType: 'blob',
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vstupenka-${reservation.reservationCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Vstupenka byla stažena');
    } catch (error) {
      showErrorToast(error, 'Chyba při stahování vstupenky');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Platba byla úspěšná!
          </h1>
          <p className="text-gray-600">
            Vaše rezervace byla potvrzena. Potvrzení jsme vám zaslali na e-mail.
          </p>
        </div>

        {/* Reservation details */}
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
                    {new Date(reservation.event.startDate).toLocaleDateString('cs-CZ', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
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
                  <span className="font-medium">{Number(reservation.payment.amount) === 0 ? 'Zadarmo' : `${Number(reservation.payment.amount).toLocaleString('cs-CZ')} Kč`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zaplaceno:</span>
                  <span className="font-medium">
                    {reservation.payment.paidAt 
                      ? new Date(reservation.payment.paidAt).toLocaleString('cs-CZ')
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
              onClick={downloadTicket}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Stáhnout vstupenku
            </button>
            <button
              onClick={() => navigate('/reservations')}
              className="btn-secondary flex-1"
            >
              Moje rezervace
            </button>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Co dál?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Potvrzení rezervace jsme zaslali na váš e-mail</li>
            <li>• Vstupenku si můžete stáhnout nebo ji najdete v "Moje rezervace"</li>
            <li>• Před akcí vám pošleme připomenutí</li>
            <li>• Vstupenku předložte na akci (QR kód)</li>
          </ul>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/events')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Zpět na akce
          </button>
        </div>
      </div>
    </div>
  );
}
