import { AppError } from '../../shared/errors/app.error.js';
import type { ScrapeMode, ScrapeWebsiteQuery, ScrapeWebsiteResult } from '../../types/web-scraper.types.js';
import { buildTargetUrl, getQueryParam } from '../../shared/scraper/scraper.utils.js';
import { scrapeServiceViaBrowser } from './web-scraper.browser.js';
import { fetchServiceDirect, shouldFallbackToBrowser } from './web-scraper.fetcher.js';

class WebScraperService {
  public async scrapeWebsite(query: ScrapeWebsiteQuery): Promise<ScrapeWebsiteResult> {
    const targetWebsiteUrl = getQueryParam(query.targetWebsiteUrl);
    const targetServiceUrl = getQueryParam(query.targetServiceUrl);
    const queryString = getQueryParam(query.queryString);
    const targetPath = getQueryParam(query.targetPath);
    const authStatePath = getQueryParam(query.authStatePath);
    const mode = this.getScrapeMode(query.mode);

    if (!targetWebsiteUrl) {
      throw new AppError('Query param "targetWebsiteUrl" is required.');
    }

    if (!targetServiceUrl) {
      throw new AppError('Query param "targetServiceUrl" is required.');
    }

    let requestUrl: URL;

    try {
      requestUrl = buildTargetUrl(targetWebsiteUrl, targetPath, queryString);
      new URL(targetServiceUrl);
    } catch {
      throw new AppError('Invalid "targetWebsiteUrl", "targetServiceUrl", "targetPath", or "queryString" value.');
    }

    if (mode === 'direct') {
      const service = await fetchServiceDirect(targetServiceUrl);

      return {
        request: {
          targetWebsiteUrl,
          targetServiceUrl,
          targetPath: targetPath ?? null,
          queryString: queryString ?? null,
          finalUrl: requestUrl.toString(),
          mode,
          executionMode: 'direct',
          authStatePath: authStatePath ?? null,
        },
        page: null,
        service,
      };
    }

    if (mode === 'browser') {
      const browserResult = await scrapeServiceViaBrowser(requestUrl, targetServiceUrl, authStatePath);

      return {
        request: {
          targetWebsiteUrl,
          targetServiceUrl,
          targetPath: targetPath ?? null,
          queryString: queryString ?? null,
          finalUrl: requestUrl.toString(),
          mode,
          executionMode: 'browser',
          authStatePath: authStatePath ?? null,
        },
        page: browserResult.page,
        service: browserResult.service,
      };
    }

    try {
      const service = await fetchServiceDirect(targetServiceUrl);

      return {
        request: {
          targetWebsiteUrl,
          targetServiceUrl,
          targetPath: targetPath ?? null,
          queryString: queryString ?? null,
          finalUrl: requestUrl.toString(),
          mode,
          executionMode: 'direct',
          authStatePath: authStatePath ?? null,
        },
        page: null,
        service,
      };
    } catch (error) {
      if (!shouldFallbackToBrowser(error)) {
        throw error;
      }

      const browserResult = await scrapeServiceViaBrowser(requestUrl, targetServiceUrl, authStatePath);

      return {
        request: {
          targetWebsiteUrl,
          targetServiceUrl,
          targetPath: targetPath ?? null,
          queryString: queryString ?? null,
          finalUrl: requestUrl.toString(),
          mode,
          executionMode: 'browser',
          authStatePath: authStatePath ?? null,
        },
        page: browserResult.page,
        service: browserResult.service,
      };
    }
  }

  private getScrapeMode(value: unknown): ScrapeMode {
    if (value === 'direct' || value === 'browser' || value === 'auto') {
      return value;
    }

    return 'auto';
  }
}

const webScraperService = new WebScraperService();

export { webScraperService };
