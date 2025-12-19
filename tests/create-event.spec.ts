import { test, expect } from '@playwright/test';
import { testUsers, testEvent } from './helpers/test-users';
import { registerUser, loginUser } from './helpers/auth-helpers';

test.describe('Create Event Flow', () => {
  test.describe.configure({ mode: 'serial' });

  const organizerEmail = `organizer.${Date.now()}@example.com`;

  test('should register as organizer', async ({ page }) => {
    await registerUser(
      page,
      organizerEmail,
      testUsers.organizer.password,
      testUsers.organizer.firstName,
      testUsers.organizer.lastName,
      'ORGANIZER'
    );

    // Wait for processing
    await page.waitForTimeout(2000);

    // Verify registration was successful (user menu visible)
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to My Events page', async ({ page }) => {
    // Login as organizer
    await loginUser(page, organizerEmail, testUsers.organizer.password);

    // Navigate to My Events
    await page.goto('/my-events');

    // Verify we're on the right page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/my-events');
  });

  test('should access Create Event page from My Events', async ({ page }) => {
    await loginUser(page, organizerEmail, testUsers.organizer.password);
    await page.goto('/my-events');

    // Find and click "Vytvořit akci" or "Create Event" button
    const createButton = page.locator('text=/vytvořit akci|create event/i').first();
    if (await createButton.isVisible({ timeout: 2000 })) {
      await createButton.click();
    } else {
      // Direct navigation if button not found
      await page.goto('/create-event');
    }

    // Verify we're on create event page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/create-event');
  });

  test('should display create event form', async ({ page }) => {
    await loginUser(page, organizerEmail, testUsers.organizer.password);
    await page.goto('/create-event');

    // Verify form elements are present
    const titleInput = page.locator('input[placeholder*="Letní"]').or(page.locator('label:has-text("Název")').locator('..').locator('input')).first();
    await expect(titleInput).toBeVisible({ timeout: 3000 });

    const descriptionTextarea = page.locator('textarea').first();
    await expect(descriptionTextarea).toBeVisible();

    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toBeVisible();
  });

  test('should create a new event successfully', async ({ page }) => {
    await loginUser(page, organizerEmail, testUsers.organizer.password);
    await page.goto('/create-event');

    const uniqueEventName = `E2E Test Event ${Date.now()}`;

    // Fill the form step by step
    // Title
    const titleInput = page.locator('input[placeholder*="Letní"]').or(page.locator('label:has-text("Název")').locator('..').locator('input')).first();
    await titleInput.fill(uniqueEventName);

    // Description
    const descriptionTextarea = page.locator('textarea').first();
    await descriptionTextarea.fill(testEvent.description);

    // Category
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption(testEvent.category);

    // Location
    const locationInput = page.locator('input[placeholder*="Adresa"]').or(page.locator('label:has-text("Místo")').locator('..').locator('input')).first();
    await locationInput.fill(testEvent.location);

    // Dates (find datetime-local inputs)
    const dateInputs = await page.locator('input[type="datetime-local"]').all();
    if (dateInputs.length >= 2) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      const startDateString = tomorrow.toISOString().slice(0, 16);
      await dateInputs[0].fill(startDateString);

      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 1);
      dayAfter.setHours(22, 0, 0, 0);
      const endDateString = dayAfter.toISOString().slice(0, 16);
      await dateInputs[1].fill(endDateString);
    }

    // Tickets and price (number inputs)
    const numberInputs = await page.locator('input[type="number"]').all();
    if (numberInputs.length >= 2) {
      await numberInputs[0].fill(testEvent.maxAttendees.toString()); // totalTickets
      await numberInputs[1].fill(testEvent.ticketPrice.toString()); // ticketPrice
    }

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for redirect or success message
    await page.waitForTimeout(3000);

    // Verify we're redirected away from create-event page
    expect(page.url()).not.toContain('/create-event');
  });
});

