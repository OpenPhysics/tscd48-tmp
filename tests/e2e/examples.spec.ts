import { expect, test } from '@playwright/test';

interface ExamplePage {
  readonly name: string;
  readonly path: string;
  readonly title: string;
}

interface Viewport {
  readonly width: number;
  readonly height: number;
  readonly name: 'mobile' | 'tablet' | 'desktop';
}

const EXAMPLES: readonly ExamplePage[] = [
  {
    name: 'Examples Index',
    path: '/examples/',
    title: 'CD48 Examples - Interactive Demos',
  },
  {
    name: 'Simple Monitor',
    path: '/examples/simple-monitor.html',
    title: 'CD48 Simple Monitor',
  },
  {
    name: 'Error Handling',
    path: '/examples/error-handling.html',
    title: 'CD48 Error Handling Example',
  },
  {
    name: 'Demo Mode',
    path: '/examples/demo-mode.html',
    title: 'CD48 Demo Mode - No Hardware Required',
  },
  {
    name: 'Multi-Channel Display',
    path: '/examples/multi-channel-display.html',
    title: 'CD48 Multi-Channel Display',
  },
  {
    name: 'Continuous Monitoring',
    path: '/examples/continuous-monitoring.html',
    title: 'CD48 Continuous Monitoring',
  },
  {
    name: 'Coincidence Measurement',
    path: '/examples/coincidence-measurement.html',
    title: 'CD48 Coincidence Measurement',
  },
  {
    name: 'Graphing',
    path: '/examples/graphing.html',
    title: 'CD48 Real-Time Graphing',
  },
  {
    name: 'Data Export',
    path: '/examples/data-export.html',
    title: 'CD48 Data Export Example',
  },
  {
    name: 'Statistical Analysis',
    path: '/examples/statistical-analysis.html',
    title: 'CD48 - Statistical Analysis Tools',
  },
  {
    name: 'Calibration Wizard',
    path: '/examples/calibration-wizard.html',
    title: 'CD48 - Calibration Wizard',
  },
  {
    name: 'Code Playground',
    path: '/examples/code-playground.html',
    title: 'CD48 - Live Code Playground',
  },
] as const;

const EXPECTED_ERRORS = [
  'not connected',
  'not supported',
  'user cancelled',
] as const;

const SELECTORS = {
  EXAMPLE_CARD: '.example-card',
  SEARCH_INPUT: '#searchInput',
  EXAMPLES_GRID: '.examples-grid',
  CODE_MIRROR: '.CodeMirror',
  CODE_MIRROR_CODE: '.CodeMirror-code',
  TEMPLATE_SELECT: '#templateSelect',
  CONSOLE_OUTPUT: '#consoleOutput',
  CONSOLE_TAB: '.tab[data-tab="console"]',
  DEVICE_TAB: '.tab[data-tab="device"]',
  DEVICE_CONTENT: '.tab-content[data-tab="device"]',
  CATEGORY_ADVANCED: '[data-category="advanced"]',
} as const;

test.describe('Example Pages - Loading and Basic UI', () => {
  for (const example of EXAMPLES) {
    test(`${example.name} - loads without errors`, async ({ page }) => {
      // Listen for console errors
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Listen for page errors
      const pageErrors: string[] = [];
      page.on('pageerror', (error: Error) => {
        pageErrors.push(error.message);
      });

      // Navigate to page
      await page.goto(example.path);

      // Check title
      await expect(page).toHaveTitle(new RegExp(example.title));

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');

      // Check for critical errors (allow expected errors like "not connected")
      const criticalErrors = pageErrors.filter(
        (error: string): boolean =>
          !EXPECTED_ERRORS.some((expected) => error.includes(expected))
      );

      expect(criticalErrors).toHaveLength(0);
    });
  }
});

