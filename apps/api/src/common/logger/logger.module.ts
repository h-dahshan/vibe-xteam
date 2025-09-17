import { Global, Module } from "@nestjs/common";
import { LoggerService } from "./logger.service";

/**
 * Global logger module
 * Depends on ConfigModule which is already global
 */
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
