import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import MyReservationsPage from './pages/MyReservationsPage';
import MyEventsPage from './pages/MyEventsPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import ProfilePage from './pages/ProfilePage';
import ComplaintsPage from './pages/ComplaintsPage';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

function App() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
        
        {/* Protected routes */}
        <Route
          path="reservations"
          element={isAuthenticated ? <MyReservationsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="reservations/:reservationId/payment"
          element={isAuthenticated ? <PaymentPage /> : <Navigate to="/login" />}
        />
        <Route
          path="payment-success"
          element={isAuthenticated ? <PaymentSuccessPage /> : <Navigate to="/login" />}
        />
        <Route
          path="profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="complaints"
          element={isAuthenticated ? <ComplaintsPage /> : <Navigate to="/login" />}
        />
        
        {/* Organizer routes */}
        <Route
          path="my-events"
          element={
            isAuthenticated && (user?.role === 'ORGANIZER' || user?.role === 'ADMIN') ? (
              <MyEventsPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="events/create"
          element={
            isAuthenticated && (user?.role === 'ORGANIZER' || user?.role === 'ADMIN') ? (
              <CreateEventPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="events/:id/edit"
          element={
            isAuthenticated && (user?.role === 'ORGANIZER' || user?.role === 'ADMIN') ? (
              <EditEventPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        
        {/* Admin routes */}
        <Route
          path="admin/complaints"
          element={
            isAuthenticated && user?.role === 'ADMIN' ? (
              <AdminComplaintsPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="admin/users"
          element={
            isAuthenticated && user?.role === 'ADMIN' ? (
              <AdminUsersPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Route>
    </Routes>
    </ErrorBoundary>
  );
}

export default App;
