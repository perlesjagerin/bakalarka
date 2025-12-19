import { useState, useEffect } from 'react';
import { Calendar, User, FileText, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import api from '../lib/axios';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, VALIDATION_MESSAGES, CONFIRMATION_MESSAGES } from '../constants/messages';
import { showErrorToast, showSuccessToast } from '../utils/errorHandling';

interface Complaint {
  id: string;
  reason: string;
  description: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED';
  adminResponse?: string;
  refundIssued: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  reservation: {
    id: string;
    reservationCode: string;
    ticketCount: number;
    totalAmount: number;
    event: {
      id: string;
      title: string;
      startDate: string;
    };
  };
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [refundCheckbox, setRefundCheckbox] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState<'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED'>('SUBMITTED');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints/all');
      setComplaints(response.data.complaints);
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.LOAD_COMPLAINTS_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewComplaint = async (complaintId: string, status: 'IN_REVIEW' | 'REJECTED') => {
    // Pro IN_REVIEW není potřeba odpověď
    if (status === 'REJECTED' && !adminResponse.trim()) {
      showErrorToast(VALIDATION_MESSAGES.REJECT_REASON_REQUIRED);
      return;
    }

    setProcessing(true);
    try {
      await api.put(`/complaints/${complaintId}/status`, {
        status,
        adminResponse: status === 'REJECTED' ? adminResponse : undefined,
      });
      
      showSuccessToast(status === 'IN_REVIEW' ? SUCCESS_MESSAGES.COMPLAINT_ACCEPTED : SUCCESS_MESSAGES.COMPLAINT_REJECTED);
      setSelectedComplaint(null);
      setAdminResponse('');
      setRefundCheckbox(false);
      fetchComplaints();
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.UPDATE_COMPLAINT_ERROR);
    } finally {
      setProcessing(false);
    }
  };

  const handleResolveComplaint = async (complaintId: string) => {
    if (!adminResponse.trim()) {
      showErrorToast(VALIDATION_MESSAGES.RESPONSE_REQUIRED);
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/complaints/${complaintId}/resolve`, {
        adminResponse,
        shouldRefund: refundCheckbox,
      });
      
      showSuccessToast(refundCheckbox ? SUCCESS_MESSAGES.COMPLAINT_RESOLVED_WITH_REFUND : SUCCESS_MESSAGES.COMPLAINT_RESOLVED);
      setSelectedComplaint(null);
      setAdminResponse('');
      setRefundCheckbox(false);
      setIsEditing(false);
      fetchComplaints();
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.UPDATE_COMPLAINT_ERROR);
    } finally {
      setProcessing(false);
    }
  };

  const openComplaintDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAdminResponse(complaint.adminResponse || '');
    setRefundCheckbox(complaint.refundIssued);
    setEditedStatus(complaint.status);
    setIsEditing(false);
  };

  const handleUpdateComplaint = async (complaintId: string) => {
    if (!adminResponse.trim()) {
      showErrorToast(VALIDATION_MESSAGES.RESPONSE_REQUIRED);
      return;
    }

    // Validace - pokud už byla refundace, nelze měnit status zpět
    if (selectedComplaint?.refundIssued && (editedStatus === 'SUBMITTED' || editedStatus === 'IN_REVIEW')) {
      showErrorToast(CONFIRMATION_MESSAGES.REFUND_WARNING);
      return;
    }

    // Pokud se provádí dodatečná refundace, zavolej resolve endpoint
    if (refundCheckbox && !selectedComplaint?.refundIssued) {
      if (!confirm('Opravdu chcete provést refundaci? Tuto akci nelze vrátit zpět.')) {
        return;
      }
      
      setProcessing(true);
      try {
        const response = await api.post(`/complaints/${complaintId}/resolve`, {
          adminResponse,
          shouldRefund: true,
        });
        
        // Použij vrácenou reklamaci z API
        if (response.data.complaint) {
          setSelectedComplaint(response.data.complaint);
        }
        
        showSuccessToast(SUCCESS_MESSAGES.REFUND_PROCESSED);
        setRefundCheckbox(false);
        setIsEditing(false);
        fetchComplaints();
      } catch (error) {
        showErrorToast(error, ERROR_MESSAGES.UPDATE_COMPLAINT_ERROR);
      } finally {
        setProcessing(false);
      }
      return;
    }

    setProcessing(true);
    try {
      await api.put(`/complaints/${complaintId}/status`, {
        status: editedStatus,
        adminResponse,
      });
      
      // Aktualizuj selectedComplaint s novou odpovědí a statusem
      if (selectedComplaint) {
        setSelectedComplaint({
          ...selectedComplaint,
          adminResponse: adminResponse,
          status: editedStatus
        });
      }
      
      showSuccessToast(SUCCESS_MESSAGES.COMPLAINT_UPDATED);
      setIsEditing(false);
      fetchComplaints();
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.UPDATE_COMPLAINT_ERROR);
    } finally {
      setProcessing(false);
    }
  };

  const filteredComplaints = filter === 'all' 
    ? complaints 
    : complaints.filter(c => c.status === filter);

  const getStatusBadge = (status: string) => {
    const badges = {
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      IN_REVIEW: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      RESOLVED: 'bg-green-100 text-green-800',
    };
    const labels = {
      SUBMITTED: 'Čeká',
      IN_REVIEW: 'V řešení',
      REJECTED: 'Zamítnuto',
      RESOLVED: 'Vyřešeno',
    };
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Správa reklamací</h1>
        <p className="text-gray-600">Přehled a zpracování všech reklamací uživatelů</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <p className="text-gray-600 mb-1">Celkem</p>
          <p className="text-3xl font-bold text-gray-900">{complaints.length}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 mb-1">Čeká na řešení</p>
          <p className="text-3xl font-bold text-yellow-600">
            {complaints.filter(c => c.status === 'SUBMITTED' || c.status === 'IN_REVIEW').length}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-600 mb-1">Vyřešeno</p>
          <p className="text-3xl font-bold text-green-600">
            {complaints.filter(c => c.status === 'RESOLVED').length}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-600 mb-1">Zamítnuto</p>
          <p className="text-3xl font-bold text-red-600">
            {complaints.filter(c => c.status === 'REJECTED').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(['all', 'SUBMITTED', 'IN_REVIEW', 'REJECTED', 'RESOLVED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Vše' : 
             f === 'SUBMITTED' ? 'Čeká' :
             f === 'IN_REVIEW' ? 'V řešení' :
             f === 'REJECTED' ? 'Zamítnuto' :
             'Vyřešeno'}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-600">Žádné reklamace v této kategorii.</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                onClick={() => openComplaintDetail(complaint)}
                className={`card cursor-pointer transition-all ${
                  selectedComplaint?.id === complaint.id 
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
            ))
          )}
        </div>

        {/* Detail */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {selectedComplaint ? (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Detail reklamace</h2>

              {/* Status */}
              <div className="mb-6">
                {getStatusBadge(selectedComplaint.status)}
                {selectedComplaint.refundIssued && (
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
                    <span className="font-mono">{selectedComplaint.reservation.reservationCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Akce:</span>
                    <span className="font-medium">{selectedComplaint.reservation.event.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vstupenky:</span>
                    <span>{selectedComplaint.reservation.ticketCount}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cena:</span>
                    <span className="font-semibold">{Number(selectedComplaint.reservation.totalAmount) === 0 ? 'Zadarmo' : `${Number(selectedComplaint.reservation.totalAmount).toLocaleString('cs-CZ')} Kč`}</span>
                  </div>
                </div>
              </div>

              {/* User info */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Uživatel</h3>
                <p className="text-sm text-gray-900">{selectedComplaint.user.name}</p>
                <p className="text-sm text-gray-600">{selectedComplaint.user.email}</p>
              </div>

              {/* Complaint details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Důvod reklamace</h3>
                <p className="text-sm font-medium text-gray-900 mb-2">{selectedComplaint.reason}</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500">
                  Podáno: {new Date(selectedComplaint.createdAt).toLocaleString('cs-CZ')}
                </p>
              </div>

              {/* Admin response */}
              {selectedComplaint.status === 'SUBMITTED' ? (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Nová reklamace čeká na zpracování. Přijměte ji k řešení nebo rovnou vyřešte.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReviewComplaint(selectedComplaint.id, 'IN_REVIEW')}
                      disabled={processing}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={18} />
                      {processing ? 'Zpracovávám...' : 'Přijmout k řešení'}
                    </button>
                  </div>
                </div>
              ) : selectedComplaint.status === 'IN_REVIEW' ? (
                <div>
                  <label className="block font-semibold mb-2">
                    Odpověď administrátora *
                  </label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                    placeholder="Napište odpověď uživateli..."
                    className="input mb-4"
                  />

                  <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={refundCheckbox}
                        onChange={(e) => setRefundCheckbox(e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm">
                        Provést automatickou refundaci
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleResolveComplaint(selectedComplaint.id)}
                      disabled={processing}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      {processing ? 'Zpracovávám...' : 'Vyřešit reklamaci'}
                    </button>
                    <button
                      onClick={() => handleReviewComplaint(selectedComplaint.id, 'REJECTED')}
                      disabled={processing}
                      className="btn-danger flex-1 flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      {processing ? 'Zpracovávám...' : 'Zamítnout'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Status info */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Status reklamace</h3>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {isEditing ? 'Zrušit úpravu' : 'Upravit odpověď'}
                      </button>
                    </div>
                    
                    {selectedComplaint.refundIssued && (
                      <div className="mb-3 flex items-center gap-2 text-green-700">
                        <CheckCircle size={18} />
                        <span className="font-medium">Refundace byla provedena</span>
                      </div>
                    )}

                    {!selectedComplaint.refundIssued && selectedComplaint.status === 'RESOLVED' && (
                      <div className="mb-3 flex items-center gap-2 text-gray-600">
                        <XCircle size={18} />
                        <span>Reklamace vyřešena bez refundace</span>
                      </div>
                    )}
                  </div>

                  {/* Admin response */}
                  {isEditing ? (
                    <div>
                      {/* Status výběr */}
                      <div className="mb-4">
                        <label className="block font-semibold mb-2">
                          Status reklamace
                        </label>
                        <select
                          value={editedStatus}
                          onChange={(e) => setEditedStatus(e.target.value as any)}
                          className="input"
                          disabled={selectedComplaint.refundIssued}
                        >
                          <option value="SUBMITTED">Čeká na zpracování</option>
                          <option value="IN_REVIEW">V řešení</option>
                          <option value="REJECTED">Zamítnuto</option>
                          <option value="RESOLVED">Vyřešeno</option>
                        </select>
                        {selectedComplaint.refundIssued && (
                          <p className="text-sm text-gray-600 mt-1">
                            🔒 Status nelze měnit - refundace již byla provedena
                          </p>
                        )}
                      </div>

                      <label className="block font-semibold mb-2">
                        Odpověď administrátora *
                      </label>
                      <textarea
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        rows={4}
                        placeholder="Upravte odpověď uživateli..."
                        className="input mb-4"
                      />

                      {/* Refundace checkbox - pouze pokud ještě nebyla provedena */}
                      {!selectedComplaint.refundIssued && (
                        <div className="mb-4">
                          <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={refundCheckbox}
                              onChange={(e) => setRefundCheckbox(e.target.checked)}
                              className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium">
                              Provést refundaci
                            </span>
                          </label>
                          {refundCheckbox && (
                            <p className="text-sm text-orange-600 mt-2">
                              ⚠️ Refundace bude provedena okamžitě a nelze ji vrátit zpět!
                            </p>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => handleUpdateComplaint(selectedComplaint.id)}
                        disabled={processing}
                        className="btn-primary w-full"
                      >
                        {processing ? 'Ukládám...' : refundCheckbox ? 'Uložit a provést refundaci' : 'Uložit změny'}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Odpověď administrátora</h3>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {selectedComplaint.adminResponse || 'Bez odpovědi'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-12">
              <Clock size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                Vyberte reklamaci pro zobrazení detailu
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