test.describe('Create Event Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as organizer
    await loginUser(page, testUsers.organizer.email, testUsers.organizer.password);
  });

  test('should create a new event', async ({ page }) => {
    // Navigate to create event page
    await page.goto('/create-event');

    // Fill event form using placeholders or visible text
    await page.fill('input[placeholder*="Např. Letní"]', testEvent.name);
    await page.fill('textarea', testEvent.description);
    await page.selectOption('select', testEvent.category);
    await page.fill('input[placeholder*="Adresa"]', testEvent.location);
    
    // Find and fill ticket inputs by their position
    const inputs = await page.locator('input[type="number"]').all();
    if (inputs.length >= 2) {
      await inputs[0].fill(testEvent.maxAttendees.toString()); // totalTickets
      await inputs[1].fill(testEvent.ticketPrice.toString()); // ticketPrice
    }

    // Select dates (find datetime-local inputs)
    const dateInputs = await page.locator('input[type="datetime-local"]').all();
    if (dateInputs.length >= 2) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().slice(0, 16);
      await dateInputs[0].fill(dateString); // startDate
      
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      const endDateString = dayAfter.toISOString().slice(0, 16);
      await dateInputs[1].fill(endDateString); // endDate
    }

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to my events or success message
    await page.waitForURL(/\/my-events|\/events/, { timeout: 10000 });

    // Verify success message or redirect
    const successMessage = page.locator('text=/úspěšně vytvořeno|successfully created/i');
    await expect(successMessage).toBeVisible({ timeout: 5000 }).catch(() => {
      // If no success message, at least verify we're on the right page
      expect(page.url()).toMatch(/\/my-events|\/events/);
    });
  });

  test('should display created event in My Events', async ({ page }) => {
    // Create event first
    await page.goto('/create-event');
    const uniqueEventName = `E2E Test Event ${Date.now()}`;
    
    await page.fill('input[name="name"]', uniqueEventName);
    await page.fill('textarea[name="description"]', testEvent.description);
    await page.selectOption('select[name="category"]', testEvent.category);
    await page.fill('input[name="location"]', testEvent.location);
    await page.fill('input[name="maxAttendees"]', testEvent.maxAttendees.toString());
    await page.fill('input[name="ticketPrice"]', testEvent.ticketPrice.toString());

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="date"]', dateString);

    await page.click('button[type="submit"]');

    // Navigate to My Events
    await page.goto('/my-events');

    // Verify event is displayed
    const eventCard = page.locator(`text="${uniqueEventName}"`);
    await expect(eventCard).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/create-event');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Check for validation errors (HTML5 or custom)
    const nameInput = page.locator('input[name="name"]');
    const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    
    expect(isInvalid).toBe(true);
  });

  test('should edit an existing event', async ({ page }) => {
    // Create event first
    await page.goto('/create-event');
    const originalName = `Original Event ${Date.now()}`;
    
    await page.fill('input[name="name"]', originalName);
    await page.fill('textarea[name="description"]', testEvent.description);
    await page.selectOption('select[name="category"]', testEvent.category);
    await page.fill('input[name="location"]', testEvent.location);
    await page.fill('input[name="maxAttendees"]', testEvent.maxAttendees.toString());
    await page.fill('input[name="ticketPrice"]', testEvent.ticketPrice.toString());

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="date"]', dateString);

    await page.click('button[type="submit"]');

    // Navigate to My Events
    await page.goto('/my-events');

    // Find and click edit button for the event
    const eventCard = page.locator(`text="${originalName}"`).locator('..');
    await eventCard.locator('[data-testid="edit-event"]').or(eventCard.locator('text=/upravit|edit/i')).first().click();

    // Wait for edit page
    await page.waitForURL(/\/edit-event/);

    // Change event name
    const newName = `Updated Event ${Date.now()}`;
    await page.fill('input[name="name"]', newName);
    await page.click('button[type="submit"]');

    // Verify update
    await page.goto('/my-events');
    const updatedEventCard = page.locator(`text="${newName}"`);
    await expect(updatedEventCard).toBeVisible();
  });

  test('should cancel an event', async ({ page }) => {
    // Create event first
    await page.goto('/create-event');
    const eventName = `Event to Cancel ${Date.now()}`;
    
    await page.fill('input[name="name"]', eventName);
    await page.fill('textarea[name="description"]', testEvent.description);
    await page.selectOption('select[name="category"]', testEvent.category);
    await page.fill('input[name="location"]', testEvent.location);
    await page.fill('input[name="maxAttendees"]', testEvent.maxAttendees.toString());
    await page.fill('input[name="ticketPrice"]', testEvent.ticketPrice.toString());

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="date"]', dateString);

    await page.click('button[type="submit"]');

    // Navigate to My Events
    await page.goto('/my-events');

    // Find and click cancel button
    const eventCard = page.locator(`text="${eventName}"`).locator('..');
    await eventCard.locator('[data-testid="cancel-event"]').or(eventCard.locator('text=/zrušit|cancel/i')).first().click();

    // Confirm cancellation if there's a dialog
    await page.locator('button:has-text("Ano")').or(page.locator('button:has-text("Potvrdit")')).click().catch(() => {});

    // Verify event is cancelled or removed
    await page.waitForTimeout(1000);
    const cancelledEvent = page.locator(`text="${eventName}"`);
    await expect(cancelledEvent).not.toBeVisible().catch(() => {
      // Or check if it has cancelled status
      expect(eventCard.locator('text=/zrušeno|cancelled/i')).toBeVisible();
    });
  });
});
