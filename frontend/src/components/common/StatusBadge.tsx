import React from 'react';

type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
type ReservationStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
type ComplaintStatus = 'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED';
type UserRole = 'USER' | 'ORGANIZER' | 'ADMIN';

type StatusType = EventStatus | ReservationStatus | ComplaintStatus | UserRole;

interface StatusBadgeProps {
  status: StatusType;
  type: 'event' | 'reservation' | 'complaint' | 'role';
  className?: string;
  icon?: React.ReactNode;
}

const EVENT_STYLES: Record<EventStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
};

const EVENT_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Koncept',
  PUBLISHED: 'Publikováno',
  CANCELLED: 'Zrušeno',
  COMPLETED: 'Proběhlo',
};

const RESERVATION_STYLES: Record<ReservationStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-blue-100 text-blue-800',
};

const RESERVATION_LABELS: Record<ReservationStatus, string> = {
  PENDING: 'Čeká na platbu',
  PAID: 'Zaplaceno',
  CANCELLED: 'Zrušeno',
  REFUNDED: 'Refundováno',
};

const COMPLAINT_STYLES: Record<ComplaintStatus, string> = {
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  RESOLVED: 'bg-green-100 text-green-800',
};

const COMPLAINT_LABELS: Record<ComplaintStatus, string> = {
  SUBMITTED: 'Čeká',
  IN_REVIEW: 'V řešení',
  REJECTED: 'Zamítnuto',
  RESOLVED: 'Vyřešeno',
};

const ROLE_STYLES: Record<UserRole, string> = {
  USER: 'bg-blue-100 text-blue-800',
  ORGANIZER: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-red-100 text-red-800',
};

const ROLE_LABELS: Record<UserRole, string> = {
  USER: 'Uživatel',
  ORGANIZER: 'Organizátor',
  ADMIN: 'Administrátor',
};

export default function StatusBadge({ status, type, className = '', icon }: StatusBadgeProps) {
  const getStyle = () => {
    switch (type) {
      case 'event':
        return EVENT_STYLES[status as EventStatus] || 'bg-gray-100 text-gray-800';
      case 'reservation':
        return RESERVATION_STYLES[status as ReservationStatus] || 'bg-gray-100 text-gray-800';
      case 'complaint':
        return COMPLAINT_STYLES[status as ComplaintStatus] || 'bg-gray-100 text-gray-800';
      case 'role':
        return ROLE_STYLES[status as UserRole] || 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'event':
        return EVENT_LABELS[status as EventStatus] || status;
      case 'reservation':
        return RESERVATION_LABELS[status as ReservationStatus] || status;
      case 'complaint':
        return COMPLAINT_LABELS[status as ComplaintStatus] || status;
      case 'role':
        return ROLE_LABELS[status as UserRole] || status;
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStyle()} ${className}`}
    >
      {icon}
      {getLabel()}
    </span>
  );
}
