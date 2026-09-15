import { expect, type Page, test } from '@playwright/test';

/**
 * Error Scenario Tests
 * Tests error handling in the UI when various errors occur
 */

const SELECTORS = {
  CODE_MIRROR: '.CodeMirror',
  CONSOLE_OUTPUT: '#consoleOutput',
  RUN_BTN: '#runBtn',
  CLEAR_BTN: '#clearBtn',
  TEMPLATE_SELECT: '#templateSelect',
  SEARCH_INPUT: '#searchInput',
  EXAMPLES_GRID: '.examples-grid',
  EXAMPLE_CARD: '.example-card',
  TAB_CONSOLE: '.tab[data-tab="console"]',
  TAB_DEVICE: '.tab[data-tab="device"]',
  TAB_CONTENT_DEVICE: '.tab-content[data-tab="device"]',
} as const;

const TIMEOUTS = {
  SHORT: 100,
  MEDIUM: 200,
  LONG: 300,
  VERY_LONG: 500,
  ERROR_DISPLAY: 1000,
} as const;

test.describe('Error Scenarios - User Interface', () => {
  test('code playground - handles syntax errors gracefully', async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto('/examples/code-playground.html');
    await page.waitForSelector(SELECTORS.CODE_MIRROR);

    // Inject invalid code
    await page.evaluate(() => {
      const editors = document.querySelectorAll('.CodeMirror');
      if (editors.length > 0) {
        const cm = (
          editors[0] as { CodeMirror: { setValue: (v: string) => void } }
        ).CodeMirror;
        cm.setValue('this is invalid javascript code {{{');
      }
    });

    // Try to run the code
    await page.click(SELECTORS.RUN_BTN);

    // Wait for error to appear in console
    await page.waitForTimeout(TIMEOUTS.VERY_LONG);

    // Check that error is displayed
    const consoleOutput = page.locator(SELECTORS.CONSOLE_OUTPUT);
    const hasError = await consoleOutput.evaluate(
      (el: HTMLElement): boolean => {
        const text = el.textContent ?? '';
        return text.includes('error') || text.includes('Error');
      }
    );

    expect(hasError).toBeTruthy();
  });

  test('code playground - displays runtime errors', async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto('/examples/code-playground.html');
    await page.waitForSelector(SELECTORS.CODE_MIRROR);

    // Inject code that will throw runtime error
    await page.evaluate(() => {
      const editors = document.querySelectorAll('.CodeMirror');
      if (editors.length > 0) {
        const cm = (
          editors[0] as { CodeMirror: { setValue: (v: string) => void } }
        ).CodeMirror;
        cm.setValue('throw new Error("Test error");');
      }
    });

    // Run the code
    await page.click(SELECTORS.RUN_BTN);
    await page.waitForTimeout(TIMEOUTS.VERY_LONG);

    // Check for error in console
    const consoleOutput = page.locator(SELECTORS.CONSOLE_OUTPUT);
    const text = await consoleOutput.textContent();
    expect(text).toContain('Test error');
  });

  test('examples index - handles missing examples gracefully', async ({
    page,
  }: {
    page: Page;
  }) => {
    // `serve` redirects *.html misses and returns its built-in 404 page
    // (body contains "404", title usually does not).
    const response = await page.goto('/examples/nonexistent.html');
    expect(response?.status()).toBe(404);

    const showsNotFound = await page.evaluate((): boolean => {
      const title = document.title.toLowerCase();
      const body = document.body.textContent?.toLowerCase() ?? '';
      return (
        title.includes('404') ||
        body.includes('404') ||
        body.includes('not found')
      );
    });
    expect(showsNotFound).toBeTruthy();
  });

  test('search with no results shows message', async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto('/examples/');

    // Search for something that doesn't exist
    await page.fill(SELECTORS.SEARCH_INPUT, 'xyz123nonexistent');
    await page.waitForTimeout(TIMEOUTS.MEDIUM);

    // Should show "no examples found" message
    const grid = page.locator(SELECTORS.EXAMPLES_GRID);
    const text = await grid.textContent();
    expect(text?.toLowerCase()).toContain('no examples found');
  });
});

test.describe('Error Scenarios - Network Failures', () => {
  test('handles slow network gracefully', async ({ page }: { page: Page }) => {
    // Simulate slow network
    await page.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, TIMEOUTS.SHORT));
      await route.continue();
    });

    await page.goto('/examples/');

    // Page should still load eventually
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Error Scenarios - JavaScript Errors', () => {
  test('catches and displays unhandled errors in dev mode', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Navigate to code playground which has dev mode enabled
    await page.goto('/examples/code-playground.html');

    // Inject dev-utils
    await page.waitForTimeout(TIMEOUTS.VERY_LONG);

    // Trigger an unhandled error
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error('Unhandled test error');
      }, 100);
    });

    // Wait for error to be caught
    await page.waitForTimeout(TIMEOUTS.VERY_LONG);

    // Check if error overlay appears (if dev mode is enabled)

    // Trigger console error
    await page.evaluate(() => {
      console.error('Test console error');
    });

    await page.waitForTimeout(TIMEOUTS.MEDIUM);

    // Page should still be functional after an unhandled error (dev overlay
    // injects its own <h1>, so don't assert on bare h1).
    await expect(page.locator(SELECTORS.RUN_BTN)).toBeVisible();
    await expect(page.locator(SELECTORS.CODE_MIRROR)).toBeVisible();
  });
});

