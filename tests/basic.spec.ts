import { test, expect } from '@playwright/test';

test('login to finance dashboard', async ({ page }) => {
  await page.goto('/');
  
  // Select Finance department
  await page.click('text=Finance');
  
  // Enter credentials
  await page.fill('input[placeholder*="admin"]', 'finance');
  await page.fill('input[type="password"]', 'pass123');
  
  // Submit login
  await page.click('button:has-text("Login to Dashboard")');
  
  // Check if redirected to finance overview
  await expect(page).toHaveURL(/.*finance\/overview/);
  
  // Check for some text on the overview page
  await expect(page.locator('h1')).toContainText(/Finance Overview/i);
});
