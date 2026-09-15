import { expect, test } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('provides landmarks, labels, and live regions', async ({ page }) => {
    await expect(page.locator('[role="banner"]')).toBeVisible();
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('[role="contentinfo"]')).toBeVisible();
    await expect(page.locator('[role="tablist"]')).toBeVisible();

    for (const id of ['connectBtn', 'clearBtn', 'triggerSlider', 'dacSlider']) {
      await expect(page.locator(`#${id}`)).toHaveAttribute('aria-label');
    }
    for (const id of ['statusText', 'browserWarning']) {
      await expect(page.locator(`#${id}`)).toHaveAttribute(
        'aria-live',
        'polite'
      );
    }
    await expect(page.locator('label[for="triggerSlider"]')).toHaveText(
      'Trigger Level'
    );
  });

  test('supports keyboard navigation', async ({ page }) => {
    const skipLink = page.locator('.skip-link');
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute('href', '#main-content');

    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeVisible();

    const slider = page.locator('#triggerSlider');
    const initialValue = Number(await slider.inputValue());
    await slider.press('ArrowRight');
    expect(Number(await slider.inputValue())).toBeGreaterThan(initialValue);
  });

  test('keeps tab and channel states accessible', async ({ page }) => {
    const trackingTab = page.locator('#tracking-tab');
    await expect(trackingTab).toHaveAttribute('role', 'tab');
    await trackingTab.click();
    await expect(trackingTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#trackingTab')).toHaveAttribute(
      'role',
      'tabpanel'
    );

    const channel = page.locator('[data-channel="0"]');
    await channel.click();
    await expect(channel).toHaveAttribute('aria-pressed', 'false');

    for (const link of await page.locator('a[target="_blank"]').all()) {
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });
});
