type ScrapeMode = 'auto' | 'direct' | 'browser';
type ScrapeExecutionMode = 'direct' | 'browser';
type ServiceAccessClassification = 'public' | 'auth_required' | 'unknown';

type ScrapeWebsiteQuery = {
  targetWebsiteUrl?: unknown;
  targetServiceUrl?: unknown;
  queryString?: unknown;
  targetPath?: unknown;
  mode?: unknown;
  authStatePath?: unknown;
};

type DiscoverServicesQuery = {
  targetWebsiteUrl?: unknown;
  queryString?: unknown;
  targetPath?: unknown;
  targetDomain?: unknown;
  authStatePath?: unknown;
  waitMs?: unknown;
};

type ServicePayload = Record<string, unknown>;

type ServiceCategorySummary = {
  id: number | null;
  name: string | null;
};

type ServiceItemSummary = {
  id: number | null;
  name: string | null;
  sku: string | null;
  urlKey: string | null;
  price: number | null;
  specialPrice: number | null;
  stockStatus: number | null;
  quantityStatus: boolean | null;
  thumbnail: string | null;
  rating: number | null;
  totalReview: number | null;
  customBadge: string | null;
};

type ServiceResultSummary = {
  status: number | null;
  appName: string | null;
  appVersion: string | null;
  trace: string | null;
  category: ServiceCategorySummary;
  totalCount: number | null;
  items: ServiceItemSummary[];
};

type PageSummary = {
  status: number;
  ok: boolean;
  contentType: string | null;
  title: string | null;
};

type BrowserPageSummary = PageSummary & {
  initialUrl: string;
  finalUrl: string;
  redirected: boolean;
  redirectedToLogin: boolean;
};

type MatchedServiceResult = {
  matchedUrl: string;
  status: number;
  ok: boolean;
  result: ServiceResultSummary;
};

type DiscoveredService = {
  url: string;
  method: string;
  status: number;
  resourceType: string;
  contentType: string | null;
  hits: number;
  classification: ServiceAccessClassification;
  classificationReason: string;
};

type DiscoverServicesResult = {
  request: {
    targetWebsiteUrl: string;
    targetPath: string | null;
    queryString: string | null;
    targetDomain: string | null;
    finalUrl: string;
    authStatePath: string | null;
  };
  page: BrowserPageSummary;
  services: DiscoveredService[];
  counts: {
    total: number;
    public: number;
    authRequired: number;
    unknown: number;
  };
};

type ScrapeWebsiteResult = {
  request: {
    targetWebsiteUrl: string;
    targetServiceUrl: string;
    targetPath: string | null;
    queryString: string | null;
    finalUrl: string;
    mode: ScrapeMode;
    executionMode: ScrapeExecutionMode;
    authStatePath: string | null;
  };
  page: BrowserPageSummary | null;
  service: MatchedServiceResult;
};

export type {
  BrowserPageSummary,
  DiscoverServicesQuery,
  DiscoverServicesResult,
  DiscoveredService,
  MatchedServiceResult,
  PageSummary,
  ScrapeExecutionMode,
  ScrapeMode,
  ScrapeWebsiteQuery,
  ScrapeWebsiteResult,
  ServiceAccessClassification,
  ServiceCategorySummary,
  ServiceItemSummary,
  ServicePayload,
  ServiceResultSummary,
};
