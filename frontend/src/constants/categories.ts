export const EVENT_CATEGORIES = [
  'Hudba',
  'Divadlo',
  'Film',
  'Sport',
  'Vzdělávání',
  'Technologie',
  'Networking',
  'Party',
  'Ostatní',
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];
