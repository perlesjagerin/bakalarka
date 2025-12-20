import { Complaint } from '../../types/complaint';
import StatusBadge from '../common/StatusBadge';
import { formatPrice } from '../../utils/formatters';

interface ComplaintDetailInfoProps {
  complaint: Complaint;
}

export default function ComplaintDetailInfo({ 
  complaint
}: ComplaintDetailInfoProps) {
  return (
    <>
      {/* Status */}
      <div className="mb-6">
        <StatusBadge status={complaint.status as any} type="complaint" />
        {complaint.refundIssued && (
          <span className="ml-2 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Refundováno
          </span>
        )}
      </div>

      {/* Reservation info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3">Informace o rezervaci</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Kód:</span>
            <span className="font-mono">{complaint.reservation.reservationCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Akce:</span>
            <span className="font-medium">{complaint.reservation.event.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Vstupenky:</span>
            <span>{complaint.reservation.ticketCount}x</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cena:</span>
            <span className="font-semibold">
              {Number(complaint.reservation.totalAmount) === 0 
                ? 'Zadarmo' 
                : formatPrice(Number(complaint.reservation.totalAmount))}
            </span>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Uživatel</h3>
        <p className="text-sm text-gray-900">{complaint.user.name}</p>
        <p className="text-sm text-gray-600">{complaint.user.email}</p>
      </div>

      {/* Complaint details */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Důvod reklamace</h3>
        <p className="text-sm font-medium text-gray-900 mb-2">{complaint.reason}</p>
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {complaint.description}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-xs text-gray-500">
          Podáno: {new Date(complaint.createdAt).toLocaleString('cs-CZ')}
        </p>
      </div>
    </>
  );
}
