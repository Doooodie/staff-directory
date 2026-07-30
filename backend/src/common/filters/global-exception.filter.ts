import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  constructor(protected readonly httpAdapterHost: HttpAdapterHost) {
    super(httpAdapterHost.httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    if (!(exception instanceof HttpException)) {
      this.handleUnknownError(exception, host, httpAdapter);
      return;
    }

    const status = exception.getStatus();
    const res = exception.getResponse();
    const body = typeof res === 'string' ? { message: res } : res;

    const responseBody = {
      statusCode: status,
      ...body,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
