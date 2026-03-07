import type { Response } from 'express';

type ControllerResult = {
  statusCode?: number;
  message: string;
  data?: unknown;
};

class ResultHandler {
  public send(res: Response, result: ControllerResult) {
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
export type { ControllerResult };
