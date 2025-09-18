import { Global, Module, MiddlewareConsumer } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ClsModule } from "nestjs-cls";
import { LoggerService } from "./logger.service";
import { CorrelationIdMiddleware } from "./middleware/correlation-id.middleware";
import { LoggingInterceptor } from "./interceptors/logging.interceptor";

/**
 * Global logger module with CLS support for correlation ID tracking
 * Depends on ConfigModule which is already global
 */
@Global()
@Module({
  imports: [
    // Configure CLS module for async context management
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: false, // We'll mount our own middleware for better control
        generateId: false, // We handle ID generation in middleware
      },
    }),
  ],
  providers: [
    LoggerService,
    // Register logging interceptor globally
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {
  /**
   * Configure middleware for correlation ID handling
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*"); // Apply to all routes
  }
}
