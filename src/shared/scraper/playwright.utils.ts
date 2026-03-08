import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import type { Page, Response as PlaywrightResponse } from 'playwright';
import { AppError } from '../errors/app.error.js';
import type { BrowserPageSummary } from '../../types/web-scraper.types.js';
import { extractTitle } from './scraper.utils.js';

async function withBrowserPage<T>(authStatePath: string | undefined, task: (page: Page) => Promise<T>) {
  if (authStatePath && !existsSync(authStatePath)) {
    throw new AppError(`Auth state file was not found at "${authStatePath}".`, 400);
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext(
      authStatePath
        ? {
            storageState: authStatePath,
          }
        : undefined,
    );
    const page = await context.newPage();

    return await task(page);
  } finally {
    await browser.close();
  }
}

async function buildBrowserPageSummary(
  page: Page,
  pageResponse: PlaywrightResponse | null,
  initialUrl: string,
): Promise<BrowserPageSummary> {
  const finalUrl = page.url();

  return {
    initialUrl,
    finalUrl,
    redirected: finalUrl !== initialUrl,
    redirectedToLogin: isLikelyLoginUrl(finalUrl),
    status: pageResponse?.status() ?? 200,
    ok: pageResponse?.ok() ?? true,
    contentType: pageResponse?.headers()['content-type'] ?? null,
    title: extractTitle(await page.content()),
  };
}

function isLikelyLoginUrl(url: string) {
  return /(login|sign-in|signin|auth)/i.test(url);
}

export { buildBrowserPageSummary, isLikelyLoginUrl, withBrowserPage };
