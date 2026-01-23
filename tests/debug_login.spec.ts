import { test, expect } from '@playwright/test';

test('debug login', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Finance');
  await page.fill('input[placeholder*="admin"]', 'finance@selorg.com');
  await page.fill('input[type="password"]', 'pass123');
  await page.click('button:has-text("Login to Dashboard")');
  
  // Wait a bit and take a screenshot
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'login-debug.png' });
  
  const url = page.url();
  console.log('Current URL:', url);
  
  if (url.includes('login')) {
    // Check for error toast or message
    const errorToast = page.locator('.sonner-toast');
    if (await errorToast.isVisible()) {
      console.log('Error toast visible:', await errorToast.innerText());
    }
  }
});


