import { expect, test } from '@playwright/test';
import { EXAMPLE_PAGES, openPlayground } from './helpers.js';

test.describe('Examples', () => {
  test('loads every example', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    for (const [path, title] of EXAMPLE_PAGES) {
      await test.step(path, async () => {
        const response = await page.goto(path);
        expect(response?.ok()).toBeTruthy();
        await expect(page).toHaveTitle(title);

        const unexpectedErrors = errors
          .splice(0)
          .filter(
            (error) =>
              !['not connected', 'not supported', 'user cancelled'].some(
                (expected) => error.toLowerCase().includes(expected)
              )
          );
        expect(unexpectedErrors).toEqual([]);
      });
    }
  });

  test('filters and opens an example', async ({ page }) => {
    await page.goto('/examples/');
    const cards = page.locator('.example-card');
    await expect(cards).toHaveCount(11);

    await page.locator('#searchInput').fill('calibration');
    await expect(cards).toHaveCount(1);
    await expect(cards).toContainText('Calibration Wizard');

    await cards.click();
    await expect(page).toHaveURL(/calibration-wizard(?:\.html)?$/);
  });

  test('uses playground templates and tabs', async ({ page }) => {
    await openPlayground(page);
    await page.locator('#templateSelect').selectOption('basic');
    await expect(page.locator('.CodeMirror-code')).toContainText('getVersion');

    await page.locator('.tab[data-tab="device"]').click();
    await expect(page.locator('.tab-content[data-tab="device"]')).toHaveClass(
      /active/
    );
  });
});
