import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  constructor(protected readonly httpAdapterHost: HttpAdapterHost) {
    super(httpAdapterHost.httpAdapter);
  }

  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const timestamp = new Date().toISOString();
    const path = httpAdapter.getRequestUrl(ctx.getRequest());

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse();
      const body = typeof res === 'string' ? { message: res } : res;

      const responseBody = { statusCode, ...body, timestamp, path };

      httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
      return;
    }

    httpAdapter.reply(
      ctx.getResponse(),
      {
        statusCode: 500,
        error: 'Internal Server Error',
        message:
          exception instanceof Error
            ? exception.message
            : 'Internal Server Error',
        timestamp,
        path,
      },
      500,
    );

    this.logger.error(exception instanceof Error ? exception.stack : exception);
  }
}
