import { useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { usePayment } from '../hooks/usePayment';
import PaymentSummary from '../components/payment/PaymentSummary.tsx';
import PaymentForm from '../components/payment/PaymentForm.tsx';

// Check if Stripe key is configured
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
  console.error('❌ VITE_STRIPE_PUBLISHABLE_KEY není nastavený!');
} else {
  console.log('✅ Stripe key loaded:', stripeKey.substring(0, 20) + '...');
}

const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export default function PaymentPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const { reservation, clientSecret, loading, error, navigate } = usePayment(reservationId);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="card">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Free event - no payment needed
  if (reservation && Number(reservation.totalAmount) === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle2 size={24} />
              <div>
                <h2 className="text-xl font-bold mb-2">Akce zdarma</h2>
                <p>Tato akce je zdarma, platba není potřeba. Rezervace je automaticky potvrzena.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/reservations')}
              className="btn-primary mt-4"
            >
              Zobrazit moje rezervace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !reservation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle size={24} />
              <div>
                <h2 className="text-xl font-bold mb-2">Chyba</h2>
                <p>{error || 'Rezervace nebyla nalezena'}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/reservations')}
              className="btn-primary mt-4"
            >
              Zpět na moje rezervace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Stripe not configured
  if (!stripePromise) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle size={24} />
              <div>
                <h2 className="text-xl font-bold mb-2">Stripe není nakonfigurován</h2>
                <p className="mb-2">Pro zprovoznění plateb:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Zaregistrujte se na <a href="https://stripe.com" target="_blank" className="underline">stripe.com</a></li>
                  <li>Získejte Publishable key (začíná 'pk_test_')</li>
                  <li>Vytvořte <code className="bg-red-100 px-1">frontend/.env</code></li>
                  <li>Přidejte: <code className="bg-red-100 px-1">VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...</code></li>
                  <li>Restartujte frontend server</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Platba za rezervaci</h1>

        <PaymentSummary reservation={reservation} />
        
        {clientSecret && (
          <PaymentForm
            stripePromise={stripePromise}
            clientSecret={clientSecret}
            reservationId={reservation.id}
            amount={reservation.totalAmount}
          />
        )}

        <button
          onClick={() => navigate('/reservations')}
          className="btn-secondary mt-4"
        >
          Zrušit a vrátit se
        </button>
      </div>
    </div>
  );
}
