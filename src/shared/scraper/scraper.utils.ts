function getQueryParam(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function buildTargetUrl(targetWebsiteUrl: string, targetPath?: string, queryString?: string) {
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

function extractTitle(html: string) {
  const matchedTitle = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return matchedTitle?.[1]?.trim() ?? null;
}

function matchesTargetServiceUrl(responseUrl: string, targetServiceUrl: string) {
  const actualUrl = new URL(responseUrl);
  const expectedUrl = new URL(targetServiceUrl);

  if (actualUrl.origin !== expectedUrl.origin || actualUrl.pathname !== expectedUrl.pathname) {
    return false;
  }

  const expectedParamKeys = [...new Set(expectedUrl.searchParams.keys())];

  return expectedParamKeys.every((key) => {
    if (key === 'user_id') {
      return true;
    }

    const expectedValues = expectedUrl.searchParams.getAll(key).sort();
    const actualValues = actualUrl.searchParams.getAll(key).sort();

    if (expectedValues.length !== actualValues.length) {
      return false;
    }

    return expectedValues.every((value, index) => value === actualValues[index]);
  });
}

function matchesTargetDomain(responseUrl: string, targetDomain: string) {
  const actualUrl = new URL(responseUrl);
  const expectedUrl = parseTargetDomain(targetDomain);

  if (actualUrl.origin !== expectedUrl.origin) {
    return false;
  }

  return actualUrl.pathname.startsWith(expectedUrl.pathnamePrefix);
}

function parseTargetDomain(targetDomain: string) {
  const trimmedTargetDomain = targetDomain.trim();
  const withProtocol = /^[a-z]+:\/\//i.test(trimmedTargetDomain)
    ? trimmedTargetDomain
    : `https://${trimmedTargetDomain}`;
  const normalizedTargetDomain = withProtocol.replace(/\*+$/, '');
  const expectedUrl = new URL(normalizedTargetDomain);

  return {
    origin: expectedUrl.origin,
    pathnamePrefix: expectedUrl.pathname || '/',
  };
}

function getRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function getArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function getString(value: unknown) {
  return typeof value === 'string' && value !== '' ? value : null;
}

function getNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function getBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null;
}

export {
  buildTargetUrl,
  extractTitle,
  getArray,
  getBoolean,
  getNumber,
  getQueryParam,
  getRecord,
  getString,
  matchesTargetDomain,
  matchesTargetServiceUrl,
  parseTargetDomain,
};
