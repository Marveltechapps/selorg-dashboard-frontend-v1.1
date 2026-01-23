import { test, expect } from '@playwright/test';

test.describe('Finance Dashboard: Billing and Refunds', () => {
  test.beforeEach(async ({ page }) => {
    // Perform login
    await page.goto('/');
    await page.click('text=Finance');
    await page.fill('input[placeholder*="admin"]', 'finance@selorg.com');
    await page.fill('input[type="password"]', 'pass123');
    await page.click('button:has-text("Login to Dashboard")');
    // Wait for navigation to complete
    await page.waitForURL(/.*finance\/overview/, { timeout: 20000 });
    await expect(page).toHaveURL(/.*finance\/overview/);
  });

  test('Verify Billing & Invoicing screen', async ({ page }) => {
    // Navigate to Billing
    await page.locator('nav >> a:has-text("Billing & Invoicing")').click();
    await page.waitForURL(/.*finance\/billing/, { timeout: 20000 });
    
    // Check header
    await expect(page.locator('h1')).toContainText(/Billing & Invoicing/i);
    
    // Wait for summary cards to load
    await expect(page.getByText('Sent', { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Pending', { exact: true })).toBeVisible();
    await expect(page.getByText('Overdue', { exact: true })).toBeVisible();
    await expect(page.getByText('Paid', { exact: true })).toBeVisible();
    
    // Select "Paid"
    await page.click('h3:has-text("Paid")');
    
    // Wait for table
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 15000 });
    
    // Verify invoice mapping
    const firstRow = table.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    
    // Click the row or details button
    await firstRow.click();
    
    // Verify Drawer
    const drawer = page.locator('[data-slot="sheet-content"]');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/Grand Total/i)).toBeVisible();
    
    // Check for absence of Delete
    await expect(drawer.locator('button:has-text("Delete")')).not.toBeVisible();
  });

  test('Verify Refunds & Returns screen', async ({ page }) => {
    // Navigate to Refunds
    await page.locator('nav >> a:has-text("Refunds & Returns")').click();
    await page.waitForURL(/.*finance\/refunds/, { timeout: 20000 });
    
    // Check header
    await expect(page.locator('h1')).toContainText(/Refunds & Returns/i);
    
    // Wait for summary cards (use exact text to avoid ambiguous matches)
    await expect(page.getByText('Refund Requests', { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Processed Today', { exact: true })).toBeVisible();
    
    // Wait for table or empty state
    const table = page.locator('table');
    const emptyState = page.locator('text=No refund requests');
    
    await expect(table.or(emptyState)).toBeVisible({ timeout: 15000 });
    
    if (await table.isVisible()) {
        const firstRow = table.locator('tbody tr').first();
        await expect(firstRow).toBeVisible();
        
        // Click the row
        await firstRow.click();
        
        // Verify Drawer
        const drawer = page.locator('[data-slot="sheet-content"]');
        await expect(drawer).toBeVisible();
        await expect(drawer.getByText(/Request Details/i)).toBeVisible();
        
        // Check for absence of Delete
        await expect(drawer.locator('button:has-text("Delete")')).not.toBeVisible();
    }
  });
});
