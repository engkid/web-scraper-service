import express from 'express';
import type { Router } from 'express';
import { webScraperController } from '../controllers/web.scraper.controller.js';

const router: Router = express.Router();

router.get('/health', webScraperController.healthCheck);
router.get('/scrape', webScraperController.scrapeWebsite);

export default router;
