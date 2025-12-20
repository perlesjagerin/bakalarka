import { FileText } from 'lucide-react';
import ComplaintListItem from './ComplaintListItem';

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

interface ComplaintListProps {
  complaints: Complaint[];
  reservationsCount: number;
  onShowForm: () => void;
}

export default function ComplaintList({ 
  complaints, 
  reservationsCount,
  onShowForm 
}: ComplaintListProps) {
  if (complaints.length === 0) {
    return (
      <div className="card text-center py-12">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 mb-4">Zatím jste nepodali žádnou reklamaci.</p>
        {reservationsCount > 0 ? (
          <button
            onClick={onShowForm}
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
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <ComplaintListItem key={complaint.id} complaint={complaint} />
      ))}
    </div>
  );
}
