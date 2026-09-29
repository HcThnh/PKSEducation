import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response, Request } from "express";
import { Logger } from "@nestjs/common";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let error = "Internal Server Error";
        let message: String | String[] = "Internal Server Error occurred";

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                message = res;
                error = exception.name.replace(/([A-Z])/g, ' $1').trim();
            } else if (typeof res === 'object' && res !== null) {
                const errorObj = res as Record<string, any>;
                message = errorObj.message || exception.message;
                error = errorObj.error || exception.name.replace(/([A-Z])/g, ' $1').trim();
            }
        } else if (exception instanceof Error) {
            this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
        }

        const errorResponse = {
            statusCode,
            error,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        if (statusCode >= 500) {
            this.logger.error(`[${request.method}] ${request.url} - ${statusCode}`, JSON.stringify(errorResponse));
        } else {
            this.logger.warn(`[${request.method}] ${request.url} - ${statusCode}`, JSON.stringify(errorResponse));
        }

        response.status(statusCode).json(errorResponse);
    }
}