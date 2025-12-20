import { useState } from 'react';

interface Event {
  status: string;
  availableTickets: number;
  totalTickets: number;
  ticketPrice: number;
}

interface EventReservationProps {
  event: Event;
  reserving: boolean;
  isAuthenticated: boolean;
  onReserve: (ticketCount: number) => void;
}

export default function EventReservation({ 
  event, 
  reserving, 
  isAuthenticated, 
  onReserve 
}: EventReservationProps) {
  const [ticketCount, setTicketCount] = useState(1);
  
  const soldTickets = event.totalTickets - event.availableTickets;
  const soldPercentage = (soldTickets / event.totalTickets) * 100;
  const totalPrice = ticketCount * event.ticketPrice;

  return (
    <div className="md:col-span-1">
      <div className="card sticky top-4">
        <h2 className="text-2xl font-bold mb-6">Rezervace vstupenek</h2>
        
        {event.status !== 'PUBLISHED' ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-medium">
              Tato akce není dostupná pro rezervaci.
            </p>
          </div>
        ) : event.availableTickets === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 font-medium">Vyprodáno</p>
            <p className="text-sm text-yellow-700 mt-2">
              Všechny vstupenky byly již rezervovány.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600 mb-2">Cena vstupenky</p>
              <p className="text-3xl font-bold text-gray-900">
                {Number(event.ticketPrice) === 0 ? 'Zadarmo' : `${Number(event.ticketPrice).toLocaleString('cs-CZ')} Kč`}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Počet vstupenek
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                  className="btn-secondary px-4 py-2"
                  disabled={ticketCount <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={event.availableTickets}
                  value={ticketCount}
                  onChange={(e) => setTicketCount(Math.max(1, Math.min(event.availableTickets, parseInt(e.target.value) || 1)))}
                  className="input text-center w-20"
                />
                <button
                  onClick={() => setTicketCount(Math.min(event.availableTickets, ticketCount + 1))}
                  className="btn-secondary px-4 py-2"
                  disabled={ticketCount >= event.availableTickets}
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Dostupných: {event.availableTickets} vstupenek
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Vstupenky ({ticketCount}x)</span>
                <span className="font-medium">{Number(event.ticketPrice) === 0 ? 'Zadarmo' : `${(Number(event.ticketPrice) * ticketCount).toLocaleString('cs-CZ')} Kč`}</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-bold text-lg">Celkem</span>
                <span className="font-bold text-2xl text-primary-600">{Number(totalPrice) === 0 ? 'Zadarmo' : `${Number(totalPrice).toLocaleString('cs-CZ')} Kč`}</span>
              </div>
            </div>

            <button
              onClick={() => onReserve(ticketCount)}
              disabled={reserving}
              className="btn-primary w-full py-3 text-lg"
              data-testid="reserve-button"
            >
              {reserving ? 'Vytvářím rezervaci...' : 'Rezervovat vstupenky'}
            </button>

            {!isAuthenticated && (
              <p className="text-sm text-gray-500 text-center mt-4">
                Pro rezervaci se musíte <a href="/login" className="text-primary-600 underline">přihlásit</a>
              </p>
            )}
          </>
        )}

        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-3 text-gray-900">Obsazenost</h3>
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Prodáno {soldTickets}/{event.totalTickets}</span>
              <span>{soldPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
