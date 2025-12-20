import { useSearchParams } from 'react-router-dom';
import { usePaymentSuccess } from '../hooks/usePaymentSuccess';
import SuccessHeader from '../components/payment/SuccessHeader.tsx';
import ReservationDetails from '../components/payment/ReservationDetails.tsx';
import NextStepsInfo from '../components/payment/NextStepsInfo.tsx';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservationId');
  
  const { reservation, loading, downloadTicket, navigate } = usePaymentSuccess(reservationId);

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
        <SuccessHeader />

        <ReservationDetails
          reservation={reservation}
          onDownloadTicket={downloadTicket}
          onViewReservations={() => navigate('/reservations')}
        />

        <NextStepsInfo />

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
