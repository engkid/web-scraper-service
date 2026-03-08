import type { DiscoveredService } from '../../types/web-scraper.types.js';
import { buildBrowserPageSummary, withBrowserPage } from '../../shared/scraper/playwright.utils.js';
import { matchesTargetDomain } from '../../shared/scraper/scraper.utils.js';

async function discoverServicesViaBrowser(
  targetWebsiteUrl: URL,
  authStatePath: string | undefined,
  waitMs: number,
  targetDomain?: string,
): Promise<{ page: Awaited<ReturnType<typeof buildBrowserPageSummary>>; services: Omit<DiscoveredService, 'classification' | 'classificationReason'>[] }> {
  return withBrowserPage(authStatePath, async (page) => {
    const services = new Map<string, Omit<DiscoveredService, 'classification' | 'classificationReason'>>();

    page.on('response', (response) => {
      const request = response.request();
      const resourceType = request.resourceType();

      if (!['fetch', 'xhr'].includes(resourceType)) {
        return;
      }

      if (targetDomain && !matchesTargetDomain(response.url(), targetDomain)) {
        return;
      }

      const key = `${request.method()} ${response.url()}`;
      const existing = services.get(key);

      services.set(key, {
        url: response.url(),
        method: request.method(),
        status: response.status(),
        resourceType,
        contentType: response.headers()['content-type'] ?? null,
        hits: (existing?.hits ?? 0) + 1,
      });
    });

    const pageResponse = await page.goto(targetWebsiteUrl.toString(), {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => null);
    await page.waitForTimeout(waitMs);

    return {
      page: await buildBrowserPageSummary(page, pageResponse, targetWebsiteUrl.toString()),
      services: [...services.values()].sort((left, right) => left.url.localeCompare(right.url)),
    };
  });
}

export { discoverServicesViaBrowser };
