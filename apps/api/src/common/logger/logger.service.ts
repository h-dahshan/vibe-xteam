import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import { ConfigService } from "../config";
import * as winston from "winston";
import { LOG_LEVELS_LADDER, LogLevel } from "./constants/logger.constants";

/**
 * Logger service extending NestJS Logger with Winston integration
 * All configuration comes from ConfigService - no hardcoded values
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly environment: string;
  private readonly includeStack: boolean;
  private readonly serviceName: string;
  private readonly logFormat: string;
  private readonly logLevel: LogLevel;
  private readonly winston: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    // Get all configuration from ConfigService
    const app = this.configService.getApp();
    const observability = this.configService.getObservability();

    this.environment = app.nodeEnv;
    this.includeStack =
      this.configService.isDevelopment || this.configService.isStaging;

    this.serviceName = observability.logServiceName;
    this.logFormat = observability.logFormat;
    this.logLevel = observability.logLevel;

    // Initialize Winston logger
    this.winston = this.createWinstonLogger();
  }

  /**
   * Create stdout transport for console output
   */
  private createStdoutTransport(): winston.transport {
    return new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    });
  }

  /**
   * Create Winston logger instance with configured format and transports
   */
  private createWinstonLogger(): winston.Logger {
    const format = this.getLogFormat();

    return winston.createLogger({
      format,
      level: this.logLevel, // Direct use - our levels now match Winston
      defaultMeta: {
        service: this.serviceName,
        environment: this.environment,
      },
      transports: [this.createStdoutTransport()],
    });
  }

  /**
   * Get the appropriate log format based on configuration
   */
  private getLogFormat(): winston.Logform.Format {
    const formats: winston.Logform.Format[] = [
      winston.format.timestamp(),
      winston.format.errors({ stack: this.includeStack }),
    ];

    switch (this.logFormat) {
      case "otel-json":
        // OpenTelemetry compatible JSON format
        formats.push(
          winston.format.metadata({
            fillExcept: ["message", "level", "timestamp", "service"],
          }),
          winston.format.json()
        );
        break;
      case "winston":
      default:
        // Standard Winston JSON format
        formats.push(winston.format.json());
        break;
    }

    return winston.format.combine(...formats);
  }

  /**
   * Check if the given level should be logged based on ladder pattern
   */
  private shouldLog(level: LogLevel): boolean {
    const enabledLevels = LOG_LEVELS_LADDER[this.logLevel];
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
   * Set the log level dynamically (useful for testing)
   */
  setLogLevel(level: LogLevel): void {
    (this as any).logLevel = level;
    this.winston.level = level; // Direct use - no mapping needed
  }

  /**
   * Get the current log level
   */
  getLogLevel(): LogLevel {
    return this.logLevel;
  }
}
