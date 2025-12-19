/**
 * Centralized error and success messages for the application
 * This helps maintain consistency and makes it easier to update messages
 */

export const ERROR_MESSAGES = {
  // Generic
  GENERIC_ERROR: 'Došlo k neočekávané chybě',
  NETWORK_ERROR: 'Chyba sítě. Zkontrolujte připojení.',
  
  // Auth
  LOGIN_ERROR: 'Chyba při přihlašování',
  REGISTER_ERROR: 'Chyba při registraci',
  UNAUTHORIZED: 'Nemáte oprávnění k této akci',
  LOGIN_REQUIRED: 'Pro rezervaci se musíte přihlásit',
  
  // Events
  LOAD_EVENTS_ERROR: 'Chyba při načítání akcí',
  LOAD_EVENT_ERROR: 'Nepodařilo se načíst akci',
  CREATE_EVENT_ERROR: 'Chyba při vytváření akce',
  UPDATE_EVENT_ERROR: 'Chyba při aktualizaci akce',
  DELETE_EVENT_ERROR: 'Chyba při mazání akce',
  UPDATE_EVENT_STATUS_ERROR: 'Chyba při změně stavu akce',
  
  // Reservations
  LOAD_RESERVATIONS_ERROR: 'Chyba při načítání rezervací',
  CREATE_RESERVATION_ERROR: 'Chyba při vytváření rezervace',
  CANCEL_RESERVATION_ERROR: 'Chyba při rušení rezervace',
  UPDATE_RESERVATION_ERROR: 'Chyba při aktualizaci rezervace',
  INVALID_RESERVATION: 'Neplatná rezervace',
  
  // Payments
  LOAD_PAYMENT_ERROR: 'Nepodařilo se načíst platbu',
  PAYMENT_PROCESSING_ERROR: 'Chyba při zpracování platby',
  LOAD_PAYMENT_METHOD_ERROR: 'Nepodařilo se načíst platební formulář',
  
  // Complaints
  LOAD_COMPLAINTS_ERROR: 'Nepodařilo se načíst reklamace',
  LOAD_DATA_ERROR: 'Nepodařilo se načíst data',
  CREATE_COMPLAINT_ERROR: 'Chyba při podání reklamace',
  UPDATE_COMPLAINT_ERROR: 'Chyba při zpracování reklamace',
  
  // Users (Admin)
  LOAD_USERS_ERROR: 'Nepodařilo se načíst uživatele',
  UPDATE_USER_ERROR: 'Chyba při aktualizaci uživatele',
  
  // Profile
  UPDATE_PROFILE_ERROR: 'Chyba při aktualizaci profilu',
  CHANGE_PASSWORD_ERROR: 'Chyba při změně hesla',
} as const;

export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Úspěšně přihlášen!',
  REGISTER_SUCCESS: 'Úspěšně zaregistrován!',
  LOGOUT_SUCCESS: 'Odhlášení proběhlo úspěšně',
  
  // Events
  EVENT_CREATED: 'Akce byla vytvořena!',
  EVENT_UPDATED: 'Akce byla aktualizována!',
  EVENT_DELETED: 'Akce byla smazána',
  EVENT_PUBLISHED: 'Akce byla publikována',
  EVENT_CANCELLED: 'Akce byla zrušena',
  EVENT_COMPLETED: 'Akce byla označena jako proběhlá',
  EVENT_DRAFT: 'Akce byla vrácena do konceptů',
  EVENT_STATUS_CHANGED: 'Stav akce byl změněn',
  
  // Reservations
  RESERVATION_CREATED: 'Rezervace byla vytvořena!',
  RESERVATION_CANCELLED: 'Rezervace byla zrušena',
  RESERVATION_UPDATED: 'Rezervace byla aktualizována',
  RESERVATION_ALREADY_PAID: 'Tato rezervace je již zaplacena',
  
  // Payments
  PAYMENT_SUCCESS: 'Platba byla úspěšná!',
  PAYMENT_ALREADY_COMPLETED: 'Tato rezervace je již zaplacena',
  
  // Complaints
  COMPLAINT_SUBMITTED: 'Reklamace byla podána',
  COMPLAINT_ACCEPTED: 'Reklamace byla přijata k řešení',
  COMPLAINT_REJECTED: 'Reklamace byla zamítnuta',
  COMPLAINT_RESOLVED: 'Reklamace byla vyřešena',
  COMPLAINT_RESOLVED_WITH_REFUND: 'Reklamace byla vyřešena s refundací',
  COMPLAINT_UPDATED: 'Reklamace byla aktualizována',
  REFUND_PROCESSED: 'Reklamace byla aktualizována a refundace provedena',
  
  // Users (Admin)
  USER_UPDATED: 'Uživatel byl aktualizován',
  
  // Profile
  PROFILE_UPDATED: 'Profil byl úspěšně aktualizován',
  PASSWORD_CHANGED: 'Heslo bylo změněno',
  
  // Tickets
  TICKET_DOWNLOAD_PLACEHOLDER: 'Stahování vstupenky {code} (placeholder)',
  TICKET_DOWNLOADED_PLACEHOLDER: 'Vstupenka byla stažena (placeholder)',
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Toto pole je povinné',
  INVALID_EMAIL: 'Neplatný email',
  PASSWORD_TOO_SHORT: 'Heslo musí mít alespoň 6 znaků',
  REJECT_REASON_REQUIRED: 'Prosím vyplňte důvod zamítnutí',
  RESPONSE_REQUIRED: 'Prosím vyplňte odpověď',
  MIN_DESCRIPTION_LENGTH: 'Popis musí mít alespoň 20 znaků',
  MIN_TITLE_LENGTH: 'Název musí mít alespoň 3 znaky',
  MIN_TICKET_COUNT: 'Počet vstupenek musí být alespoň 1',  INVALID_TICKET_COUNT: 'Neplatný počet vstupenek',} as const;

export const CONFIRMATION_MESSAGES = {
  CANCEL_RESERVATION: 'Opravdu chcete zrušit tuto rezervaci?',
  DELETE_EVENT: 'Opravdu chcete smazat tuto akci?',
  CANCEL_EVENT: 'Opravdu chcete zrušit tuto akci? Všechny rezervace budou stornovány.',
  PUBLISH_EVENT: 'Opravdu chcete publikovat tuto akci? Stane se veřejně dostupnou.',
  REFUND_WARNING: 'Reklamace s refundací nemůže být vrácena do řešení. Refundaci nelze vrátit zpět.',
} as const;

/**
 * Helper function to format messages with dynamic values
 * Example: formatMessage(SUCCESS_MESSAGES.TICKET_DOWNLOAD_PLACEHOLDER, { code: 'ABC123' })
 */
export function formatMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] || ''));
}
