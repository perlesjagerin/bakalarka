import { test, expect } from '@playwright/test';

test.describe('Authentication E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Rezervace vstupenek/);
    // Check that events page is displayed
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    // Click login button in navbar
    await page.click('text=Přihlásit');
    await expect(page).toHaveURL(/.*login/);
    
    // Check login form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login');
    
    // Click submit without filling form
    await page.click('button[type="submit"]');
    
    // Wait a bit for validation
    await page.waitForTimeout(500);
    
    // Check that we're still on login page (form didn't submit)
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    
    // Find and click register link
    await page.click('text=Zaregistrujte se');
    await expect(page).toHaveURL(/.*register/);
    
    // Check register form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

