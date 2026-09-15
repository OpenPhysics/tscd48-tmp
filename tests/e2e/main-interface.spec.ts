import { expect, type Page, test } from '@playwright/test';

const SELECTORS = {
  STATUS_TEXT: '#statusText',
  STATUS_DOT: '#statusDot',
  CONNECT_BTN: '#connectBtn',
  CLEAR_BTN: '#clearBtn',
  LED_BTN: '#ledBtn',
  SETTINGS_BTN: '#settingsBtn',
  MONITOR_TAB: '#monitor-tab',
  TRACKING_TAB: '#tracking-tab',
  MONITOR_PANEL: '#monitorTab',
  TRACKING_PANEL: '#trackingTab',
  TRIGGER_SLIDER: '#triggerSlider',
  TRIGGER_VALUE: '#triggerValue',
  IMPEDANCE_SELECT: '#impedanceSelect',
  DAC_SLIDER: '#dacSlider',
  DAC_VALUE: '#dacValue',
  FIRMWARE: '#firmware',
  DEVICE_STATUS: '#deviceStatus',
  OVERFLOW: '#overflow',
  LOG: '#log',
  CHANNEL_SELECTOR: '#channelSelector',
  RATE_CHART: '#rateChart',
  TOTAL_POINTS: '#totalPoints',
  DURATION: '#duration',
  AVG_RATE: '#avgRate',
  PEAK_RATE: '#peakRate',
} as const;

const TIMEOUTS = {
  SHORT: 100,
} as const;

