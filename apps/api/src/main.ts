import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { LoggerService } from "./common/logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs until custom logger is attached
  });

  // Use our custom logger globally
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // Log application startup
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(
    `Application is running on: http://localhost:${port}`,
    "Bootstrap"
  );
}

void bootstrap();
