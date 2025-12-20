type FilterType = 'all' | 'SUBMITTED' | 'IN_REVIEW' | 'REJECTED' | 'RESOLVED';

interface ComplaintFiltersProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function ComplaintFilters({ 
  currentFilter, 
  onFilterChange 
}: ComplaintFiltersProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Vše' },
    { value: 'SUBMITTED', label: 'Čeká' },
    { value: 'IN_REVIEW', label: 'V řešení' },
    { value: 'REJECTED', label: 'Zamítnuto' },
    { value: 'RESOLVED', label: 'Vyřešeno' },
  ];

  return (
    <div className="mb-6 flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentFilter === filter.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
