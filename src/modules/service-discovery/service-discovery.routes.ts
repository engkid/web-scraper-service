import express from 'express';
import type { Router } from 'express';
import { serviceDiscoveryController } from './service-discovery.controller.js';

const serviceDiscoveryRouter: Router = express.Router();

serviceDiscoveryRouter.get('/discover-services', serviceDiscoveryController.discoverServices);

export { serviceDiscoveryRouter };
