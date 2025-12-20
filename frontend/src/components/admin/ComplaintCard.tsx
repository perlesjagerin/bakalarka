import { Calendar, User, FileText } from 'lucide-react';
import { Complaint } from '../types/complaint';

interface ComplaintCardProps {
  complaint: Complaint;
  isSelected: boolean;
  onSelect: () => void;
  getStatusBadge: (status: string) => JSX.Element;
}

export default function ComplaintCard({ 
  complaint, 
  isSelected, 
  onSelect,
  getStatusBadge 
}: ComplaintCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`card cursor-pointer transition-all ${
        isSelected 
          ? 'ring-2 ring-primary-600' 
          : 'hover:shadow-lg'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-mono text-sm text-gray-500 mb-1">
            {complaint.reservation.reservationCode}
          </p>
          <h3 className="font-bold text-gray-900">
            {complaint.reservation.event.title}
          </h3>
        </div>
        {getStatusBadge(complaint.status)}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <User size={16} />
          <span>{complaint.user.name} ({complaint.user.email})</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={16} />
          <span>{new Date(complaint.createdAt).toLocaleDateString('cs-CZ')}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <FileText size={16} />
          <span className="font-medium">{complaint.reason}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
        {complaint.description}
      </p>

      {complaint.refundIssued && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm text-green-800">
          ✓ Refundace provedena
        </div>
      )}
    </div>
  );
}
