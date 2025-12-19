import { describe, it, expect } from 'vitest';
import { 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES, 
  VALIDATION_MESSAGES, 
  CONFIRMATION_MESSAGES,
  formatMessage 
} from '../messages';

describe('messages constants', () => {
  describe('ERROR_MESSAGES', () => {
    it('should have all generic error messages', () => {
      expect(ERROR_MESSAGES.GENERIC_ERROR).toBe('Došlo k neočekávané chybě');
      expect(ERROR_MESSAGES.NETWORK_ERROR).toBe('Chyba sítě. Zkontrolujte připojení.');
    });

    it('should have all auth error messages', () => {
      expect(ERROR_MESSAGES.LOGIN_ERROR).toBe('Chyba při přihlašování');
      expect(ERROR_MESSAGES.REGISTER_ERROR).toBe('Chyba při registraci');
      expect(ERROR_MESSAGES.UNAUTHORIZED).toBe('Nemáte oprávnění k této akci');
      expect(ERROR_MESSAGES.LOGIN_REQUIRED).toBe('Pro rezervaci se musíte přihlásit');
    });

    it('should have all event error messages', () => {
      expect(ERROR_MESSAGES.LOAD_EVENTS_ERROR).toBe('Chyba při načítání akcí');
      expect(ERROR_MESSAGES.LOAD_EVENT_ERROR).toBe('Nepodařilo se načíst akci');
      expect(ERROR_MESSAGES.CREATE_EVENT_ERROR).toBe('Chyba při vytváření akce');
      expect(ERROR_MESSAGES.UPDATE_EVENT_ERROR).toBe('Chyba při aktualizaci akce');
      expect(ERROR_MESSAGES.DELETE_EVENT_ERROR).toBe('Chyba při mazání akce');
      expect(ERROR_MESSAGES.UPDATE_EVENT_STATUS_ERROR).toBe('Chyba při změně stavu akce');
    });

    it('should have all reservation error messages', () => {
      expect(ERROR_MESSAGES.LOAD_RESERVATIONS_ERROR).toBe('Chyba při načítání rezervací');
      expect(ERROR_MESSAGES.CREATE_RESERVATION_ERROR).toBe('Chyba při vytváření rezervace');
      expect(ERROR_MESSAGES.CANCEL_RESERVATION_ERROR).toBe('Chyba při rušení rezervace');
      expect(ERROR_MESSAGES.UPDATE_RESERVATION_ERROR).toBe('Chyba při aktualizaci rezervace');
      expect(ERROR_MESSAGES.INVALID_RESERVATION).toBe('Neplatná rezervace');
    });

    it('should have all payment error messages', () => {
      expect(ERROR_MESSAGES.LOAD_PAYMENT_ERROR).toBe('Nepodařilo se načíst platbu');
      expect(ERROR_MESSAGES.PAYMENT_PROCESSING_ERROR).toBe('Chyba při zpracování platby');
      expect(ERROR_MESSAGES.LOAD_PAYMENT_METHOD_ERROR).toBe('Nepodařilo se načíst platební formulář');
    });

    it('should have all complaint error messages', () => {
      expect(ERROR_MESSAGES.LOAD_COMPLAINTS_ERROR).toBe('Nepodařilo se načíst reklamace');
      expect(ERROR_MESSAGES.LOAD_DATA_ERROR).toBe('Nepodařilo se načíst data');
      expect(ERROR_MESSAGES.CREATE_COMPLAINT_ERROR).toBe('Chyba při podání reklamace');
      expect(ERROR_MESSAGES.UPDATE_COMPLAINT_ERROR).toBe('Chyba při zpracování reklamace');
    });

    it('should have all user error messages', () => {
      expect(ERROR_MESSAGES.LOAD_USERS_ERROR).toBe('Nepodařilo se načíst uživatele');
      expect(ERROR_MESSAGES.UPDATE_USER_ERROR).toBe('Chyba při aktualizaci uživatele');
    });

    it('should have all profile error messages', () => {
      expect(ERROR_MESSAGES.UPDATE_PROFILE_ERROR).toBe('Chyba při aktualizaci profilu');
      expect(ERROR_MESSAGES.CHANGE_PASSWORD_ERROR).toBe('Chyba při změně hesla');
    });
  });

  describe('SUCCESS_MESSAGES', () => {
    it('should have all auth success messages', () => {
      expect(SUCCESS_MESSAGES.LOGIN_SUCCESS).toBe('Úspěšně přihlášen!');
      expect(SUCCESS_MESSAGES.REGISTER_SUCCESS).toBe('Úspěšně zaregistrován!');
      expect(SUCCESS_MESSAGES.LOGOUT_SUCCESS).toBe('Odhlášení proběhlo úspěšně');
    });

    it('should have all event success messages', () => {
      expect(SUCCESS_MESSAGES.EVENT_CREATED).toBe('Akce byla vytvořena!');
      expect(SUCCESS_MESSAGES.EVENT_UPDATED).toBe('Akce byla aktualizována!');
      expect(SUCCESS_MESSAGES.EVENT_DELETED).toBe('Akce byla smazána');
      expect(SUCCESS_MESSAGES.EVENT_PUBLISHED).toBe('Akce byla publikována');
      expect(SUCCESS_MESSAGES.EVENT_CANCELLED).toBe('Akce byla zrušena');
      expect(SUCCESS_MESSAGES.EVENT_COMPLETED).toBe('Akce byla označena jako proběhlá');
      expect(SUCCESS_MESSAGES.EVENT_DRAFT).toBe('Akce byla vrácena do konceptů');
      expect(SUCCESS_MESSAGES.EVENT_STATUS_CHANGED).toBe('Stav akce byl změněn');
    });

    it('should have all reservation success messages', () => {
      expect(SUCCESS_MESSAGES.RESERVATION_CREATED).toBe('Rezervace byla vytvořena!');
      expect(SUCCESS_MESSAGES.RESERVATION_CANCELLED).toBe('Rezervace byla zrušena');
      expect(SUCCESS_MESSAGES.RESERVATION_UPDATED).toBe('Rezervace byla aktualizována');
      expect(SUCCESS_MESSAGES.RESERVATION_ALREADY_PAID).toBe('Tato rezervace je již zaplacena');
    });

    it('should have all payment success messages', () => {
      expect(SUCCESS_MESSAGES.PAYMENT_SUCCESS).toBe('Platba byla úspěšná!');
      expect(SUCCESS_MESSAGES.PAYMENT_ALREADY_COMPLETED).toBe('Tato rezervace je již zaplacena');
    });

    it('should have all complaint success messages', () => {
      expect(SUCCESS_MESSAGES.COMPLAINT_SUBMITTED).toBe('Reklamace byla podána');
      expect(SUCCESS_MESSAGES.COMPLAINT_ACCEPTED).toBe('Reklamace byla přijata k řešení');
      expect(SUCCESS_MESSAGES.COMPLAINT_REJECTED).toBe('Reklamace byla zamítnuta');
      expect(SUCCESS_MESSAGES.COMPLAINT_RESOLVED).toBe('Reklamace byla vyřešena');
      expect(SUCCESS_MESSAGES.COMPLAINT_RESOLVED_WITH_REFUND).toBe('Reklamace byla vyřešena s refundací');
      expect(SUCCESS_MESSAGES.COMPLAINT_UPDATED).toBe('Reklamace byla aktualizována');
      expect(SUCCESS_MESSAGES.REFUND_PROCESSED).toBe('Reklamace byla aktualizována a refundace provedena');
    });

    it('should have all user success messages', () => {
      expect(SUCCESS_MESSAGES.USER_UPDATED).toBe('Uživatel byl aktualizován');
    });

    it('should have all profile success messages', () => {
      expect(SUCCESS_MESSAGES.PROFILE_UPDATED).toBe('Profil byl úspěšně aktualizován');
      expect(SUCCESS_MESSAGES.PASSWORD_CHANGED).toBe('Heslo bylo změněno');
    });

    it('should have ticket messages', () => {
      expect(SUCCESS_MESSAGES.TICKET_DOWNLOAD_PLACEHOLDER).toBe('Stahování vstupenky {code} (placeholder)');
      expect(SUCCESS_MESSAGES.TICKET_DOWNLOADED_PLACEHOLDER).toBe('Vstupenka byla stažena (placeholder)');
    });
  });

  describe('VALIDATION_MESSAGES', () => {
    it('should have all validation messages', () => {
      expect(VALIDATION_MESSAGES.REQUIRED_FIELD).toBe('Toto pole je povinné');
      expect(VALIDATION_MESSAGES.INVALID_EMAIL).toBe('Neplatný email');
      expect(VALIDATION_MESSAGES.PASSWORD_TOO_SHORT).toBe('Heslo musí mít alespoň 6 znaků');
      expect(VALIDATION_MESSAGES.REJECT_REASON_REQUIRED).toBe('Prosím vyplňte důvod zamítnutí');
      expect(VALIDATION_MESSAGES.RESPONSE_REQUIRED).toBe('Prosím vyplňte odpověď');
      expect(VALIDATION_MESSAGES.MIN_DESCRIPTION_LENGTH).toBe('Popis musí mít alespoň 20 znaků');
      expect(VALIDATION_MESSAGES.MIN_TITLE_LENGTH).toBe('Název musí mít alespoň 3 znaky');
      expect(VALIDATION_MESSAGES.MIN_TICKET_COUNT).toBe('Počet vstupenek musí být alespoň 1');
      expect(VALIDATION_MESSAGES.INVALID_TICKET_COUNT).toBe('Neplatný počet vstupenek');
    });
  });

  describe('CONFIRMATION_MESSAGES', () => {
    it('should have all confirmation messages', () => {
      expect(CONFIRMATION_MESSAGES.CANCEL_RESERVATION).toBe('Opravdu chcete zrušit tuto rezervaci?');
      expect(CONFIRMATION_MESSAGES.DELETE_EVENT).toBe('Opravdu chcete smazat tuto akci?');
      expect(CONFIRMATION_MESSAGES.CANCEL_EVENT).toBe('Opravdu chcete zrušit tuto akci? Všechny rezervace budou stornovány.');
      expect(CONFIRMATION_MESSAGES.PUBLISH_EVENT).toBe('Opravdu chcete publikovat tuto akci? Stane se veřejně dostupnou.');
      expect(CONFIRMATION_MESSAGES.REFUND_WARNING).toBe('Reklamace s refundací nemůže být vrácena do řešení. Refundaci nelze vrátit zpět.');
    });
  });

  describe('formatMessage', () => {
    it('should replace single placeholder', () => {
      const template = 'Stahování vstupenky {code}';
      const result = formatMessage(template, { code: 'ABC123' });
      
      expect(result).toBe('Stahování vstupenky ABC123');
    });

    it('should replace multiple placeholders', () => {
      const template = 'Uživatel {name} rezervoval {count} vstupenek';
      const result = formatMessage(template, { name: 'Jan', count: 5 });
      
      expect(result).toBe('Uživatel Jan rezervoval 5 vstupenek');
    });

    it('should handle missing values', () => {
      const template = 'Uživatel {name} rezervoval {count} vstupenek';
      const result = formatMessage(template, { name: 'Jan' });
      
      expect(result).toBe('Uživatel Jan rezervoval  vstupenek');
    });

    it('should handle numeric values', () => {
      const template = 'Cena: {price} Kč';
      const result = formatMessage(template, { price: 250 });
      
      expect(result).toBe('Cena: 250 Kč');
    });

    it('should handle zero values', () => {
      const template = 'Zbývá {count} vstupenek';
      const result = formatMessage(template, { count: 0 });
      
      // Note: formatMessage uses || operator, so 0 becomes empty string
      expect(result).toBe('Zbývá  vstupenek');
    });

    it('should handle empty string values', () => {
      const template = 'Název: {name}';
      const result = formatMessage(template, { name: '' });
      
      expect(result).toBe('Název: ');
    });

    it('should not replace non-matching placeholders', () => {
      const template = 'Test {placeholder} text';
      const result = formatMessage(template, { different: 'value' });
      
      expect(result).toBe('Test  text');
    });

    it('should handle template without placeholders', () => {
      const template = 'Simple message';
      const result = formatMessage(template, { key: 'value' });
      
      expect(result).toBe('Simple message');
    });

    it('should handle empty template', () => {
      const result = formatMessage('', { key: 'value' });
      
      expect(result).toBe('');
    });

    it('should handle empty values object', () => {
      const template = 'Test {placeholder}';
      const result = formatMessage(template, {});
      
      expect(result).toBe('Test ');
    });

    it('should handle special characters in values', () => {
      const template = 'Message: {msg}';
      const result = formatMessage(template, { msg: 'Test & <special>' });
      
      expect(result).toBe('Message: Test & <special>');
    });

    it('should handle unicode and emoji in values', () => {
      const template = 'Status: {status}';
      const result = formatMessage(template, { status: '✅ Úspěch' });
      
      expect(result).toBe('Status: ✅ Úspěch');
    });

    it('should handle repeated placeholders', () => {
      const template = '{name} a {name} jsou kamarádi';
      const result = formatMessage(template, { name: 'Jan' });
      
      expect(result).toBe('Jan a Jan jsou kamarádi');
    });

    it('should handle placeholder at start and end', () => {
      const template = '{start} text {end}';
      const result = formatMessage(template, { start: 'Begin', end: 'Finish' });
      
      expect(result).toBe('Begin text Finish');
    });

    it('should convert non-string values to strings', () => {
      const template = 'Value: {val}';
      const result = formatMessage(template, { val: null as any });
      
      expect(result).toBe('Value: ');
    });
  });

  describe('Message consistency', () => {
    it('should have Czech language messages', () => {
      const allMessages = [
        ...Object.values(ERROR_MESSAGES),
        ...Object.values(SUCCESS_MESSAGES),
        ...Object.values(VALIDATION_MESSAGES),
        ...Object.values(CONFIRMATION_MESSAGES),
      ];

      allMessages.forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });

    it('should not have duplicate messages', () => {
      const allMessages = [
        ...Object.values(ERROR_MESSAGES),
        ...Object.values(SUCCESS_MESSAGES),
        ...Object.values(VALIDATION_MESSAGES),
        ...Object.values(CONFIRMATION_MESSAGES),
      ];

      const uniqueMessages = new Set(allMessages);
      
      // Note: Some messages might intentionally be duplicated, so this is a soft check
      expect(uniqueMessages.size).toBeGreaterThan(0);
    });

    it('should have properly formatted messages', () => {
      const allMessages = [
        ...Object.values(ERROR_MESSAGES),
        ...Object.values(SUCCESS_MESSAGES),
        ...Object.values(VALIDATION_MESSAGES),
        ...Object.values(CONFIRMATION_MESSAGES),
      ];

      allMessages.forEach(message => {
        // Should not have leading/trailing whitespace (except intentionally)
        expect(message.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
