import { Clock } from 'lucide-react';
import { Complaint } from '../types/complaint';
import ComplaintDetailInfo from './ComplaintDetailInfo';
import ComplaintDetailActions from './ComplaintDetailActions';

interface ComplaintDetailProps {
  complaint: Complaint | null;
  adminResponse: string;
  refundCheckbox: boolean;
  processing: boolean;
  isEditing: boolean;
  editedStatus: 'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED';
  onAdminResponseChange: (value: string) => void;
  onRefundCheckboxChange: (checked: boolean) => void;
  onEditingChange: (editing: boolean) => void;
  onStatusChange: (status: 'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED') => void;
  onReviewComplaint: (complaintId: string, status: 'IN_REVIEW' | 'REJECTED') => void;
  onResolveComplaint: (complaintId: string) => void;
  onUpdateComplaint: (complaintId: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
}

export default function ComplaintDetail({
  complaint,
  adminResponse,
  refundCheckbox,
  processing,
  isEditing,
  editedStatus,
  onAdminResponseChange,
  onRefundCheckboxChange,
  onEditingChange,
  onStatusChange,
  onReviewComplaint,
  onResolveComplaint,
  onUpdateComplaint,
  getStatusBadge,
}: ComplaintDetailProps) {
  if (!complaint) {
    return (
      <div className="card text-center py-12">
        <Clock size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">
          Vyberte reklamaci pro zobrazení detailu
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Detail reklamace</h2>

      <ComplaintDetailInfo 
        complaint={complaint} 
        getStatusBadge={getStatusBadge}
      />

      <ComplaintDetailActions
        complaint={complaint}
        adminResponse={adminResponse}
        refundCheckbox={refundCheckbox}
        processing={processing}
        isEditing={isEditing}
        editedStatus={editedStatus}
        onAdminResponseChange={onAdminResponseChange}
        onRefundCheckboxChange={onRefundCheckboxChange}
        onEditingChange={onEditingChange}
        onStatusChange={onStatusChange}
        onReviewComplaint={onReviewComplaint}
        onResolveComplaint={onResolveComplaint}
        onUpdateComplaint={onUpdateComplaint}
      />
    </div>
  );
}
