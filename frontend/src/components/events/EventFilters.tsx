type FilterType = 'all' | 'PUBLISHED' | 'DRAFT' | 'COMPLETED' | 'CANCELLED';

interface EventFiltersProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

export default function EventFilters({ filter, setFilter }: EventFiltersProps) {
  const filters: Array<{ value: FilterType; label: string }> = [
    { value: 'all', label: 'Vše' },
    { value: 'PUBLISHED', label: 'Publikováno' },
    { value: 'DRAFT', label: 'Koncepty' },
    { value: 'COMPLETED', label: 'Proběhlo' },
    { value: 'CANCELLED', label: 'Zrušeno' },
  ];

  return (
    <div className="mb-6 flex gap-2 flex-wrap">
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
