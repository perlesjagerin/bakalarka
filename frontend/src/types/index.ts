export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'ADMIN' | 'ORGANIZER' | 'USER';
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  imageUrl?: string;
  totalTickets: number;
  availableTickets: number;
  ticketPrice: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  organizerId: string;
  organizer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  eventId: string;
  userId: string;
  ticketCount: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  reservationCode: string;
  event?: Event;
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  stripePaymentId?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  id: string;
  reservationId: string;
  userId: string;
  reason: string;
  description: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED';
  adminResponse?: string;
  refundIssued: boolean;
  reservation?: Reservation;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
