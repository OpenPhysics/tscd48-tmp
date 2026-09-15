import { expect, type Page } from '@playwright/test';

export const EXAMPLE_PAGES = [
  ['/examples/', /CD48 Examples/],
  ['/examples/simple-monitor.html', /Simple Monitor/],
  ['/examples/error-handling.html', /Error Handling Example/],
  ['/examples/demo-mode.html', /Demo Mode/],
  ['/examples/multi-channel-display.html', /Multi-Channel Display/],
  ['/examples/continuous-monitoring.html', /Continuous Monitoring/],
  ['/examples/coincidence-measurement.html', /Coincidence Measurement/],
  ['/examples/graphing.html', /Real-Time Graphing/],
  ['/examples/data-export.html', /Data Export/],
  ['/examples/statistical-analysis.html', /Statistical Analysis Tools/],
  ['/examples/calibration-wizard.html', /Calibration Wizard/],
  ['/examples/code-playground.html', /Live Code Playground/],
] as const;

export async function openPlayground(page: Page): Promise<void> {
  await page.goto('/examples/code-playground.html');
  await expect(page.locator('.CodeMirror')).toBeVisible();
}

export async function setEditorCode(page: Page, code: string): Promise<void> {
  await page.locator('.CodeMirror').evaluate((element, value) => {
    const editor = (
      element as HTMLElement & {
        CodeMirror: { setValue: (source: string) => void };
      }
    ).CodeMirror;
    editor.setValue(value);
  }, code);
}
