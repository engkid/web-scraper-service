import type { Response as PlaywrightResponse } from 'playwright';
import { AppError } from '../../shared/errors/app.error.js';
import type { BrowserPageSummary, MatchedServiceResult } from '../../types/web-scraper.types.js';
import { buildBrowserPageSummary, withBrowserPage } from '../../shared/scraper/playwright.utils.js';
import { matchesTargetServiceUrl } from '../../shared/scraper/scraper.utils.js';
import { mapMatchedServiceResult } from './web-scraper.mapper.js';

async function scrapeServiceViaBrowser(
  targetWebsiteUrl: URL,
  targetServiceUrl: string,
  authStatePath?: string,
): Promise<{ page: BrowserPageSummary; service: MatchedServiceResult }> {
  return withBrowserPage(authStatePath, async (page) => {
    const matchingResponsePromise = page
      .waitForResponse((response) => matchesTargetServiceUrl(response.url(), targetServiceUrl), {
        timeout: 15_000,
      })
      .catch(() => null);

    const pageResponse = await page.goto(targetWebsiteUrl.toString(), {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => null);

    const matchingResponse = await matchingResponsePromise;
    const pageSummary = await buildBrowserPageSummary(page, pageResponse, targetWebsiteUrl.toString());

    if (!matchingResponse) {
      const authHint = authStatePath
        ? ' No matching service call was captured with the provided auth state.'
        : ' The page may require an authenticated browser session to trigger this request.';

      throw new AppError(`No API response matched "${targetServiceUrl}" after loading the page.${authHint}`, 404);
    }

    return {
      page: pageSummary,
      service: await extractMatchedServiceResult(matchingResponse),
    };
  });
}

async function extractMatchedServiceResult(response: PlaywrightResponse) {
  return mapMatchedServiceResult(response.url(), response.status(), response.ok(), response.text());
}

export { scrapeServiceViaBrowser };
