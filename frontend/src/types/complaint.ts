export interface Complaint {
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
