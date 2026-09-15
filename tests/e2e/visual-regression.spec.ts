import { expect, type Page, test } from '@playwright/test';

/**
 * Visual Regression Tests
 * These tests capture screenshots and compare them against baseline images
 * Run with: npm run test:e2e -- --update-snapshots to update baselines
 */

interface Viewport {
  readonly width: number;
  readonly height: number;
  readonly name: 'mobile' | 'tablet' | 'desktop';
}

interface ScreenshotOptions {
  readonly fullPage: boolean;
  readonly animations: 'disabled';
  readonly maxDiffPixelRatio: number;
}

const SCREENSHOT_OPTIONS: ScreenshotOptions = {
  fullPage: true,
  animations: 'disabled',
  // Allow small antialiasing / font rasterization drift across CI runners.
  maxDiffPixelRatio: 0.02,
} as const;

const COMPONENT_SCREENSHOT_OPTIONS = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.02,
} as const;

const VIEWPORTS: readonly Viewport[] = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1920, height: 1080, name: 'desktop' },
] as const;

const TEST_PAGES = [
  '/examples/',
  '/examples/code-playground.html',
  '/examples/statistical-analysis.html',
  '/examples/calibration-wizard.html',
] as const;

const SELECTORS = {
  CODE_MIRROR: '.CodeMirror',
  EXAMPLE_CARD: '.example-card',
  EXAMPLES_GRID: '.examples-grid',
  CATEGORIES: '.categories',
  SEARCH_INPUT: '#searchInput',
  TEMPLATE_SELECT: '#templateSelect',
  CATEGORY_ADVANCED: '[data-category="advanced"]',
} as const;

const TIMEOUTS = {
  IMAGE_LOAD: 500,
  SEARCH_FILTER: 200,
  HOVER_ANIMATION: 300,
} as const;

test.describe('Visual Regression - Examples Pages', () => {
  test('examples index - initial load', async ({ page }: { page: Page }) => {
    await page.goto('/examples/');
    await page.waitForLoadState('networkidle');

    // Wait for all images to load
    await page.waitForTimeout(TIMEOUTS.IMAGE_LOAD);

    // Take screenshot
    await expect(page).toHaveScreenshot(
      'examples-index.png',
      SCREENSHOT_OPTIONS
    );
  });

  test('examples index - search active', async ({ page }: { page: Page }) => {
    await page.goto('/examples/');
    await page.waitForLoadState('networkidle');

    // Type in search
    await page.fill(SELECTORS.SEARCH_INPUT, 'analysis');
    await page.waitForTimeout(TIMEOUTS.SEARCH_FILTER);

    // Take screenshot
    await expect(page).toHaveScreenshot(
      'examples-index-search.png',
      SCREENSHOT_OPTIONS
    );
  });

  test('code playground - initial state', async ({ page }: { page: Page }) => {
    await page.goto('/examples/code-playground.html');
    await page.waitForSelector(SELECTORS.CODE_MIRROR);
    await page.waitForTimeout(TIMEOUTS.IMAGE_LOAD);

    // Take screenshot
    await expect(page).toHaveScreenshot(
      'code-playground-initial.png',
      SCREENSHOT_OPTIONS
    );
  });

  test('code playground - with code', async ({ page }: { page: Page }) => {
    await page.goto('/examples/code-playground.html');
    await page.waitForSelector(SELECTORS.CODE_MIRROR);

    // Select a template
    await page.selectOption(SELECTORS.TEMPLATE_SELECT, 'basic');
    await page.waitForTimeout(TIMEOUTS.IMAGE_LOAD);

    // Take screenshot
    await expect(page).toHaveScreenshot(
      'code-playground-with-code.png',
      SCREENSHOT_OPTIONS
    );
  });

  test('simple monitor - initial load', async ({ page }: { page: Page }) => {
    await page.goto('/examples/simple-monitor.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TIMEOUTS.IMAGE_LOAD);

    // Take screenshot
    await expect(page).toHaveScreenshot(
      'simple-monitor.png',
      SCREENSHOT_OPTIONS
    );
  });

  test('statistical analysis - initial load', async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto('/examples/statistical-analysis.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TIMEOUTS.IMAGE_LOAD);

    // Take screenshot
    await expect(page).toHaveScreenshot(
      'statistical-analysis.png',
      SCREENSHOT_OPTIONS
    );
  });

  test('calibration wizard - step 1', async ({ page }: { page: Page }) => {
    await page.goto('/examples/calibration-wizard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TIMEOUTS.IMAGE_LOAD);

    // Take screenshot of first step
    await expect(page).toHaveScreenshot(
      'calibration-wizard-step1.png',
      SCREENSHOT_OPTIONS
    );
  });
});

test.describe('Visual Regression - Component States', () => {
  test('examples index - hover state on card', async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto('/examples/');
    await page.waitForLoadState('networkidle');

    // Hover over first card
    const firstCard = page.locator(SELECTORS.EXAMPLE_CARD).first();
    await firstCard.hover();
    await page.waitForTimeout(TIMEOUTS.HOVER_ANIMATION);

    // Take screenshot of grid area
    await expect(page.locator(SELECTORS.EXAMPLES_GRID)).toHaveScreenshot(
      'card-hover-state.png',
      COMPONENT_SCREENSHOT_OPTIONS
    );
  });

  test('category tag - active state', async ({ page }: { page: Page }) => {
    await page.goto('/examples/');
    await page.waitForLoadState('networkidle');

    // Click category
    await page.click(SELECTORS.CATEGORY_ADVANCED);
    await page.waitForTimeout(TIMEOUTS.SEARCH_FILTER);

    // Take screenshot of categories
    await expect(page.locator(SELECTORS.CATEGORIES)).toHaveScreenshot(
      'category-active-state.png',
      COMPONENT_SCREENSHOT_OPTIONS
    );
  });
});

test.describe('Visual Regression - Responsive', () => {
  for (const viewport of VIEWPORTS) {
    test(`examples index on ${viewport.name}`, async ({
      page,
    }: {
      page: Page;
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto('/examples/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.IMAGE_LOAD);

      await expect(page).toHaveScreenshot(
        `examples-index-${viewport.name}.png`,
        SCREENSHOT_OPTIONS
      );
    });

    test(`code playground on ${viewport.name}`, async ({
      page,
    }: {
      page: Page;
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto('/examples/code-playground.html');
      await page.waitForSelector(SELECTORS.CODE_MIRROR);
      await page.waitForTimeout(TIMEOUTS.IMAGE_LOAD);

      await expect(page).toHaveScreenshot(
        `code-playground-${viewport.name}.png`,
        SCREENSHOT_OPTIONS
      );
    });
  }
});

test.describe('Visual Regression - Dark Theme Consistency', () => {
  const MAX_DARK_RGB_VALUE = 50;

  test('all pages use consistent dark theme colors', async ({
    page,
  }: {
    page: Page;
  }) => {
    for (const pagePath of TEST_PAGES) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // Check background color (should be dark)
      const bgColor = await page.evaluate((): string => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      // Should be a dark color (rgb values < 50)
      const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const [, rStr, gStr, bStr] = match;
        const r = Number(rStr);
        const g = Number(gStr);
        const b = Number(bStr);
        expect(r).toBeLessThan(MAX_DARK_RGB_VALUE);
        expect(g).toBeLessThan(MAX_DARK_RGB_VALUE);
        expect(b).toBeLessThan(MAX_DARK_RGB_VALUE);
      }
    }
  });
});