test.describe('Examples Index - Functionality', () => {
  test('displays all examples', async ({ page }) => {
    await page.goto('/examples/');

    // Check that example cards are displayed
    const cards = page.locator(SELECTORS.EXAMPLE_CARD);
    const count = await cards.count();
    expect(count).toBe(11);
  });

  test('search functionality works', async ({ page }) => {
    await page.goto('/examples/');

    // Type in search box
    await page.fill(SELECTORS.SEARCH_INPUT, 'calibration');

    // Wait for filtering
    await page.waitForTimeout(100);

    // Check filtered results
    const visibleCards = page.locator(`${SELECTORS.EXAMPLE_CARD}:visible`);
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(11);
  });

  test('category filtering works', async ({ page }) => {
    await page.goto('/examples/');

    // Click on "Advanced" category
    await page.click(SELECTORS.CATEGORY_ADVANCED);

    // Wait for filtering
    await page.waitForTimeout(100);

    // Should show only advanced examples
    const cards = page.locator(SELECTORS.EXAMPLE_CARD);
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(11);
  });

  test('example cards are clickable', async ({ page }) => {
    await page.goto('/examples/');

    // Click first example card
    const firstCard = page.locator(SELECTORS.EXAMPLE_CARD).first();
    await firstCard.click();

    // Should navigate to example page
    await expect(page).not.toHaveURL('/examples/');
  });
});

test.describe('Code Playground - Functionality', () => {
  test('editor loads and displays code', async ({ page }) => {
    await page.goto('/examples/code-playground.html');

    // Wait for CodeMirror to load
    await page.waitForSelector(SELECTORS.CODE_MIRROR);

    // Check that editor is present
    const editor = page.locator(SELECTORS.CODE_MIRROR);
    await expect(editor).toBeVisible();
  });

  test('template selection works', async ({ page }) => {
    await page.goto('/examples/code-playground.html');

    await page.waitForSelector(SELECTORS.TEMPLATE_SELECT);

    // Select a template
    await page.selectOption(SELECTORS.TEMPLATE_SELECT, 'basic');

    // Wait a bit for the code to load
    await page.waitForTimeout(100);

    // Check that code is loaded (CodeMirror makes this tricky)
    const editorContent = await page.locator(SELECTORS.CODE_MIRROR_CODE);
    await expect(editorContent).toBeVisible();
  });

  test('console tab works', async ({ page }) => {
    await page.goto('/examples/code-playground.html');

    // Console tab should be active by default
    const consoleTab = page.locator(SELECTORS.CONSOLE_TAB);
    await expect(consoleTab).toHaveClass(/active/);

    // Console output should be visible
    const consoleOutput = page.locator(SELECTORS.CONSOLE_OUTPUT);
    await expect(consoleOutput).toBeVisible();
  });

  test('tab switching works', async ({ page }) => {
    await page.goto('/examples/code-playground.html');

    // Click device tab
    await page.click(SELECTORS.DEVICE_TAB);

    // Device tab should be active
    const deviceTab = page.locator(SELECTORS.DEVICE_TAB);
    await expect(deviceTab).toHaveClass(/active/);

    // Device content should be visible
    const deviceContent = page.locator(SELECTORS.DEVICE_CONTENT);
    await expect(deviceContent).toBeVisible();
  });
});

test.describe('Demo Mode - Functionality', () => {
  test('demo mode starts automatically', async ({ page }) => {
    await page.goto('/examples/demo-mode.html');

    // Wait for demo mode to start
    await page.waitForTimeout(1000);

    // Check for success message in console or UI
    // This depends on the actual implementation
    const hasStarted = await page.locator('body').evaluate((): boolean => {
      const textContent = document.body.textContent;
      return (
        ((textContent?.includes('Demo') ?? false) ||
          textContent?.includes('Simulated')) ??
        false
      );
    });

    expect(hasStarted).toBeTruthy();
  });
});

test.describe('Visual Elements - Responsiveness', () => {
  const VIEWPORTS: readonly Viewport[] = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1920, height: 1080, name: 'desktop' },
  ] as const;

  for (const viewport of VIEWPORTS) {
    test(`Examples index is responsive on ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto('/examples/');

      // Check that the page is visible
      const grid = page.locator(SELECTORS.EXAMPLES_GRID);
      await expect(grid).toBeVisible();

      // Check that search box is visible
      const searchBox = page.locator(SELECTORS.SEARCH_INPUT);
      await expect(searchBox).toBeVisible();
    });
  }
});

test.describe('Accessibility', () => {
  test('examples index has proper heading structure', async ({ page }) => {
    await page.goto('/examples/');

    // Check for main heading
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Examples');
  });

  test('code playground has accessible labels', async ({ page }) => {
    await page.goto('/examples/code-playground.html');
    await page.waitForSelector(SELECTORS.CODE_MIRROR);

    // Template selector is wrapped in a <label>
    const labels = page.locator('label');
    const count = await labels.count();
    expect(count).toBeGreaterThan(0);
  });
});
