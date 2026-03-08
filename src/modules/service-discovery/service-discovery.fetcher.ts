import type { DiscoveredService } from '../../types/web-scraper.types.js';
import { isLikelyLoginUrl } from '../../shared/scraper/playwright.utils.js';

async function classifyDiscoveredService(
  service: Omit<DiscoveredService, 'classification' | 'classificationReason'>,
): Promise<Pick<DiscoveredService, 'classification' | 'classificationReason'>> {
  if (service.method !== 'GET') {
    return {
      classification: 'unknown',
      classificationReason: 'Only GET services are replayed for auth detection.',
    };
  }

  try {
    const response = await fetch(service.url, {
      headers: {
        accept: 'application/json, text/plain, */*',
      },
    });

    if (response.status === 401 || response.status === 403) {
      return {
        classification: 'auth_required',
        classificationReason: `Direct replay returned ${response.status}.`,
      };
    }

    if (response.redirected && isLikelyLoginUrl(response.url)) {
      return {
        classification: 'auth_required',
        classificationReason: 'Direct replay redirected to a login page.',
      };
    }

    if (response.ok) {
      return {
        classification: 'public',
        classificationReason: `Direct replay returned ${response.status}.`,
      };
    }

    return {
      classification: 'unknown',
      classificationReason: `Direct replay returned ${response.status}.`,
    };
  } catch (error) {
    return {
      classification: 'unknown',
      classificationReason: error instanceof Error ? error.message : 'Direct replay failed.',
    };
  }
}

export { classifyDiscoveredService };
