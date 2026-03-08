import { AppError } from '../../shared/errors/app.error.js';
import type {
  MatchedServiceResult,
  ServiceItemSummary,
  ServicePayload,
  ServiceResultSummary,
} from '../../types/web-scraper.types.js';
import { getArray, getBoolean, getNumber, getRecord, getString } from '../../shared/scraper/scraper.utils.js';

function mapServiceItemSummary(item: unknown): ServiceItemSummary {
  const record = getRecord(item);

  return {
    id: getNumber(record?.id),
    name: getString(record?.name),
    sku: getString(record?.sku),
    urlKey: getString(record?.url_key),
    price: getNumber(record?.price),
    specialPrice: getNumber(record?.special_price),
    stockStatus: getNumber(record?.stock_status),
    quantityStatus: getBoolean(record?.quantity_status),
    thumbnail: getString(record?.thumbnail),
    rating: getNumber(record?.rating_double) ?? getNumber(record?.rating),
    totalReview: getNumber(record?.total_review),
    customBadge: getString(record?.custom_badge),
  };
}

function mapServicePayload(payload: ServicePayload): ServiceResultSummary {
  const data = getRecord(payload.data);
  const category = getRecord(data?.category);
  const items = getArray(data?.items);

  return {
    status: getNumber(payload.status),
    appName: getString(payload.app_name),
    appVersion: getString(payload.app_version),
    trace: getString(payload.trace),
    category: {
      id: getNumber(category?.id),
      name: getString(category?.name),
    },
    totalCount: getNumber(data?.total_count),
    items: items.map((item) => mapServiceItemSummary(item)),
  };
}

async function extractJsonBody(responseTextPromise: Promise<string>) {
  try {
    return JSON.parse(await responseTextPromise) as ServicePayload;
  } catch {
    throw new AppError('The intercepted service response was not valid JSON.', 502);
  }
}

async function mapMatchedServiceResult(matchedUrl: string, status: number, ok: boolean, responseTextPromise: Promise<string>): Promise<MatchedServiceResult> {
  const payload = await extractJsonBody(responseTextPromise);

  return {
    matchedUrl,
    status,
    ok,
    result: mapServicePayload(payload),
  };
}

export { mapMatchedServiceResult };
