import { Elements } from '@stripe/react-stripe-js';
import { Stripe } from '@stripe/stripe-js';
import { CreditCard, AlertCircle } from 'lucide-react';
import CheckoutForm from '../CheckoutForm.tsx';

interface PaymentFormProps {
  stripePromise: Promise<Stripe | null> | null;
  clientSecret: string;
  reservationId: string;
  amount: number;
}

export default function PaymentForm({ 
  stripePromise, 
  clientSecret, 
  reservationId, 
  amount 
}: PaymentFormProps) {
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

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="text-primary-600" size={24} />
        <h2 className="text-xl font-bold">Platební údaje</h2>
      </div>

      {clientSecret && stripePromise && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm 
            reservationId={reservationId}
            amount={amount}
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
  );
}
