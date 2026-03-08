import { AppError } from '../../shared/errors/app.error.js';
import type { MatchedServiceResult } from '../../types/web-scraper.types.js';
import { mapMatchedServiceResult } from './web-scraper.mapper.js';

async function fetchServiceDirect(targetServiceUrl: string): Promise<MatchedServiceResult> {
  const response = await fetch(targetServiceUrl, {
    headers: {
      accept: 'application/json, text/plain, */*',
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new AppError(`Direct request to "${targetServiceUrl}" requires authentication.`, response.status);
  }

  if (!response.ok) {
    throw new AppError(`Direct request to "${targetServiceUrl}" failed with status ${response.status}.`, response.status);
  }

  return mapMatchedServiceResult(response.url, response.status, response.ok, response.text());
}

function shouldFallbackToBrowser(error: unknown) {
  return error instanceof AppError && [401, 403, 502].includes(error.statusCode);
}

export { fetchServiceDirect, shouldFallbackToBrowser };
