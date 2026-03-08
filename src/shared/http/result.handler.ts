import type { Response } from 'express';
import type { HttpResult } from './http.types.js';

class ResultHandler {
  public send(res: Response, result: HttpResult) {
    const { statusCode = 200, message, data } = result;

    res.set('Cache-Control', 'no-store');
    res.status(statusCode).json({
      success: statusCode < 400,
      message,
      data,
    });
  }
}

const resultHandler = new ResultHandler();

export { resultHandler };
