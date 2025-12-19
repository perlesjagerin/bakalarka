import { test, expect } from '@playwright/test';
import { testUsers } from './helpers/test-users';
import { registerUser, loginUser, logoutUser } from './helpers/auth-helpers';

test.describe('Authentication Flow', () => {
  test.describe.configure({ mode: 'serial' });

  const uniqueEmail = `test.${Date.now()}@example.com`;

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.fill('input#email', uniqueEmail);
    await page.fill('input#password', testUsers.regularUser.password);
    await page.fill('input#firstName', testUsers.regularUser.firstName);
    await page.fill('input#lastName', testUsers.regularUser.lastName);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for processing
    await page.waitForTimeout(3000);

    // Check if we were redirected away from register page OR user menu is visible
    const userMenu = page.locator('[data-testid="user-menu"]');
    const isRegistered = await userMenu.isVisible().catch(() => false);
    
    if (isRegistered) {
      // Successfully registered and logged in
      expect(page.url()).not.toContain('/register');
    } else {
      // Might have redirected to login
      expect(page.url()).toMatch(/\/(login|$)/);
    }
  });

  test('should login with existing user', async ({ page }) => {
    // The user from previous test should exist
    await page.goto('/login');

    await page.fill('input#email', uniqueEmail);
    await page.fill('input#password', testUsers.regularUser.password);
    await page.click('button[type="submit"]');

    // Wait for processing
    await page.waitForTimeout(3000);

    // Verify user is logged in (check for user menu)
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible({ timeout: 5000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input#email', 'nonexistent@example.com');
    await page.fill('input#password', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Wait for error message
    await page.waitForSelector('text=/neplatné|chybné|není správné|neexistuje/i', {
      timeout: 5000,
    });

    // Verify error message is visible
    const errorMessage = page.locator('text=/neplatné|chybné|není správné|neexistuje/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await loginUser(page, uniqueEmail, testUsers.regularUser.password);

    // Logout
    await logoutUser(page);

    // Verify user menu is not visible (user is logged out)
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).not.toBeVisible();
    
    // Verify login button is visible
    const loginLink = page.locator('text=Přihlásit se');
    await expect(loginLink).toBeVisible();
  });

  test('should not allow duplicate email registration', async ({ page }) => {
    // Register first time
    await registerUser(
      page,
      uniqueEmail,
      testUsers.regularUser.password,
      testUsers.regularUser.firstName,
      testUsers.regularUser.lastName
    );

    // Try to register again with same email
    await page.goto('/register');
    await page.fill('input#email', uniqueEmail);
    await page.fill('input#password', testUsers.regularUser.password);
    await page.fill('input#firstName', testUsers.regularUser.firstName);
    await page.fill('input#lastName', testUsers.regularUser.lastName);
    await page.click('button[type="submit"]');

    // Wait for error message
    await page.waitForSelector('text=/již existuje|already exists|duplicate/i', {
      timeout: 5000,
    });

    // Verify error message
    const errorMessage = page.locator('text=/již existuje|already exists|duplicate/i');
    await expect(errorMessage).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input#email', `weak.${Date.now()}@example.com`);
    await page.fill('input#password', '123'); // Weak password (less than minLength=6)
    await page.fill('input#firstName', 'Test');
    await page.fill('input#lastName', 'User');
    
    // Try to submit - HTML5 validation should prevent it
    await page.click('button[type="submit"]');
    
    // Wait a moment
    await page.waitForTimeout(1000);

    // Check that we're still on the register page (validation prevented submission)
    expect(page.url()).toContain('/register');
    
    // Check HTML5 validation state
    const passwordInput = page.locator('input#password');
    const isInvalid = await passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });
});
