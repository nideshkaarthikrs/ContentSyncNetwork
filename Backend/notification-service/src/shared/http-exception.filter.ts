import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'CSN-500';
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorCode = `CSN-${status}`;
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        if (typeof resp['errorCode'] === 'string') {
          errorCode = resp['errorCode'];
          message = typeof resp['message'] === 'string' ? resp['message'] : message;
        } else {
          errorCode = `CSN-${status}`;
          if (Array.isArray(resp['message'])) {
            message = (resp['message'] as string[]).join('; ');
          } else if (typeof resp['message'] === 'string') {
            message = resp['message'];
          }
        }
      }
    } else {
      // Not a Nest HttpException -- an unhandled error that collapses to a
      // generic 500 above. Log it so it doesn't vanish silently.
      const err = exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(err.message, err.stack);
    }

    response.status(status).json({ status: 'ERROR', errorCode, message });
  }
}
