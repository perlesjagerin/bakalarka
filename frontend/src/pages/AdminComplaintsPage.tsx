import { useState } from 'react';
import { Complaint } from '../types/complaint';
import { useComplaints } from '../hooks/useComplaints';
import ComplaintCard from '../components/admin/ComplaintCard';
import ComplaintStats from '../components/admin/ComplaintStats';
import ComplaintFilters from '../components/admin/ComplaintFilters';
import ComplaintDetail from '../components/admin/ComplaintDetail';
import StatusBadge from '../components/common/StatusBadge';

type FilterType = 'all' | 'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED';

export default function AdminComplaintsPage() {
  const {
    complaints,
    loading,
    processing,
    handleReviewComplaint,
    handleResolveComplaint,
    handleUpdateComplaint,
  } = useComplaints();

  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [refundCheckbox, setRefundCheckbox] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState<'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED'>('SUBMITTED');

  const openComplaintDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAdminResponse(complaint.adminResponse || '');
    setRefundCheckbox(complaint.refundIssued);
    setEditedStatus(complaint.status);
    setIsEditing(false);
  };

  const handleReview = async (complaintId: string, status: 'IN_REVIEW' | 'REJECTED') => {
    const success = await handleReviewComplaint(complaintId, status, adminResponse);
    if (success) {
      setSelectedComplaint(null);
      setAdminResponse('');
      setRefundCheckbox(false);
    }
  };

  const handleResolve = async (complaintId: string) => {
    const success = await handleResolveComplaint(complaintId, adminResponse, refundCheckbox);
    if (success) {
      setSelectedComplaint(null);
      setAdminResponse('');
      setRefundCheckbox(false);
      setIsEditing(false);
    }
  };

  const handleUpdate = async (complaintId: string) => {
    if (!selectedComplaint) return;
    
    const success = await handleUpdateComplaint(
      complaintId,
      adminResponse,
      editedStatus,
      refundCheckbox,
      selectedComplaint
    );
    
    if (success) {
      setRefundCheckbox(false);
      setIsEditing(false);
      // Update local state
      setSelectedComplaint({
        ...selectedComplaint,
        adminResponse,
        status: editedStatus,
      });
    }
  };

  const filteredComplaints = filter === 'all' 
    ? complaints 
    : complaints.filter(c => c.status === filter);

  const filteredComplaints = filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

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

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'SUBMITTED' || c.status === 'IN_REVIEW').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
    rejected: complaints.filter(c => c.status === 'REJECTED').length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Správa reklamací</h1>
        <p className="text-gray-600">Přehled a zpracování všech reklamací uživatelů</p>
      </div>

      <ComplaintStats {...stats} />
      <ComplaintFilters currentFilter={filter} onFilterChange={setFilter} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-600">Žádné reklamace v této kategorii.</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                isSelected={selectedComplaint?.id === complaint.id}
                onSelect={() => openComplaintDetail(complaint)}
              />
            ))
          )}
        </div>

        {/* Detail */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <ComplaintDetail
            complaint={selectedComplaint}
            adminResponse={adminResponse}
            refundCheckbox={refundCheckbox}
            processing={processing}
            isEditing={isEditing}
            editedStatus={editedStatus}
            onAdminResponseChange={setAdminResponse}
            onRefundCheckboxChange={setRefundCheckbox}
            onEditingChange={setIsEditing}
            onStatusChange={setEditedStatus}
            onReviewComplaint={handleReview}
            onResolveComplaint={handleResolve}
            onUpdateComplaint={handleUpdate}
          />
        </div>
      </div>
    </div>
  );
}
