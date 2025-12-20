import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Complaint } from '../types/complaint';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, VALIDATION_MESSAGES, CONFIRMATION_MESSAGES } from '../constants/messages';
import { showErrorToast, showSuccessToast } from '../utils/errorHandling';

export function useComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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

  const handleReviewComplaint = async (
    complaintId: string, 
    status: 'IN_REVIEW' | 'REJECTED',
    adminResponse?: string
  ) => {
    if (status === 'REJECTED' && !adminResponse?.trim()) {
      showErrorToast(VALIDATION_MESSAGES.REJECT_REASON_REQUIRED);
      return false;
    }

    setProcessing(true);
    try {
      await api.put(`/complaints/${complaintId}/status`, {
        status,
        adminResponse: status === 'REJECTED' ? adminResponse : undefined,
      });
      
      showSuccessToast(
        status === 'IN_REVIEW' 
          ? SUCCESS_MESSAGES.COMPLAINT_ACCEPTED 
          : SUCCESS_MESSAGES.COMPLAINT_REJECTED
      );
      await fetchComplaints();
      return true;
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.UPDATE_COMPLAINT_ERROR);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const handleResolveComplaint = async (
    complaintId: string,
    adminResponse: string,
    shouldRefund: boolean
  ) => {
    if (!adminResponse.trim()) {
      showErrorToast(VALIDATION_MESSAGES.RESPONSE_REQUIRED);
      return false;
    }

    setProcessing(true);
    try {
      await api.post(`/complaints/${complaintId}/resolve`, {
        adminResponse,
        shouldRefund,
      });
      
      showSuccessToast(
        shouldRefund 
          ? SUCCESS_MESSAGES.COMPLAINT_RESOLVED_WITH_REFUND 
          : SUCCESS_MESSAGES.COMPLAINT_RESOLVED
      );
      await fetchComplaints();
      return true;
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.UPDATE_COMPLAINT_ERROR);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateComplaint = async (
    complaintId: string,
    adminResponse: string,
    editedStatus: 'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED',
    shouldRefund: boolean,
    complaint: Complaint
  ) => {
    if (!adminResponse.trim()) {
      showErrorToast(VALIDATION_MESSAGES.RESPONSE_REQUIRED);
      return false;
    }

    // Validation
    if (complaint.refundIssued && (editedStatus === 'SUBMITTED' || editedStatus === 'IN_REVIEW')) {
      showErrorToast(CONFIRMATION_MESSAGES.REFUND_WARNING);
      return false;
    }

    // Additional refund
    if (shouldRefund && !complaint.refundIssued) {
      if (!confirm('Opravdu chcete provést refundaci? Tuto akci nelze vrátit zpět.')) {
        return false;
      }
      
      setProcessing(true);
      try {
        await api.post(`/complaints/${complaintId}/resolve`, {
          adminResponse,
          shouldRefund: true,
        });
        
        showSuccessToast(SUCCESS_MESSAGES.REFUND_PROCESSED);
        await fetchComplaints();
        return true;
      } catch (error) {
        showErrorToast(error, ERROR_MESSAGES.UPDATE_COMPLAINT_ERROR);
        return false;
      } finally {
        setProcessing(false);
      }
    }

    // Regular update
    setProcessing(true);
    try {
      await api.put(`/complaints/${complaintId}/status`, {
        status: editedStatus,
        adminResponse,
      });
      
      showSuccessToast(SUCCESS_MESSAGES.COMPLAINT_UPDATED);
      await fetchComplaints();
      return true;
    } catch (error) {
      showErrorToast(error, ERROR_MESSAGES.UPDATE_COMPLAINT_ERROR);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return {
    complaints,
    loading,
    processing,
    fetchComplaints,
    handleReviewComplaint,
    handleResolveComplaint,
    handleUpdateComplaint,
  };
}
