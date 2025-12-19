import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navbar from '../../components/layout/Navbar';

// Mock useAuthStore
let mockLogout: ReturnType<typeof vi.fn>;
let mockUseAuthStore: ReturnType<typeof vi.fn>;

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => mockUseAuthStore()
}));

const renderNavbar = () => {
  return render(
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    mockLogout = vi.fn();
    mockUseAuthStore = vi.fn(() => ({
      user: null,
      isAuthenticated: false,
      logout: mockLogout
    }));
  });

  describe('when not authenticated', () => {
    it('renders application title', () => {
      renderNavbar();
      expect(screen.getByText('StudentTickets')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
      renderNavbar();
      expect(screen.getByText('Akce')).toBeInTheDocument();
    });

    it('renders login button', () => {
      renderNavbar();
      expect(screen.getByText('Přihlásit se')).toBeInTheDocument();
    });

    it('renders registration button', () => {
      renderNavbar();
      expect(screen.getByText('Registrace')).toBeInTheDocument();
    });

    it('contains link to events page', () => {
      renderNavbar();
      const eventsLink = screen.getByText('Akce').closest('a');
      expect(eventsLink).toHaveAttribute('href', '/events');
    });

    it('contains link to home page', () => {
      renderNavbar();
      const homeLink = screen.getByText('StudentTickets').closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('when authenticated as USER', () => {
    beforeEach(() => {
      mockUseAuthStore = vi.fn(() => ({
        user: {
          id: '1',
          email: 'user@test.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER'
        },
        isAuthenticated: true,
        logout: mockLogout
      }));
    });

    it('renders user name', () => {
      renderNavbar();
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    it('renders logout button', () => {
      renderNavbar();
      expect(screen.getByText('Odhlásit')).toBeInTheDocument();
    });

    it('renders my reservations link', () => {
      renderNavbar();
      expect(screen.getByText('Moje rezervace')).toBeInTheDocument();
    });

    it('renders my complaints link', () => {
      renderNavbar();
      expect(screen.getByText('Moje reklamace')).toBeInTheDocument();
    });

    it('does not render login/registration buttons', () => {
      renderNavbar();
      expect(screen.queryByText('Přihlásit se')).not.toBeInTheDocument();
      expect(screen.queryByText('Registrace')).not.toBeInTheDocument();
    });
  });

  describe('when authenticated as ORGANIZER', () => {
    beforeEach(() => {
      mockUseAuthStore = vi.fn(() => ({
        user: {
          id: '2',
          email: 'organizer@test.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'ORGANIZER'
        },
        isAuthenticated: true,
        logout: mockLogout
      }));
    });

    it('renders my events link', () => {
      renderNavbar();
      expect(screen.getByText('Moje akce')).toBeInTheDocument();
    });
  });

  describe('when authenticated as ADMIN', () => {
    beforeEach(() => {
      mockUseAuthStore = vi.fn(() => ({
        user: {
          id: '3',
          email: 'admin@test.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN'
        },
        isAuthenticated: true,
        logout: mockLogout
      }));
    });

    it('renders admin events link', () => {
      renderNavbar();
      expect(screen.getByText('Správa akcí')).toBeInTheDocument();
    });

    it('renders admin users link', () => {
      renderNavbar();
      expect(screen.getByText('Správa uživatelů')).toBeInTheDocument();
    });

    it('renders admin complaints link', () => {
      renderNavbar();
      expect(screen.getByText('Správa reklamací')).toBeInTheDocument();
    });
  });
});
