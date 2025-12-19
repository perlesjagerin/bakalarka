import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

interface CheckoutFormProps {
  reservationId: string;
  amount: number;
}

export default function CheckoutForm({ reservationId, amount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Platební formulář se ještě načítá');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?reservationId=${reservationId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Platba se nezdařila');
        toast.error(error.message || 'Platba se nezdařila');
      } else {
        toast.success('Platba byla úspěšná!');
        navigate(`/payment-success?reservationId=${reservationId}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Neočekávaná chyba');
      toast.error('Chyba při zpracování platby');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement 
        onReady={() => setIsReady(true)}
        onLoadError={(error) => {
          console.error('Payment Element load error:', error);
          setErrorMessage('Nepodařilo se načíst platební formulář');
        }}
      />

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing || !isReady}
        className="btn-primary w-full mt-6 py-3 text-lg"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Zpracovávám platbu...
          </span>
        ) : (
          `Zaplatit ${Number(amount).toLocaleString('cs-CZ')} Kč`
        )}
      </button>
    </form>
  );
}
