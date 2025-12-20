import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';

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

interface ComplaintListItemProps {
  complaint: Complaint;
}

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

export default function ComplaintListItem({ complaint }: ComplaintListItemProps) {
  return (
    <div className="card">
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
  );
}
