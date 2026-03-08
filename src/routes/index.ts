import express from 'express';
import type { Router } from 'express';
import { serviceDiscoveryRouter } from '../modules/service-discovery/service-discovery.routes.js';
import { webScraperRouter } from '../modules/web-scraper/web-scraper.routes.js';

const router: Router = express.Router();

router.use('/', serviceDiscoveryRouter);
router.use('/', webScraperRouter);

export default router;
