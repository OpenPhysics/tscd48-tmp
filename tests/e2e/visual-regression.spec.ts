import { expect, test } from '@playwright/test';
import { openPlayground } from './helpers.js';

const screenshot = {
  animations: 'disabled' as const,
  fullPage: true,
  maxDiffPixelRatio: 0.02,
};

test.describe('Visual regression', () => {
  test('examples index', async ({ page }) => {
    await page.goto('/examples/');
    await expect(page.locator('.example-card')).toHaveCount(11);
    await expect(page).toHaveScreenshot('examples-index.png', screenshot);
  });

  test('examples index on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/examples/');
    await expect(page.locator('.examples-grid')).toBeVisible();
    await expect(page).toHaveScreenshot(
      'examples-index-mobile.png',
      screenshot
    );
  });

  test('code playground with a template', async ({ page }) => {
    await openPlayground(page);
    await page.locator('#templateSelect').selectOption('basic');
    await expect(page.locator('.CodeMirror-code')).toContainText('getVersion');
    await expect(page).toHaveScreenshot(
      'code-playground-with-code.png',
      screenshot
    );
  });

  test('calibration wizard', async ({ page }) => {
    await page.goto('/examples/calibration-wizard.html');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveScreenshot(
      'calibration-wizard-step1.png',
      screenshot
    );
  });
});
