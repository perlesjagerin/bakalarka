import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Complaint } from '../types/complaint';

interface ComplaintDetailActionsProps {
  complaint: Complaint;
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
}

export default function ComplaintDetailActions({
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
}: ComplaintDetailActionsProps) {
  const isEventFree = Number(complaint.reservation.totalAmount) === 0;

  if (complaint.status === 'SUBMITTED') {
    return (
      <div>
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Nová reklamace čeká na zpracování. Přijměte ji k řešení nebo rovnou vyřešte.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onReviewComplaint(complaint.id, 'IN_REVIEW')}
            disabled={processing}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} />
            {processing ? 'Zpracovávám...' : 'Přijmout k řešení'}
          </button>
        </div>
      </div>
    );
  }

  if (complaint.status === 'IN_REVIEW') {
    return (
      <div>
        <label className="block font-semibold mb-2">
          Odpověď administrátora *
        </label>
        <textarea
          value={adminResponse}
          onChange={(e) => onAdminResponseChange(e.target.value)}
          rows={4}
          placeholder="Napište odpověď uživateli..."
          className="input mb-4"
        />

        {isEventFree ? (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ Tato rezervace byla na akci zdarma - refundace není potřeba.
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={refundCheckbox}
                onChange={(e) => onRefundCheckboxChange(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-sm">
                Provést automatickou refundaci ({Number(complaint.reservation.totalAmount).toLocaleString('cs-CZ')} Kč)
              </span>
            </label>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onResolveComplaint(complaint.id)}
            disabled={processing}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            {processing ? 'Zpracovávám...' : 'Vyřešit reklamaci'}
          </button>
          <button
            onClick={() => onReviewComplaint(complaint.id, 'REJECTED')}
            disabled={processing}
            className="btn-danger flex-1 flex items-center justify-center gap-2"
          >
            <XCircle size={18} />
            {processing ? 'Zpracovávám...' : 'Zamítnout'}
          </button>
        </div>
      </div>
    );
  }

  // RESOLVED or REJECTED status
  return (
    <div>
      {/* Status info */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Status reklamace</h3>
          <button
            onClick={() => onEditingChange(!isEditing)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {isEditing ? 'Zrušit úpravu' : 'Upravit odpověď'}
          </button>
        </div>
        
        {complaint.refundIssued && (
          <div className="mb-3 flex items-center gap-2 text-green-700">
            <CheckCircle size={18} />
            <span className="font-medium">Refundace byla provedena</span>
          </div>
        )}

        {!complaint.refundIssued && complaint.status === 'RESOLVED' && (
          <div className="mb-3 flex items-center gap-2 text-gray-600">
            <XCircle size={18} />
            <span>Reklamace vyřešena bez refundace</span>
          </div>
        )}
      </div>

      {isEditing ? (
        <div>
          <div className="mb-4">
            <label className="block font-semibold mb-2">
              Status reklamace
            </label>
            <select
              value={editedStatus}
              onChange={(e) => onStatusChange(e.target.value as any)}
              className="input"
              disabled={complaint.refundIssued || refundCheckbox}
            >
              <option value="SUBMITTED">Čeká na zpracování</option>
              <option value="IN_REVIEW">V řešení</option>
              <option value="REJECTED">Zamítnuto</option>
              <option value="RESOLVED">Vyřešeno</option>
            </select>
            {complaint.refundIssued && (
              <p className="text-sm text-gray-600 mt-1">
                🔒 Status nelze měnit - refundace již byla provedena
              </p>
            )}
            {refundCheckbox && !complaint.refundIssued && (
              <p className="text-sm text-blue-600 mt-1">
                🔒 Status automaticky nastaven na "Vyřešeno" při refundaci
              </p>
            )}
          </div>

          <label className="block font-semibold mb-2">
            Odpověď administrátora *
          </label>
          <textarea
            value={adminResponse}
            onChange={(e) => onAdminResponseChange(e.target.value)}
            rows={4}
            placeholder="Upravte odpověď uživateli..."
            className="input mb-4"
          />

          {!complaint.refundIssued && !isEventFree && (
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={refundCheckbox}
                  onChange={(e) => {
                    onRefundCheckboxChange(e.target.checked);
                    if (e.target.checked) {
                      onStatusChange('RESOLVED');
                    }
                  }}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm font-medium">
                  Provést refundaci ({Number(complaint.reservation.totalAmount).toLocaleString('cs-CZ')} Kč)
                </span>
              </label>
              {refundCheckbox && (
                <p className="text-sm text-orange-600 mt-2">
                  ⚠️ Refundace bude provedena okamžitě a nelze ji vrátit zpět!
                </p>
              )}
            </div>
          )}

          {!complaint.refundIssued && isEventFree && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ Tato rezervace byla na akci zdarma - refundace není potřeba.
              </p>
            </div>
          )}

          <button
            onClick={() => onUpdateComplaint(complaint.id)}
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
            {complaint.adminResponse || 'Bez odpovědi'}
          </p>
        </div>
      )}
    </div>
  );
}
