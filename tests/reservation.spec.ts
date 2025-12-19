import { test, expect } from '@playwright/test';
import { testUsers } from './helpers/test-users';
import { registerUser, loginUser } from './helpers/auth-helpers';

test.describe('Reservation Flow', () => {
  test.describe.configure({ mode: 'serial' });

  const userEmail = 'user.' + Date.now() + '@example.com';

  test('should register as regular user', async ({ page }) => {
    await registerUser(
      page,
      userEmail,
      testUsers.regularUser.password,
      testUsers.regularUser.firstName,
      testUsers.regularUser.lastName,
      'USER'
    );

    await page.waitForTimeout(2000);
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible({ timeout: 5000 });
  });

  test('should browse events page', async ({ page }) => {
    await loginUser(page, userEmail, testUsers.regularUser.password);
    await page.goto('/events');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/events');
  });

  test('should navigate to My Reservations', async ({ page }) => {
    await loginUser(page, userEmail, testUsers.regularUser.password);
    await page.goto('/reservations');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/reservations');
  });
});
