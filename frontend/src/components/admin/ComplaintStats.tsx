interface ComplaintStatsProps {
  total: number;
  pending: number;
  resolved: number;
  rejected: number;
}

export default function ComplaintStats({ 
  total, 
  pending, 
  resolved, 
  rejected 
}: ComplaintStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="card">
        <p className="text-gray-600 mb-1">Celkem</p>
        <p className="text-3xl font-bold text-gray-900">{total}</p>
      </div>
      <div className="card">
        <p className="text-gray-600 mb-1">Čeká na řešení</p>
        <p className="text-3xl font-bold text-yellow-600">{pending}</p>
      </div>
      <div className="card">
        <p className="text-gray-600 mb-1">Vyřešeno</p>
        <p className="text-3xl font-bold text-green-600">{resolved}</p>
      </div>
      <div className="card">
        <p className="text-gray-600 mb-1">Zamítnuto</p>
        <p className="text-3xl font-bold text-red-600">{rejected}</p>
      </div>
    </div>
  );
}
