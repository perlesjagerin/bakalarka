/**
 * Formátování data ve formátu dd.mm.yyyy
 * @param date - Datum jako string nebo Date objekt
 * @returns Naformátované datum
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('cs-CZ');
}

/**
 * Formátování data s časem ve formátu dd.mm.yyyy hh:mm
 * @param date - Datum jako string nebo Date objekt
 * @param options - Možnosti formátování (volitelné)
 * @returns Naformátované datum s časem
 */
export function formatDateTime(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Date(date).toLocaleString('cs-CZ', options || defaultOptions);
}

/**
 * Formátování data s názvem dne a měsíce
 * @param date - Datum jako string nebo Date objekt
 * @returns Naformátované datum s názvy (např. "Po 15. ledna 2024")
 */
export function formatDateLong(date: string | Date): string {
  if (!date) return 'Datum není k dispozici';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return 'Neplatné datum';
  
  return parsedDate.toLocaleDateString('cs-CZ', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formátování ceny v Kč
 * @param amount - Částka
 * @returns Naformátovaná cena (např. "1 500 Kč" nebo "Zadarmo")
 */
export function formatPrice(amount: number): string {
  if (amount === 0) {
    return 'Zadarmo';
  }
  return `${Number(amount).toLocaleString('cs-CZ')} Kč`;
}

/**
 * Formátování ceny v Kč bez textu "Zadarmo"
 * @param amount - Částka
 * @returns Naformátovaná cena (např. "1 500 Kč")
 */
export function formatPriceStrict(amount: number): string {
  return `${Number(amount).toLocaleString('cs-CZ')} Kč`;
}
