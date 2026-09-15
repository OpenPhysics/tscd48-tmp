import { expect, test } from '@playwright/test';
import { EXAMPLE_PAGES } from './helpers.js';

test('pages contain valid, descriptive links', async ({ page, request }) => {
  const destinations = new Set<string>();

  for (const path of ['/', ...EXAMPLE_PAGES.map(([example]) => example)]) {
    await test.step(path, async () => {
      await page.goto(path);
      const links = await page.locator('a').evaluateAll((anchors) =>
        anchors.map((anchor) => ({
          href: (anchor as HTMLAnchorElement).href,
          label:
            anchor.textContent?.trim() ||
            anchor.getAttribute('aria-label') ||
            anchor.getAttribute('title'),
          rel: anchor.getAttribute('rel') ?? '',
          target: anchor.getAttribute('target'),
        }))
      );

      for (const link of links) {
        expect(link.label, `Link without a label on ${path}`).toBeTruthy();
        if (link.target === '_blank') {
          expect(link.rel, `Unsafe external link: ${link.href}`).toContain(
            'noopener'
          );
        }
        if (link.href.startsWith(page.url().split('/').slice(0, 3).join('/'))) {
          destinations.add(link.href.split('#')[0]);
        }
      }
    });
  }

  for (const destination of destinations) {
    const response = await request.get(destination);
    expect(response.status(), `Broken link: ${destination}`).toBeLessThan(400);
  }
});