test.describe('CD48 Main Interface', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
  });

  test('should load the page with correct title', async ({
    page,
  }: {
    page: Page;
  }) => {
    await expect(page).toHaveTitle(/CD48 Coincidence Counter/);
  });

  test('should display header and subtitle', async ({
    page,
  }: {
    page: Page;
  }) => {
    const header = page.locator('h1');
    await expect(header).toHaveText('CD48 Coincidence Counter');

    const subtitle = page.locator('.subtitle');
    await expect(subtitle).toContainText('Web Serial Interface');
  });

  test('should display status bar with disconnect status', async ({
    page,
  }: {
    page: Page;
  }) => {
    const statusText = page.locator(SELECTORS.STATUS_TEXT);
    await expect(statusText).toHaveText('Disconnected');

    const statusDot = page.locator(SELECTORS.STATUS_DOT);
    await expect(statusDot).toBeVisible();
    await expect(statusDot).not.toHaveClass(/connected/);
  });

  test('should display connect button', async ({ page }: { page: Page }) => {
    const connectBtn = page.locator(SELECTORS.CONNECT_BTN);
    await expect(connectBtn).toBeVisible();
    await expect(connectBtn).toHaveText('Connect');
    await expect(connectBtn).toBeEnabled();
  });

  test('should have navigation tabs', async ({ page }: { page: Page }) => {
    const monitorTab = page.locator(SELECTORS.MONITOR_TAB);
    const trackingTab = page.locator(SELECTORS.TRACKING_TAB);

    await expect(monitorTab).toBeVisible();
    await expect(trackingTab).toBeVisible();
    await expect(monitorTab).toHaveAttribute('aria-selected', 'true');
    await expect(trackingTab).toHaveAttribute('aria-selected', 'false');
  });

  test('should switch between tabs', async ({ page }: { page: Page }) => {
    const monitorTab = page.locator(SELECTORS.MONITOR_TAB);
    const trackingTab = page.locator(SELECTORS.TRACKING_TAB);
    const monitorPanel = page.locator(SELECTORS.MONITOR_PANEL);
    const trackingPanel = page.locator(SELECTORS.TRACKING_PANEL);

    // Initially on monitor tab
    await expect(monitorPanel).toHaveClass(/active/);
    await expect(trackingPanel).not.toHaveClass(/active/);

    // Click tracking tab
    await trackingTab.click();
    await expect(trackingTab).toHaveAttribute('aria-selected', 'true');
    await expect(monitorTab).toHaveAttribute('aria-selected', 'false');
    await expect(trackingPanel).toHaveClass(/active/);
    await expect(monitorPanel).not.toHaveClass(/active/);

    // Click back to monitor tab
    await monitorTab.click();
    await expect(monitorTab).toHaveAttribute('aria-selected', 'true');
    await expect(trackingTab).toHaveAttribute('aria-selected', 'false');
    await expect(monitorPanel).toHaveClass(/active/);
    await expect(trackingPanel).not.toHaveClass(/active/);
  });

  test('should display all 8 channel counts', async ({
    page,
  }: {
    page: Page;
  }) => {
    for (let i = 0; i < 8; i++) {
      const countValue = page.locator(`#count${i}`);
      await expect(countValue).toBeVisible();
      await expect(countValue).toHaveText('-');
    }
  });

  test('should have controls section with sliders and selects', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Trigger Level slider
    const triggerSlider = page.locator(SELECTORS.TRIGGER_SLIDER);
    await expect(triggerSlider).toBeVisible();
    await expect(triggerSlider).toHaveAttribute('type', 'range');

    // Impedance select
    const impedanceSelect = page.locator(SELECTORS.IMPEDANCE_SELECT);
    await expect(impedanceSelect).toBeVisible();

    // DAC slider
    const dacSlider = page.locator(SELECTORS.DAC_SLIDER);
    await expect(dacSlider).toBeVisible();
    await expect(dacSlider).toHaveAttribute('type', 'range');
  });

  test('should update trigger voltage display when slider changes', async ({
    page,
  }: {
    page: Page;
  }) => {
    const triggerSlider = page.locator(SELECTORS.TRIGGER_SLIDER);
    const triggerValue = page.locator(SELECTORS.TRIGGER_VALUE);

    // Get initial value
    const initialValue = await triggerValue.textContent();

    // Change slider value
    await triggerSlider.fill('100');

    // Wait for value to update
    await page.waitForTimeout(TIMEOUTS.SHORT);

    const newValue = await triggerValue.textContent();
    expect(newValue).not.toBe(initialValue);
    expect(newValue).toContain('V');
  });

  test('should update DAC voltage display when slider changes', async ({
    page,
  }: {
    page: Page;
  }) => {
    const dacSlider = page.locator(SELECTORS.DAC_SLIDER);
    const dacValue = page.locator(SELECTORS.DAC_VALUE);

    // Get initial value
    const initialValue = await dacValue.textContent();

    // Change slider value
    await dacSlider.fill('128');

    // Wait for value to update
    await page.waitForTimeout(TIMEOUTS.SHORT);

    const newValue = await dacValue.textContent();
    expect(newValue).not.toBe(initialValue);
    expect(newValue).toContain('V');
  });

  test('should have disabled buttons when not connected', async ({
    page,
  }: {
    page: Page;
  }) => {
    const clearBtn = page.locator(SELECTORS.CLEAR_BTN);
    const ledBtn = page.locator(SELECTORS.LED_BTN);
    const settingsBtn = page.locator(SELECTORS.SETTINGS_BTN);

    await expect(clearBtn).toBeDisabled();
    await expect(ledBtn).toBeDisabled();
    await expect(settingsBtn).toBeDisabled();
  });

  test('should display device information section', async ({
    page,
  }: {
    page: Page;
  }) => {
    const firmware = page.locator(SELECTORS.FIRMWARE);
    const deviceStatus = page.locator(SELECTORS.DEVICE_STATUS);
    const overflow = page.locator(SELECTORS.OVERFLOW);

    await expect(firmware).toBeVisible();
    await expect(firmware).toHaveText('-');
    await expect(deviceStatus).toHaveText('Not connected');
    await expect(overflow).toHaveText('-');
  });

  test('should display activity log', async ({ page }: { page: Page }) => {
    const log = page.locator(SELECTORS.LOG);
    await expect(log).toBeVisible();
    await expect(log).toHaveAttribute('role', 'log');
  });

  test('should have footer with links', async ({ page }: { page: Page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    const links = footer.locator('a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display channel selector in tracking tab', async ({
    page,
  }: {
    page: Page;
  }) => {
    const trackingTab = page.locator(SELECTORS.TRACKING_TAB);
    await trackingTab.click();

    const channelSelector = page.locator(SELECTORS.CHANNEL_SELECTOR);
    await expect(channelSelector).toBeVisible();

    // Check for 8 channel toggles
    const chips = channelSelector.locator('.channel-toggle');
    const count = await chips.count();
    expect(count).toBe(8);
  });

  test('should toggle channel visibility in chart', async ({
    page,
  }: {
    page: Page;
  }) => {
    const trackingTab = page.locator(SELECTORS.TRACKING_TAB);
    await trackingTab.click();

    const channel0Chip = page.locator('[data-channel="0"]');
    await expect(channel0Chip).toHaveClass(/active/);
    await expect(channel0Chip).toHaveAttribute('aria-pressed', 'true');

    // Toggle off
    await channel0Chip.click();
    await expect(channel0Chip).not.toHaveClass(/active/);
    await expect(channel0Chip).toHaveAttribute('aria-pressed', 'false');

    // Toggle back on
    await channel0Chip.click();
    await expect(channel0Chip).toHaveClass(/active/);
    await expect(channel0Chip).toHaveAttribute('aria-pressed', 'true');
  });

  test('should display chart in tracking tab', async ({
    page,
  }: {
    page: Page;
  }) => {
    const trackingTab = page.locator(SELECTORS.TRACKING_TAB);
    await trackingTab.click();

    const chart = page.locator(SELECTORS.RATE_CHART);
    await expect(chart).toBeVisible();
  });

  test('should have statistics in tracking tab', async ({
    page,
  }: {
    page: Page;
  }) => {
    const trackingTab = page.locator(SELECTORS.TRACKING_TAB);
    await trackingTab.click();

    const totalPoints = page.locator(SELECTORS.TOTAL_POINTS);
    const duration = page.locator(SELECTORS.DURATION);
    const avgRate = page.locator(SELECTORS.AVG_RATE);
    const peakRate = page.locator(SELECTORS.PEAK_RATE);

    await expect(totalPoints).toBeVisible();
    await expect(duration).toBeVisible();
    await expect(avgRate).toBeVisible();
    await expect(peakRate).toBeVisible();
  });
});
