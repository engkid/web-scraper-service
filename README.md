# Web Scrapper Service

Express + TypeScript service for:

- discovering network services called by a page with Playwright
- scraping a target service directly or through a browser session

## Requirements

- Node.js 20+
- npm

## Run Locally

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build and run production output:

```bash
npm run build
npm start
```

Default server URL:

```text
http://localhost:3000
```

## Endpoints

### `GET /health`

Simple health check.

Example:

```bash
curl "http://localhost:3000/health"
```

### `GET /discover-services`

Opens a page with Playwright, captures `fetch` and `xhr` requests, and returns the discovered service URLs with an auth classification.

Query params:

- `targetWebsiteUrl` required. Page URL to open.
- `targetPath` optional. Relative path appended to `targetWebsiteUrl`.
- `queryString` optional. Query string merged into the final page URL.
- `targetDomain` optional. Filter discovered services by domain or path prefix.
- `authStatePath` optional. Path to a Playwright `storageState` JSON file.
- `waitMs` optional. Extra wait time after page load. Max `10000`.

`targetDomain` examples:

- `jeanne.eraspace.com/*`
- `https://jeanne.eraspace.com/*`
- `https://jeanne.eraspace.com/products/api/v4.1/*`

Example:

```bash
curl "http://localhost:3000/discover-services?targetWebsiteUrl=https://erafone.com/katalog/personalisasi/deals-erafone-7581&targetDomain=jeanne.eraspace.com/*"
```

Response shape:

```json
{
  "success": true,
  "message": "Service discovery completed successfully.",
  "data": {
    "request": {
      "targetWebsiteUrl": "https://erafone.com/katalog/personalisasi/deals-erafone-7581",
      "targetDomain": "jeanne.eraspace.com/*"
    },
    "page": {
      "initialUrl": "...",
      "finalUrl": "...",
      "redirected": false,
      "redirectedToLogin": false
    },
    "services": [
      {
        "url": "https://jeanne.eraspace.com/products/api/v4.1/homepage_campaign/deals-erafone?category_id=7581&user_id=&store_code=erafone",
        "method": "GET",
        "status": 200,
        "resourceType": "fetch",
        "contentType": "application/json",
        "hits": 1,
        "classification": "public",
        "classificationReason": "Direct replay returned 200."
      }
    ],
    "counts": {
      "total": 1,
      "public": 1,
      "authRequired": 0,
      "unknown": 0
    }
  }
}
```

Classification meanings:

- `public`: direct replay worked without auth
- `auth_required`: direct replay returned `401`, `403`, or redirected to login
- `unknown`: not safely classifiable, usually because it is not a `GET` request or replay failed

### `GET /scrape`

Fetches one target service and returns a reduced JSON summary.

Query params:

- `targetWebsiteUrl` required. Page URL associated with the service.
- `targetServiceUrl` required. Full service URL to fetch or intercept.
- `targetPath` optional. Relative path appended to `targetWebsiteUrl`.
- `queryString` optional. Query string merged into the final page URL.
- `mode` optional. One of `auto`, `direct`, `browser`. Default `auto`.
- `authStatePath` optional. Path to a Playwright `storageState` JSON file.

Execution modes:

- `direct`: request `targetServiceUrl` immediately with `fetch`
- `browser`: open the page with Playwright and wait for the service call
- `auto`: try direct first, then fall back to browser when auth-like failure happens

Example:

```bash
curl "http://localhost:3000/scrape?targetWebsiteUrl=https://erafone.com/katalog/personalisasi/deals-erafone-7581&targetServiceUrl=https://jeanne.eraspace.com/products/api/v4.1/homepage_campaign/deals-erafone?category_id=7581&user_id=a50df0bff699327c&store_code=erafone&mode=auto"
```

Response shape:

```json
{
  "success": true,
  "message": "Scraping completed successfully!",
  "data": {
    "request": {
      "mode": "auto",
      "executionMode": "direct"
    },
    "page": null,
    "service": {
      "matchedUrl": "https://jeanne.eraspace.com/products/api/v4.1/homepage_campaign/deals-erafone?category_id=7581&user_id=a50df0bff699327c&store_code=erafone",
      "status": 200,
      "ok": true,
      "result": {
        "status": 200,
        "appName": "Catalog Service API",
        "appVersion": "v4.0.0",
        "trace": "....",
        "category": {
          "id": 7581,
          "name": "Deals of the Day"
        },
        "totalCount": 10,
        "items": [
          {
            "id": 296153,
            "name": "OPPO Reno11 Pro 12/512GB 5G - Pearl White",
            "sku": "8100136260",
            "urlKey": "oppo-reno-11-pro-12-512gb-5g-pearl-white",
            "price": 8999000,
            "specialPrice": 8999000,
            "stockStatus": 0,
            "quantityStatus": false,
            "thumbnail": "https://cdnpro.eraspace.com/media/catalog/product/o/p/oppo_reno11_pro_5g_pearl_white_1.jpg",
            "rating": 5,
            "totalReview": 1,
            "customBadge": ""
          }
        ]
      }
    }
  }
}
```

## Authenticated Flows

If a page only triggers the target service after login, use `authStatePath` with a valid Playwright `storageState` JSON file.

Example:

```bash
curl "http://localhost:3000/scrape?targetWebsiteUrl=https://example.com/protected-page&targetServiceUrl=https://example.com/api/protected-resource&mode=browser&authStatePath=/absolute/path/to/auth-state.json"
```

Notes:

- `discover-services` uses Playwright because it needs to observe page traffic.
- `scrape` in `direct` mode does not open the page at all.
- `scrape` in `auto` mode prefers direct access when the service is public.

## Project Structure

```text
src/
  modules/
    service-discovery/
    web-scraper/
  shared/
    errors/
    http/
    scraper/
  routes/
  server.ts
  app.ts
```

Module responsibilities:

- `service-discovery`: Playwright-based service discovery and auth classification
- `web-scraper`: target service scraping
- `shared/scraper`: shared browser and URL helpers
- `shared/http`: response formatting

## Verification

Type check:

```bash
npx tsc --noEmit
```
