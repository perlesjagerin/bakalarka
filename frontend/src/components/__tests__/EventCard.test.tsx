import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import EventCard from '../EventCard';

const mockEvent = {
  id: '1',
  title: 'Test Event',
  description: 'This is a test event description',
  location: 'Test Location',
  startDate: '2025-06-15T20:00:00.000Z',
  endDate: '2025-06-15T23:00:00.000Z',
  category: 'Hudba',
  totalTickets: 100,
  availableTickets: 50,
  ticketPrice: 250,
  status: 'PUBLISHED',
  imageUrl: 'https://example.com/image.jpg'
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {component}
    </BrowserRouter>
  );
};

describe('EventCard', () => {
  it('renders event title', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('renders event description', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    expect(screen.getByText('This is a test event description')).toBeInTheDocument();
  });

  it('renders event location', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  it('renders event category badge', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    expect(screen.getByText('Hudba')).toBeInTheDocument();
  });

  it('renders ticket availability', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    expect(screen.getByText(/Volných: 50 \/ 100/)).toBeInTheDocument();
  });

  it('renders ticket price', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    expect(screen.getByText(/250/)).toBeInTheDocument();
    expect(screen.getByText(/Kč/)).toBeInTheDocument();
  });

  it('renders "Zadarmo" for free events', () => {
    const freeEvent = { ...mockEvent, ticketPrice: 0 };
    renderWithRouter(<EventCard event={freeEvent} />);
    expect(screen.getByText('Zadarmo')).toBeInTheDocument();
  });

  it('renders "Zobrazit detail" button', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    expect(screen.getByText('Zobrazit detail')).toBeInTheDocument();
  });

  it('renders event image when provided', () => {
    renderWithRouter(<EventCard event={mockEvent} />);
    const image = screen.getByAltText('Test Event');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockEvent.imageUrl);
  });

  it('links to correct event detail page', () => {
    const { container } = renderWithRouter(<EventCard event={mockEvent} />);
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '/events/1');
  });
});
