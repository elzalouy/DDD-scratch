import { DeliveryChannel } from './delivery-channel.vo';

export class DeliveryAttempt {
  private readonly _channel: DeliveryChannel;
  private readonly _attemptedAt: Date;
  private readonly _success: boolean;
  private readonly _error?: string;
  private readonly _externalId?: string;
  private readonly _responseCode?: number;
  private readonly _responseTime?: number;
  private readonly _metadata?: Record<string, any>;

  constructor(
    channel: DeliveryChannel,
    attemptedAt: Date,
    success: boolean,
    error?: string,
    externalId?: string,
    responseCode?: number,
    responseTime?: number,
    metadata?: Record<string, any>,
  ) {
    this._channel = channel;
    this._attemptedAt = attemptedAt;
    this._success = success;
    this._error = error;
    this._externalId = externalId;
    this._responseCode = responseCode;
    this._responseTime = responseTime;
    this._metadata = metadata || {};
  }

  get channel(): DeliveryChannel {
    return this._channel;
  }

  get attemptedAt(): Date {
    return this._attemptedAt;
  }

  get success(): boolean {
    return this._success;
  }

  get error(): string | undefined {
    return this._error;
  }

  get externalId(): string | undefined {
    return this._externalId;
  }

  get responseCode(): number | undefined {
    return this._responseCode;
  }

  get responseTime(): number | undefined {
    return this._responseTime;
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  public isSuccess(): boolean {
    return this._success;
  }

  public isFailure(): boolean {
    return !this._success;
  }

  public isRetryable(): boolean {
    if (this._success) {
      return false;
    }

    // Non-retryable error codes
    const nonRetryableCodes = [400, 401, 403, 404, 422];
    if (this._responseCode && nonRetryableCodes.includes(this._responseCode)) {
      return false;
    }

    // Check for specific error patterns that indicate permanent failures
    const permanentErrorPatterns = [
      /invalid.*email/i,
      /invalid.*phone/i,
      /unsubscribed/i,
      /blocked/i,
      /spam/i,
      /bounced/i,
    ];

    if (this._error) {
      for (const pattern of permanentErrorPatterns) {
        if (pattern.test(this._error)) {
          return false;
        }
      }
    }

    return true;
  }

  public getErrorCategory(): ErrorCategory {
    if (this._success) {
      return ErrorCategory.NONE;
    }

    if (!this._error) {
      return ErrorCategory.UNKNOWN;
    }

    const error = this._error.toLowerCase();

    if (error.includes('timeout') || error.includes('timed out')) {
      return ErrorCategory.TIMEOUT;
    }

    if (error.includes('rate limit') || error.includes('throttled')) {
      return ErrorCategory.RATE_LIMIT;
    }

    if (error.includes('invalid') || error.includes('malformed')) {
      return ErrorCategory.VALIDATION;
    }

    if (
      error.includes('auth') ||
      error.includes('unauthorized') ||
      error.includes('forbidden')
    ) {
      return ErrorCategory.AUTHENTICATION;
    }

    if (error.includes('network') || error.includes('connection')) {
      return ErrorCategory.NETWORK;
    }

    if (
      error.includes('service unavailable') ||
      error.includes('server error')
    ) {
      return ErrorCategory.SERVICE_UNAVAILABLE;
    }

    return ErrorCategory.UNKNOWN;
  }

  public getDuration(): number {
    return this._responseTime || 0;
  }

  public toLogEntry(): Record<string, any> {
    return {
      channel: this._channel.value,
      attemptedAt: this._attemptedAt.toISOString(),
      success: this._success,
      error: this._error,
      externalId: this._externalId,
      responseCode: this._responseCode,
      responseTime: this._responseTime,
      errorCategory: this.getErrorCategory(),
      retryable: this.isRetryable(),
      metadata: this._metadata,
    };
  }

  public equals(other: DeliveryAttempt): boolean {
    return (
      this._channel.equals(other._channel) &&
      this._attemptedAt.getTime() === other._attemptedAt.getTime() &&
      this._success === other._success &&
      this._error === other._error &&
      this._externalId === other._externalId
    );
  }

  public static createSuccess(
    channel: DeliveryChannel,
    externalId?: string,
    responseTime?: number,
    metadata?: Record<string, any>,
  ): DeliveryAttempt {
    return new DeliveryAttempt(
      channel,
      new Date(),
      true,
      undefined,
      externalId,
      200,
      responseTime,
      metadata,
    );
  }

  public static createFailure(
    channel: DeliveryChannel,
    error: string,
    responseCode?: number,
    responseTime?: number,
    metadata?: Record<string, any>,
  ): DeliveryAttempt {
    return new DeliveryAttempt(
      channel,
      new Date(),
      false,
      error,
      undefined,
      responseCode,
      responseTime,
      metadata,
    );
  }
}

export enum ErrorCategory {
  NONE = 'NONE',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  NETWORK = 'NETWORK',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  UNKNOWN = 'UNKNOWN',
}
