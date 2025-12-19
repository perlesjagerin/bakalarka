import { Page } from '@playwright/test';

/**
 * Helper function to register a new user
 */
export async function registerUser(
  page: Page,
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  await page.goto('/register');
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.fill('input#firstName', firstName);
  await page.fill('input#lastName', lastName);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to login or home page
  await page.waitForURL(/\/(login|events)/);
}

/**
 * Helper function to login a user
 */
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to events page
  await page.waitForURL('/events');
}

/**
 * Helper function to logout
 */
export async function logoutUser(page: Page) {
  // Click on logout button
  await page.click('[data-testid="logout-button"]');
  
  // Wait for redirect to login or home page
  await page.waitForURL(/\/(login|$)/);
}
