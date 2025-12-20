type FilterType = 'all' | 'USER' | 'ORGANIZER' | 'ADMIN';

interface UserFiltersProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

export default function UserFilters({ filter, setFilter }: UserFiltersProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Vše' },
    { value: 'USER', label: 'Uživatelé' },
    { value: 'ORGANIZER', label: 'Organizátoři' },
    { value: 'ADMIN', label: 'Administrátoři' },
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
