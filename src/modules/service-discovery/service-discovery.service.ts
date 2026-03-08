import { AppError } from '../../shared/errors/app.error.js';
import type { DiscoverServicesQuery, DiscoverServicesResult, DiscoveredService } from '../../types/web-scraper.types.js';
import { buildTargetUrl, getQueryParam, parseTargetDomain } from '../../shared/scraper/scraper.utils.js';
import { discoverServicesViaBrowser } from './service-discovery.browser.js';
import { classifyDiscoveredService } from './service-discovery.fetcher.js';

class ServiceDiscoveryService {
  public async discoverServices(query: DiscoverServicesQuery): Promise<DiscoverServicesResult> {
    const targetWebsiteUrl = getQueryParam(query.targetWebsiteUrl);
    const queryString = getQueryParam(query.queryString);
    const targetPath = getQueryParam(query.targetPath);
    const targetDomain = getQueryParam(query.targetDomain);
    const authStatePath = getQueryParam(query.authStatePath);
    const waitMs = this.getWaitMs(query.waitMs);

    if (!targetWebsiteUrl) {
      throw new AppError('Query param "targetWebsiteUrl" is required.');
    }

    let requestUrl: URL;

    try {
      requestUrl = buildTargetUrl(targetWebsiteUrl, targetPath, queryString);

      if (targetDomain) {
        parseTargetDomain(targetDomain);
      }
    } catch {
      throw new AppError('Invalid "targetWebsiteUrl", "targetPath", "queryString", or "targetDomain" value.');
    }

    const discovery = await discoverServicesViaBrowser(requestUrl, authStatePath, waitMs, targetDomain);
    const services = await this.classifyServices(discovery.services);

    return {
      request: {
        targetWebsiteUrl,
        targetPath: targetPath ?? null,
        queryString: queryString ?? null,
        targetDomain: targetDomain ?? null,
        finalUrl: requestUrl.toString(),
        authStatePath: authStatePath ?? null,
      },
      page: discovery.page,
      services,
      counts: {
        total: services.length,
        public: services.filter((service) => service.classification === 'public').length,
        authRequired: services.filter((service) => service.classification === 'auth_required').length,
        unknown: services.filter((service) => service.classification === 'unknown').length,
      },
    };
  }

  private async classifyServices(
    services: Omit<DiscoveredService, 'classification' | 'classificationReason'>[],
  ): Promise<DiscoveredService[]> {
    const classifiedServices: DiscoveredService[] = [];

    for (const service of services) {
      classifiedServices.push({
        ...service,
        ...(await classifyDiscoveredService(service)),
      });
    }

    return classifiedServices;
  }

  private getWaitMs(value: unknown) {
    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);

      if (Number.isFinite(parsed) && parsed >= 0) {
        return Math.min(parsed, 10_000);
      }
    }

    return 1_500;
  }
}

const serviceDiscoveryService = new ServiceDiscoveryService();

export { serviceDiscoveryService };
