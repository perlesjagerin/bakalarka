import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'react-router-dom';
import { useUserComplaints } from '../hooks/useUserComplaints';
import ComplaintForm, { complaintSchema, ComplaintFormData } from '../components/complaints/ComplaintForm';
import ComplaintList from '../components/complaints/ComplaintList';

export default function ComplaintsPage() {
  const [searchParams] = useSearchParams();
  const reservationIdFromUrl = searchParams.get('reservationId');
  
  const { reservations, complaints, loading, submitComplaint } = useUserComplaints();
  const [showForm, setShowForm] = useState(!!reservationIdFromUrl);

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
    if (reservationIdFromUrl && reservations.length > 0) {
      setValue('reservationId', reservationIdFromUrl);
    }
  }, [reservationIdFromUrl, reservations, setValue]);

  const onSubmit = async (data: ComplaintFormData) => {
    const success = await submitComplaint(data);
    if (success) {
      reset();
      setShowForm(false);
    }
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

        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <ComplaintForm
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
              reservations={reservations}
              onCancel={() => setShowForm(false)}
            />
          </form>
        )}

        <div>
          <h2 className="text-xl font-bold mb-4">Moje reklamace</h2>
          <ComplaintList
            complaints={complaints}
            reservationsCount={reservations.length}
            onShowForm={() => setShowForm(true)}
          />
        </div>
      </div>
    </div>
  );
}
