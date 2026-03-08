import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors/app.error.js';
import { resultHandler } from '../../shared/http/result.handler.js';
import { webScraperService } from './web-scraper.service.js';

class WebScraperController {
  public healthCheck = async (_req: Request, res: Response) => {
    resultHandler.send(res, {
      message: 'Web Scraper API is healthy!',
    });
  };

  public scrapeWebsite = async (req: Request, res: Response) => {
    try {
      const data = await webScraperService.scrapeWebsite(req.query);
      const statusCode = data.service.ok ? 200 : 502;

      resultHandler.send(res, {
        statusCode,
        message: statusCode === 200 ? 'Scraping completed successfully!' : 'Failed to fetch target website.',
        data,
      });
    } catch (error) {
      resultHandler.send(res, {
        statusCode: error instanceof AppError ? error.statusCode : 500,
        message: error instanceof Error ? error.message : 'Unexpected scraping error.',
      });
    }
  };

}

const webScraperController = new WebScraperController();

export { webScraperController };
