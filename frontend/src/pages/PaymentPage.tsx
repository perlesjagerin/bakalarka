import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm.tsx';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';

// Check if Stripe key is configured
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
  console.error('❌ VITE_STRIPE_PUBLISHABLE_KEY není nastavený!');
  console.error('Vytvořte soubor frontend/.env a přidejte: VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...');
} else {
  console.log('✅ Stripe key loaded:', stripeKey.substring(0, 20) + '...');
}

const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

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
    location: string;
  };
}

export default function PaymentPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchReservationAndPaymentIntent();
  }, [reservationId]);

  const fetchReservationAndPaymentIntent = async () => {
    try {
      // Načtení detailu rezervace
      const resResponse = await api.get(`/reservations/${reservationId}`);
      setReservation(resResponse.data.reservation);

      // Pokud je rezervace zdarma, nekontaktuj Stripe
      if (Number(resResponse.data.reservation.totalAmount) === 0) {
        setLoading(false);
        return;
      }

      // Pokud je už zaplaceno, přesměruj
      if (resResponse.data.reservation.status === 'CONFIRMED') {
        toast.success('Tato rezervace je již zaplacena');
        navigate('/reservations');
        return;
      }

      // Vytvoření payment intent
      const paymentResponse = await api.post('/payments/create-payment-intent', {
        reservationId,
      });
      
      setClientSecret(paymentResponse.data.clientSecret);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Chyba při načítání platby');
      toast.error('Nepodařilo se načíst platbu');
    } finally {
      setLoading(false);
    }
  };

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

  // Pokud je rezervace zdarma, přesměruj na rezervace
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

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  // Check if Stripe is configured
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

        {/* Shrnutí rezervace */}
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
              <span>{new Date(reservation.event.startDate).toLocaleDateString('cs-CZ')}</span>
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
                {Number(reservation.totalAmount) === 0 ? 'Zadarmo' : `${Number(reservation.totalAmount).toLocaleString('cs-CZ')} Kč`}
              </span>
            </div>
          </div>
        </div>

        {/* Stripe Elements */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="text-primary-600" size={24} />
            <h2 className="text-xl font-bold">Platební údaje</h2>
          </div>

          {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm 
                reservationId={reservation.id}
                amount={reservation.totalAmount}
              />
            </Elements>
          )}

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="mb-2">
                  <strong>Testovací platba:</strong> Pro testování použijte kartu <code className="bg-gray-100 px-2 py-1 rounded">4242 4242 4242 4242</code>
                </p>
                <p>
                  Datum vypršení: jakékoliv budoucí datum, CVC: jakékoliv 3 číslice
                </p>
              </div>
            </div>
          </div>
        </div>

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
