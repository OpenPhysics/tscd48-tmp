import { expect, test } from '@playwright/test';

test.describe('CD48 interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the disconnected monitor', async ({ page }) => {
    await expect(page).toHaveTitle(/CD48 Coincidence Counter/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'CD48 Coincidence Counter'
    );
    await expect(page.locator('#statusText')).toHaveText('Disconnected');
    await expect(page.locator('#connectBtn')).toBeEnabled();
    for (const id of ['clearBtn', 'ledBtn', 'settingsBtn']) {
      await expect(page.locator(`#${id}`)).toBeDisabled();
    }
    await expect(page.locator('.count-value')).toHaveCount(8);
    await expect(page.locator('#log')).toHaveAttribute('role', 'log');
  });

  test('updates voltage controls', async ({ page }) => {
    await page.locator('#triggerSlider').fill('100');
    await expect(page.locator('#triggerValue')).toContainText('V');

    await page.locator('#dacSlider').fill('128');
    await expect(page.locator('#dacValue')).toContainText('V');
    await expect(page.locator('#impedanceSelect')).toBeVisible();
  });

  test('switches to tracking and toggles a channel', async ({ page }) => {
    const trackingTab = page.locator('#tracking-tab');
    await trackingTab.click();

    await expect(trackingTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#trackingTab')).toHaveClass(/active/);
    await expect(page.locator('.channel-toggle')).toHaveCount(8);
    await expect(page.locator('#rateChart')).toBeVisible();
    await expect(
      page.locator('#totalPoints, #duration, #avgRate, #peakRate')
    ).toHaveCount(4);

    const channel = page.locator('[data-channel="0"]');
    await channel.click();
    await expect(channel).toHaveAttribute('aria-pressed', 'false');
  });
});
