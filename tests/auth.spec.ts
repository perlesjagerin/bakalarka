import { test, expect } from '@playwright/test';
import { testUsers } from './helpers/test-users';
import { registerUser, loginUser, logoutUser } from './helpers/auth-helpers';

test.describe('Authentication Flow', () => {
  test.describe.configure({ mode: 'serial' });

  const uniqueEmail = `test.${Date.now()}@example.com`;

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', testUsers.regularUser.password);
    await page.fill('input[name="firstName"]', testUsers.regularUser.firstName);
    await page.fill('input[name="lastName"]', testUsers.regularUser.lastName);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect (could be to login or directly to events)
    await page.waitForURL(/\/(login|events)/);

    // Check if we were redirected properly
    const url = page.url();
    expect(url).toMatch(/\/(login|events)/);
  });

  test('should login with registered user', async ({ page }) => {
    // First register the user
    await registerUser(
      page,
      uniqueEmail,
      testUsers.regularUser.password,
      testUsers.regularUser.firstName,
      testUsers.regularUser.lastName
    );

    // Now login
    await loginUser(page, uniqueEmail, testUsers.regularUser.password);

    // Verify we are on the events page
    await expect(page).toHaveURL('/events');

    // Verify user is logged in (check for user menu or user name)
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');
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

    // Verify we are on the login page
    await expect(page).toHaveURL('/login');
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
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', testUsers.regularUser.password);
    await page.fill('input[name="firstName"]', testUsers.regularUser.firstName);
    await page.fill('input[name="lastName"]', testUsers.regularUser.lastName);
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

    await page.fill('input[name="email"]', `weak.${Date.now()}@example.com`);
    await page.fill('input[name="password"]', '123'); // Weak password
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.click('button[type="submit"]');

    // Wait for validation error
    await page.waitForSelector('text=/heslo musí|password must|minimálně|at least/i', {
      timeout: 5000,
    });

    const errorMessage = page.locator('text=/heslo musí|password must|minimálně|at least/i');
    await expect(errorMessage).toBeVisible();
  });
});
