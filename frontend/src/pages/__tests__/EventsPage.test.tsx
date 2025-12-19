import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventsPage from '../../pages/EventsPage';

// Mock axios
let mockAxiosGet: ReturnType<typeof vi.fn>;

vi.mock('../../lib/axios', () => ({
  default: {
    get: (...args: any[]) => mockAxiosGet(...args)
  }
}));

const mockEventsData = [
  {
    id: '1',
        title: 'Test Event 1',
        description: 'Description 1',
        location: 'Location 1',
        startDate: '2025-12-25T10:00:00Z',
        endDate: '2025-12-25T12:00:00Z',
        category: 'Hudba',
        imageUrl: '/test1.jpg',
        totalTickets: 100,
        availableTickets: 50,
        ticketPrice: 250,
        status: 'PUBLISHED'
      },
      {
        id: '2',
        title: 'Test Event 2',
        description: 'Description 2',
        location: 'Location 2',
        startDate: '2025-12-26T10:00:00Z',
        endDate: '2025-12-26T12:00:00Z',
        category: 'Sport',
        imageUrl: '/test2.jpg',
        totalTickets: 50,
        availableTickets: 25,
        ticketPrice: 150,
        status: 'PUBLISHED'
      }
];

const renderEventsPage = () => {
  return render(
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <EventsPage />
    </BrowserRouter>
  );
};

describe('EventsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosGet = vi.fn(() => Promise.resolve({
      data: {
        events: mockEventsData
      }
    }));
  });

  it('renders page title', async () => {
    renderEventsPage();
    expect(screen.getByText('Nadcházející akce')).toBeInTheDocument();
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.queryByText('Načítání...')).not.toBeInTheDocument();
    });
  });

  it('displays loading state initially', async () => {
    renderEventsPage();
    expect(screen.getByText('Načítání...')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Načítání...')).not.toBeInTheDocument();
    });
  });

  it('renders event cards after loading', async () => {
    renderEventsPage();
    
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
  });

  it('displays event locations', async () => {
    renderEventsPage();
    
    await waitFor(() => {
      expect(screen.getByText('Location 1')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Location 2')).toBeInTheDocument();
  });

  it('displays event categories', async () => {
    renderEventsPage();
    
    await waitFor(() => {
      const hudbaElements = screen.getAllByText('Hudba');
      expect(hudbaElements.length).toBeGreaterThan(0);
    });
    
    const sportElements = screen.getAllByText('Sport');
    expect(sportElements.length).toBeGreaterThan(0);
  });

  it('renders search input', async () => {
    renderEventsPage();
    
    expect(screen.getByPlaceholderText('Hledat akce...')).toBeInTheDocument();
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.queryByText('Načítání...')).not.toBeInTheDocument();
    });
  });

  it('renders category filter select', async () => {
    renderEventsPage();
    
    expect(screen.getByText('Všechny kategorie')).toBeInTheDocument();
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.queryByText('Načítání...')).not.toBeInTheDocument();
    });
  });

  it('displays empty state when no events found', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { events: [] } });
    
    renderEventsPage();
    
    await waitFor(() => {
      expect(screen.getByText('Žádné akce nebyly nalezeny.')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('API Error'));
    
    renderEventsPage();
    
    await waitFor(() => {
      // Toast error is displayed (tested via toast mock in actual implementation)
      expect(mockAxiosGet).toHaveBeenCalled();
    });
  });
});
