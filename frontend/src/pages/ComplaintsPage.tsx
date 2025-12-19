import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, FileText, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../lib/axios';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, VALIDATION_MESSAGES } from '../constants/messages';
import { showErrorToast, showSuccessToast } from '../utils/errorHandling';

const complaintSchema = z.object({
  reservationId: z.string().min(1, VALIDATION_MESSAGES.REQUIRED_FIELD),
  reason: z.string().min(1, VALIDATION_MESSAGES.REQUIRED_FIELD),
  description: z.string().min(20, VALIDATION_MESSAGES.MIN_DESCRIPTION_LENGTH),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

interface Reservation {
  id: string;
  reservationCode: string;
  numberOfTickets: number;
  totalPrice: number;
  status: string;
  event: {
    id: string;
    title: string;
    startDate: string;
  };
}

interface Complaint {
  id: string;
  reason: string;
  description: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED';
  adminResponse?: string;
  refundIssued: boolean;
  createdAt: string;
  reservation: {
    reservationCode: string;
    event: {
      title: string;
    };
  };
}

const complaintReasons = [
  'Akce byla zrušena',
  'Akce nesplnila očekávání',
  'Technické problémy',
  'Špatná kvalita služeb',
  'Chybné informace o akci',
  'Jiný důvod',
];

export default function ComplaintsPage() {
  const [searchParams] = useSearchParams();
  const reservationIdFromUrl = searchParams.get('reservationId');
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [showForm, setShowForm] = useState(!!reservationIdFromUrl);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      reservationId: reservationIdFromUrl || '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (reservationIdFromUrl && reservations.length > 0) {
      setValue('reservationId', reservationIdFromUrl);
    }
  }, [reservationIdFromUrl, reservations, setValue]);

  const fetchData = async () => {
    try {
      const [resResponse, compResponse] = await Promise.all([
        api.get('/reservations/my'),
        api.get('/complaints/my'),
      ]);
      
      // Filtrovat pouze potvrzené rezervace
      const confirmedReservations = resResponse.data.reservations.filter(
        (r: Reservation) => r.status === 'CONFIRMED'
      );
      setReservations(confirmedReservations);
      setComplaints(compResponse.data.complaints);
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.LOAD_DATA_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      await api.post('/complaints', data);
      showSuccessToast(SUCCESS_MESSAGES.COMPLAINT_SUBMITTED);
      reset();
      setShowForm(false);
      fetchData();
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.CREATE_COMPLAINT_ERROR);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      IN_REVIEW: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      RESOLVED: 'bg-green-100 text-green-800',
    };
    const labels = {
      SUBMITTED: 'Čeká na zpracování',
      IN_REVIEW: 'V řešení',
      REJECTED: 'Zamítnuto',
      RESOLVED: 'Vyřešeno',
    };
    const icons = {
      SUBMITTED: Clock,
      IN_REVIEW: MessageSquare,
      REJECTED: XCircle,
      RESOLVED: CheckCircle,
    };
    
    const Icon = icons[status as keyof typeof icons];
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
        <Icon size={16} />
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reklamace</h1>
            <p className="text-gray-600">Podejte reklamaci nebo zobrazte stav existujících</p>
          </div>
          {reservations.length > 0 && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Podat reklamaci
            </button>
          )}
        </div>

        {/* Formulář pro novou reklamaci */}
        {showForm && (
          <div className="card mb-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">Nová reklamace</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Výběr rezervace */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Vyberte rezervaci *
                </label>
                <select
                  {...register('reservationId')}
                  className={`input ${errors.reservationId ? 'border-red-500' : ''}`}
                >
                  <option value="">-- Vyberte rezervaci --</option>
                  {reservations.map((reservation) => (
                    <option key={reservation.id} value={reservation.id}>
                      {reservation.reservationCode} - {reservation.event.title}
                    </option>
                  ))}
                </select>
                {errors.reservationId && (
                  <p className="text-red-600 text-sm mt-1">{errors.reservationId.message}</p>
                )}
              </div>

              {/* Důvod */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Důvod reklamace *
                </label>
                <select
                  {...register('reason')}
                  className={`input ${errors.reason ? 'border-red-500' : ''}`}
                >
                  <option value="">-- Vyberte důvod --</option>
                  {complaintReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                {errors.reason && (
                  <p className="text-red-600 text-sm mt-1">{errors.reason.message}</p>
                )}
              </div>

              {/* Popis */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Detailní popis *
                </label>
                <textarea
                  {...register('description')}
                  rows={5}
                  placeholder="Popište podrobně váš problém..."
                  className={`input ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Prosím uveďte co nejvíce informací pro rychlejší vyřízení
                </p>
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Informace o reklamaci</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Reklamace bude vyřízena do 14 dnů</li>
                    <li>Budete informováni o průběhu emailem</li>
                    <li>V případě schválení bude provedena refundace</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Odesílám...' : 'Podat reklamaci'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Seznam reklamací */}
        <div>
          <h2 className="text-xl font-bold mb-4">Moje reklamace</h2>
          
          {complaints.length === 0 ? (
            <div className="card text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Zatím jste nepodali žádnou reklamaci.</p>
              {reservations.length > 0 ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  Podat první reklamaci
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Pro podání reklamace musíte mít potvrzenou rezervaci.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        {complaint.reservation.event.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Kód: {complaint.reservation.reservationCode}
                      </p>
                    </div>
                    {getStatusBadge(complaint.status)}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Důvod:</p>
                    <p className="font-medium text-gray-900">{complaint.reason}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Popis:</p>
                    <p className="text-gray-700 text-sm">{complaint.description}</p>
                  </div>

                  {complaint.adminResponse && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-1">Odpověď administrátora:</p>
                      <p className="text-gray-900 text-sm">{complaint.adminResponse}</p>
                    </div>
                  )}

                  {complaint.refundIssued && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="text-sm text-green-800 font-medium">
                        Refundace byla provedena
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-4">
                    Podáno: {new Date(complaint.createdAt).toLocaleString('cs-CZ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