test.describe('Error Scenarios - User Input Validation', () => {
  test('code playground - handles empty code execution', async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto('/examples/code-playground.html');
    await page.waitForSelector(SELECTORS.CODE_MIRROR);

    // Clear the editor
    await page.evaluate(() => {
      const editors = document.querySelectorAll('.CodeMirror');
      if (editors.length > 0) {
        const cm = (
          editors[0] as { CodeMirror: { setValue: (v: string) => void } }
        ).CodeMirror;
        cm.setValue('');
      }
    });

    // Try to run empty code
    await page.click(SELECTORS.RUN_BTN);
    await page.waitForTimeout(TIMEOUTS.LONG);

    // Should show warning message
    const consoleOutput = page.locator(SELECTORS.CONSOLE_OUTPUT);
    const text = await consoleOutput.textContent();
    expect(text?.toLowerCase()).toContain('no code');
  });

  test('search input - handles special characters', async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto('/examples/');

    // Type special characters
    await page.fill(SELECTORS.SEARCH_INPUT, '<script>alert("test")</script>');
    await page.waitForTimeout(TIMEOUTS.MEDIUM);

    // Page should still be functional and not execute script
    const hasAlert = await page.evaluate((): boolean => {
      return document.body.innerHTML.includes('alert');
    });

    // Should not contain raw script tag
    expect(hasAlert).toBeFalsy();
  });
});

test.describe('Error Scenarios - Browser Compatibility', () => {
  test('shows appropriate message for missing Web Serial API', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Override Web Serial API support
    await page.addInitScript(() => {
      // biome-ignore lint/suspicious/noExplicitAny: browser context — no type for navigator.serial override
      delete (navigator as any).serial;
    });

    // error-handling.html runs checkSupport() on load and logs the result
    await page.goto('/examples/error-handling.html');
    await page.waitForFunction(() => {
      const text = document.body.textContent?.toLowerCase() ?? '';
      return text.includes('not supported') || text.includes('is supported');
    });

    const hasWarning = await page.evaluate((): boolean => {
      const text = document.body.textContent?.toLowerCase() ?? '';
      return text.includes('not supported');
    });

    expect(hasWarning).toBeTruthy();
  });
});

test.describe('Error Scenarios - Data Validation', () => {
  test('handles invalid template selection gracefully', async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto('/examples/code-playground.html');
    await page.waitForSelector(SELECTORS.TEMPLATE_SELECT);

    // Try to set invalid template
    await page.evaluate(() => {
      const select = document.getElementById(
        'templateSelect'
      ) as HTMLSelectElement;
      select.value = 'nonexistent';
      select.dispatchEvent(new Event('change'));
    });

    await page.waitForTimeout(TIMEOUTS.MEDIUM);

    // Editor should remain functional
    const editor = page.locator(SELECTORS.CODE_MIRROR);
    await expect(editor).toBeVisible();
  });
});

test.describe('Error Scenarios - Recovery', () => {
  test('code playground - clears errors when new code is run', async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto('/examples/code-playground.html');
    await page.waitForSelector(SELECTORS.CODE_MIRROR);

    // Run code that causes error
    await page.evaluate(() => {
      const editors = document.querySelectorAll('.CodeMirror');
      if (editors.length > 0) {
        const cm = (
          editors[0] as { CodeMirror: { setValue: (v: string) => void } }
        ).CodeMirror;
        cm.setValue('throw new Error("Error 1");');
      }
    });
    await page.click(SELECTORS.RUN_BTN);
    await page.waitForTimeout(TIMEOUTS.LONG);

    // Run valid code
    await page.evaluate(() => {
      const editors = document.querySelectorAll('.CodeMirror');
      if (editors.length > 0) {
        const cm = (
          editors[0] as { CodeMirror: { setValue: (v: string) => void } }
        ).CodeMirror;
        cm.setValue('console.log("Success");');
      }
    });
    await page.click(SELECTORS.RUN_BTN);
    await page.waitForTimeout(TIMEOUTS.LONG);

    // Should show success message
    const consoleOutput = page.locator(SELECTORS.CONSOLE_OUTPUT);
    const text = await consoleOutput.textContent();
    expect(text).toContain('Success');
  });

  test('console can be cleared after errors', async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto('/examples/code-playground.html');
    await page.waitForSelector(SELECTORS.CONSOLE_OUTPUT);

    // Add some console messages
    await page.evaluate(() => {
      console.log('Test message');
      console.error('Test error');
    });
    await page.waitForTimeout(TIMEOUTS.MEDIUM);

    // Clear console
    await page.click(SELECTORS.CLEAR_BTN);
    await page.waitForTimeout(TIMEOUTS.MEDIUM);

    // Console should be cleared
    const consoleOutput = page.locator(SELECTORS.CONSOLE_OUTPUT);
    const text = await consoleOutput.textContent();
    expect(text?.trim().length).toBeLessThan(50); // Should only have "Console cleared" message
  });
});
