type FilterType = 'all' | 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';

interface ReservationFiltersProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

export default function ReservationFilters({ filter, setFilter }: ReservationFiltersProps) {
  const filters: Array<{ value: FilterType; label: string }> = [
    { value: 'all', label: 'Vše' },
    { value: 'PENDING', label: 'Čeká na platbu' },
    { value: 'PAID', label: 'Zaplaceno' },
    { value: 'CANCELLED', label: 'Zrušené' },
    { value: 'REFUNDED', label: 'Refundováno' },
  ];

  return (
    <div className="mb-6 flex gap-2">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === f.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
