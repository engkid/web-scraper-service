import type { Request, Response } from 'express';
import { resultHandler } from '../handlers/result.handler.js';
import { ScrapeWebsiteError, webScraperService } from '../services/web.scraper.service.js';

class WebScraperController {
  public healthCheck = async (_req: Request, res: Response) => {
    resultHandler.send(res, {
      message: 'Web Scraper API is healthy!',
    });
  };

  public scrapeWebsite = async (req: Request, res: Response) => {
    try {
      const data = await webScraperService.scrapeWebsite(req.query);

      resultHandler.send(res, {
        statusCode: data.response.ok ? 200 : 502,
        message: data.response.ok ? 'Scraping completed successfully!' : 'Failed to fetch target website.',
        data,
      });
    } catch (error) {
      resultHandler.send(res, {
        statusCode: error instanceof ScrapeWebsiteError ? error.statusCode : 500,
        message: error instanceof Error ? error.message : 'Unexpected scraping error.',
      });
    }
  };
}

const webScraperController = new WebScraperController();

export { webScraperController };
