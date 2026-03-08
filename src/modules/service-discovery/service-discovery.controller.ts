import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors/app.error.js';
import { resultHandler } from '../../shared/http/result.handler.js';
import { serviceDiscoveryService } from './service-discovery.service.js';

class ServiceDiscoveryController {
  public discoverServices = async (req: Request, res: Response) => {
    try {
      const data = await serviceDiscoveryService.discoverServices(req.query);

      resultHandler.send(res, {
        statusCode: 200,
        message: 'Service discovery completed successfully.',
        data,
      });
    } catch (error) {
      resultHandler.send(res, {
        statusCode: error instanceof AppError ? error.statusCode : 500,
        message: error instanceof Error ? error.message : 'Unexpected discovery error.',
      });
    }
  };
}

const serviceDiscoveryController = new ServiceDiscoveryController();

export { serviceDiscoveryController };
