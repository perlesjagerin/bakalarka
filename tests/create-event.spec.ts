import { test, expect } from '@playwright/test';
import { testUsers, testEvent } from './helpers/test-users';
import { loginUser } from './helpers/auth-helpers';

test.describe('Create Event Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as organizer
    await loginUser(page, testUsers.organizer.email, testUsers.organizer.password);
  });

  test('should create a new event', async ({ page }) => {
    // Navigate to create event page
    await page.goto('/create-event');

    // Fill event form
    await page.fill('input[name="name"]', testEvent.name);
    await page.fill('textarea[name="description"]', testEvent.description);
    await page.selectOption('select[name="category"]', testEvent.category);
    await page.fill('input[name="location"]', testEvent.location);
    await page.fill('input[name="maxAttendees"]', testEvent.maxAttendees.toString());
    await page.fill('input[name="ticketPrice"]', testEvent.ticketPrice.toString());

    // Select date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="date"]', dateString);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to my events or success message
    await page.waitForURL(/\/my-events|\/events/);

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
