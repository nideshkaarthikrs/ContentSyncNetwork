import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

// Messages safe to send to clients for statuses that can be reclassified from
// a raw (non-HttpException) error below -- never forward exception.message
// for these, it can contain filesystem paths (e.g. static-file ENOENT).
const RECLASSIFIED_STATUS_MESSAGES: Record<number, string> = {
  404: 'Not found',
};

function extractHttpStatus(exception: unknown): number | null {
  if (typeof exception !== 'object' || exception === null) {
    return null;
  }
  const candidate = exception as { status?: unknown; statusCode?: unknown };
  const status = candidate.status ?? candidate.statusCode;
  return typeof status === 'number' && status >= 400 && status < 600 ? status : null;
}

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
      // Not a Nest HttpException -- e.g. the implicit static-file fallback
      // route in @nestjs/serve-static throws a plain ENOENT Error (with a
      // numeric .status) when a file is missing. Honor its real status
      // instead of collapsing every unrecognized error to 500.
      const rawStatus = extractHttpStatus(exception);
      if (rawStatus !== null) {
        status = rawStatus;
        errorCode = `CSN-${status}`;
        message = RECLASSIFIED_STATUS_MESSAGES[status] ?? 'Internal server error';
      }
    }

    if (status >= 500) {
      const detail = exception instanceof Error ? exception.stack ?? exception.message : exception;
      this.logger.error(detail);
    } else if (!(exception instanceof HttpException)) {
      const detail = exception instanceof Error ? exception.message : String(exception);
      this.logger.warn(`Reclassified non-HttpException as ${status}: ${detail}`);
    }

    response.status(status).json({ status: 'ERROR', errorCode, message });
  }
}
