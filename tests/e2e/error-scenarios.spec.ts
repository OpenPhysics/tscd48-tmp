import { expect, test } from '@playwright/test';
import { openPlayground, setEditorCode } from './helpers.js';

test.describe('Error handling', () => {
  test('reports invalid code and recovers', async ({ page }) => {
    await openPlayground(page);
    const output = page.locator('#consoleOutput');

    await setEditorCode(page, 'throw new Error("Test error")');
    await page.locator('#runBtn').click();
    await expect(output).toContainText('Test error');

    await setEditorCode(page, 'console.log("Recovered")');
    await page.locator('#runBtn').click();
    await expect(output).toContainText('Recovered');

    await page.locator('#clearBtn').click();
    await expect(output).toHaveText(/Console cleared/);
  });

  test('warns when there is no code to run', async ({ page }) => {
    await openPlayground(page);
    await setEditorCode(page, '');
    await page.locator('#runBtn').click();
    await expect(page.locator('#consoleOutput')).toContainText(
      'No code to run'
    );
  });

  test('handles missing pages and empty search results', async ({ page }) => {
    const response = await page.goto('/examples/nonexistent.html');
    expect(response?.status()).toBe(404);
    await expect(page.locator('body')).toContainText(/404|not found/i);

    await page.goto('/examples/');
    await page.locator('#searchInput').fill('xyz123nonexistent');
    await expect(page.locator('.examples-grid')).toContainText(
      'No examples found'
    );
  });

  test('explains when Web Serial is unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      // biome-ignore lint/suspicious/noExplicitAny: Web Serial is optional
      delete (Navigator.prototype as any).serial;
    });
    await page.goto('/examples/error-handling.html');
    await expect(page.locator('body')).toContainText(/not supported/i);
  });
});
