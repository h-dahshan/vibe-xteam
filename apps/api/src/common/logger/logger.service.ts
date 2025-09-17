import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import { ConfigService, ObservabilityConfig, AppConfig } from "../config";
import * as winston from "winston";
import { utilities as nestWinstonUtilities } from "nest-winston";
import { LOG_LEVELS_LADDER, LogLevel } from "./constants/logger.constants";

/**
 * Logger service extending NestJS Logger with Winston integration
 * All configuration comes from ConfigService - no hardcoded values
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly app: AppConfig;
  private readonly o11y: ObservabilityConfig;
  private readonly winston: winston.Logger;
  private readonly includeStack: boolean;

  constructor(private readonly configService: ConfigService) {
    this.app = this.configService.getApp();
    this.o11y = this.configService.getObservability();
    this.includeStack =
      this.configService.isDevelopment || this.configService.isStaging;

    // Initialize Winston logger
    this.winston = this.createWinstonLogger();
  }

  /**
   * Create transports based on configuration
   */
  private createTransports(): winston.transport[] {
    const { logTransport } = this.o11y;
    const transports: winston.transport[] = [];

    // Add stdout transport if configured
    if (logTransport === "stdout" || logTransport === "both") {
      transports.push(this.createStdoutTransport());
    }

    // OTLP transport will be added in Phase 4
    if (logTransport === "otlp" || logTransport === "both") {
      // TODO: Phase 4 - Add OTLP transport
      // For now, fallback to stdout if OTLP is requested
      if (transports.length === 0) {
        transports.push(this.createStdoutTransport());
      }
    }

    return transports;
  }

  /**
   * Create stdout transport for console output
   */
  private createStdoutTransport(): winston.transport {
    // Use different format based on environment
    const format = this.configService.isDevelopment
      ? this.getDevelopmentFormat()
      : this.getProductionFormat();

    return new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
      format,
    });
  }

  /**
   * Create Winston logger instance with configured format and transports
   */
  private createWinstonLogger(): winston.Logger {
    const { nodeEnv } = this.app;
    const { logLevel, logServiceName } = this.o11y;
    const transports = this.createTransports();

    return winston.createLogger({
      level: logLevel, // App's log levels now match Winston's
      defaultMeta: {
        service: logServiceName,
        environment: nodeEnv,
      },
      transports,
    });
  }

  /**
   * Get development format with colors and pretty printing
   */
  private getDevelopmentFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      winston.format.errors({ stack: this.includeStack }),
      nestWinstonUtilities.format.nestLike(this.app.name, {
        colors: true,
        prettyPrint: true,
      })
    );
  }

  /**
   * Get production format based on configuration
   */
  private getProductionFormat(): winston.Logform.Format {
    const { logFormat } = this.o11y;

    if (logFormat === "winston") {
      // In production, use standard Winston JSON without colors
      return winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: this.includeStack }),
        winston.format.json()
      );
    }

    // Default to OTEL-JSON for production
    return this.getOtelJsonFormat();
  }

  /**
   * Get OTEL-JSON format for OpenTelemetry compatibility
   */
  private getOtelJsonFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: this.includeStack }),
      winston.format.metadata({
        fillExcept: ["message", "level", "timestamp", "service"],
      }),
      winston.format.json()
    );
  }

  /**
   * Check if the given level should be logged based on ladder pattern
   */
  private shouldLog(level: LogLevel): boolean {
    const { logLevel } = this.o11y;

    const enabledLevels = LOG_LEVELS_LADDER[logLevel];
    return enabledLevels.includes(level);
  }

  /**
   * Format the log message with context
   */
  private formatMessage(message: any, context?: string): string {
    const prefix = context ? `[${context}] ` : "";
    return `${prefix}${typeof message === "string" ? message : JSON.stringify(message)}`;
  }

  /**
   * Core logging method with metadata support
   */
  private logWithLevel(
    level: LogLevel,
    message: any,
    metadata?: Record<string, any>,
    context?: string,
    trace?: string
  ): void {
    if (!this.shouldLog(level)) return;

    const logData: winston.LogEntry = {
      level: level,
      message: this.formatMessage(message, context),
      ...metadata,
    };

    if (trace) {
      logData.trace = trace;
    }

    this.winston.log(logData);
  }

  /**
   * Log info level message with optional metadata
   * NestJS log() method maps to Winston 'info' level
   */
  log(message: any, context?: string): void;
  log(message: any, metadata: Record<string, any>, context?: string): void;
  log(
    message: any,
    metadataOrContext?: Record<string, any> | string,
    context?: string
  ): void {
    const isMetadata =
      metadataOrContext && typeof metadataOrContext === "object";
    const actualContext = isMetadata ? context : metadataOrContext;
    const actualMetadata = isMetadata ? metadataOrContext : undefined;

    // NestJS log() method uses Winston 'info' level
    this.logWithLevel("info", message, actualMetadata, actualContext);
  }

  /**
   * Log error level message with optional metadata
   */
  error(message: any, trace?: string, context?: string): void;
  error(
    message: any,
    metadata: Record<string, any>,
    trace?: string,
    context?: string
  ): void;
  error(
    message: any,
    traceOrMetadata?: string | Record<string, any>,
    contextOrTrace?: string,
    context?: string
  ): void {
    const isMetadata = traceOrMetadata && typeof traceOrMetadata === "object";
    const actualTrace = isMetadata ? contextOrTrace : traceOrMetadata;
    const actualContext = isMetadata ? context : contextOrTrace;
    const actualMetadata = isMetadata ? traceOrMetadata : undefined;

    this.logWithLevel(
      "error",
      message,
      actualMetadata,
      actualContext,
      actualTrace
    );
  }

  /**
   * Log warning level message with optional metadata
   */
  warn(message: any, context?: string): void;
  warn(message: any, metadata: Record<string, any>, context?: string): void;
  warn(
    message: any,
    metadataOrContext?: Record<string, any> | string,
    context?: string
  ): void {
    const isMetadata =
      metadataOrContext && typeof metadataOrContext === "object";
    const actualContext = isMetadata ? context : metadataOrContext;
    const actualMetadata = isMetadata ? metadataOrContext : undefined;

    this.logWithLevel("warn", message, actualMetadata, actualContext);
  }

  /**
   * Log verbose level message with optional metadata
   * Note: verbose comes before debug in Winston NPM levels
   */
  verbose(message: any, context?: string): void;
  verbose(message: any, metadata: Record<string, any>, context?: string): void;
  verbose(
    message: any,
    metadataOrContext?: Record<string, any> | string,
    context?: string
  ): void {
    const isMetadata =
      metadataOrContext && typeof metadataOrContext === "object";
    const actualContext = isMetadata ? context : metadataOrContext;
    const actualMetadata = isMetadata ? metadataOrContext : undefined;

    this.logWithLevel("verbose", message, actualMetadata, actualContext);
  }

  /**
   * Log debug level message with optional metadata
   * Note: debug comes after verbose in Winston NPM levels
   */
  debug(message: any, context?: string): void;
  debug(message: any, metadata: Record<string, any>, context?: string): void;
  debug(
    message: any,
    metadataOrContext?: Record<string, any> | string,
    context?: string
  ): void {
    const isMetadata =
      metadataOrContext && typeof metadataOrContext === "object";
    const actualContext = isMetadata ? context : metadataOrContext;
    const actualMetadata = isMetadata ? metadataOrContext : undefined;

    this.logWithLevel("debug", message, actualMetadata, actualContext);
  }

  /**
   * Get the current log level
   */
  getLogLevel(): LogLevel {
    return this.o11y.logLevel;
  }
}
