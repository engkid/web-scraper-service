type ScrapeWebsiteQuery = {
  targetWebsiteUrl?: unknown;
  queryString?: unknown;
  targetPath?: unknown;
};

type ScrapeWebsiteResult = {
  request: {
    targetWebsiteUrl: string;
    targetPath: string | null;
    queryString: string | null;
    finalUrl: string;
  };
  response: {
    status: number;
    ok: boolean;
    contentType: string | null;
  };
  scraped: {
    title: string | null;
    contentPreview: string;
  };
};

class ScrapeWebsiteError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ScrapeWebsiteError';
    this.statusCode = statusCode;
  }
}

class WebScraperService {
  public async scrapeWebsite(query: ScrapeWebsiteQuery): Promise<ScrapeWebsiteResult> {
    const targetWebsiteUrl = this.getQueryParam(query.targetWebsiteUrl);
    const queryString = this.getQueryParam(query.queryString);
    const targetPath = this.getQueryParam(query.targetPath);

    if (!targetWebsiteUrl) {
      throw new ScrapeWebsiteError('Query param "targetWebsiteUrl" is required.');
    }

    let requestUrl: URL;

    try {
      requestUrl = this.buildTargetUrl(targetWebsiteUrl, targetPath, queryString);
    } catch {
      throw new ScrapeWebsiteError('Invalid "targetWebsiteUrl", "targetPath", or "queryString" value.');
    }

    const response = await fetch(requestUrl);
    const html = await response.text();

    return {
      request: {
        targetWebsiteUrl,
        targetPath: targetPath ?? null,
        queryString: queryString ?? null,
        finalUrl: requestUrl.toString(),
      },
      response: {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
      },
      scraped: {
        title: this.extractTitle(html),
        contentPreview: html.slice(0, 500),
      },
    };
  }

  private getQueryParam(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private buildTargetUrl(targetWebsiteUrl: string, targetPath?: string, queryString?: string) {
    const url = new URL(targetPath ?? '', targetWebsiteUrl);

    if (queryString) {
      const normalizedQuery = queryString.startsWith('?') ? queryString.slice(1) : queryString;
      const params = new URLSearchParams(normalizedQuery);

      params.forEach((value, key) => {
        url.searchParams.set(key, value);
      });
    }

    return url;
  }

  private extractTitle(html: string) {
    const matchedTitle = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return matchedTitle?.[1]?.trim() ?? null;
  }
}

const webScraperService = new WebScraperService();

export { ScrapeWebsiteError, webScraperService };
