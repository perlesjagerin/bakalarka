/**
 * Test user data for E2E tests
 */

export const testUsers = {
  regularUser: {
    email: 'test.user@example.com',
    password: 'Test1234!',
    firstName: 'Test',
    lastName: 'User',
  },
  organizer: {
    email: 'organizer@example.com',
    password: 'Organizer1234!',
    firstName: 'Event',
    lastName: 'Organizer',
  },
  admin: {
    email: 'admin@example.com',
    password: 'Admin1234!',
    firstName: 'Admin',
    lastName: 'User',
  },
};

export const testEvent = {
  name: 'E2E Test Event',
  description: 'This is a test event created during E2E testing',
  category: 'Koncert',
  location: 'Test Venue, Prague',
  maxAttendees: 100,
  ticketPrice: 500,
};

export const testComplaint = {
  reason: 'Test complaint reason',
  description: 'This is a test complaint created during E2E testing',
};
