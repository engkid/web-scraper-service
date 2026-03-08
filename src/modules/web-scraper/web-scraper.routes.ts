import express from 'express';
import type { Router } from 'express';
import { webScraperController } from './web-scraper.controller.js';

const webScraperRouter: Router = express.Router();

webScraperRouter.get('/health', webScraperController.healthCheck);
webScraperRouter.get('/scrape', webScraperController.scrapeWebsite);

export { webScraperRouter };
