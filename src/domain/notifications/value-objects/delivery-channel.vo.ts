export class DeliveryChannel {
  public static readonly EMAIL = new DeliveryChannel('EMAIL', true, 10000);
  public static readonly SMS = new DeliveryChannel('SMS', true, 1000);
  public static readonly PUSH = new DeliveryChannel('PUSH', true, 50000);
  public static readonly WEBHOOK = new DeliveryChannel('WEBHOOK', false, 5000);
  public static readonly IN_APP = new DeliveryChannel('IN_APP', true, 100000);

  private constructor(
    private readonly _value: string,
    private readonly _requiresUserConsent: boolean,
    private readonly _defaultRateLimit: number, // per hour
  ) {}

  get value(): string {
    return this._value;
  }

  get requiresUserConsent(): boolean {
    return this._requiresUserConsent;
  }

  get defaultRateLimit(): number {
    return this._defaultRateLimit;
  }

  public equals(other: DeliveryChannel): boolean {
    return this.value === other.value;
  }

  public isRealTime(): boolean {
    return [DeliveryChannel.PUSH.value, DeliveryChannel.IN_APP.value].includes(
      this.value,
    );
  }

  public isExternal(): boolean {
    return [
      DeliveryChannel.EMAIL.value,
      DeliveryChannel.SMS.value,
      DeliveryChannel.WEBHOOK.value,
    ].includes(this.value);
  }

  public getMaxRetries(): number {
    const retryMap: Record<string, number> = {
      EMAIL: 3,
      SMS: 2,
      PUSH: 3,
      WEBHOOK: 5,
      IN_APP: 1,
    };
    return retryMap[this.value] || 3;
  }

  public getRetryDelay(attempt: number): number {
    // Exponential backoff: 2^attempt * base delay
    const baseDelay = this.getBaseRetryDelay();
    return Math.min(baseDelay * Math.pow(2, attempt), 300000); // Max 5 minutes
  }

  private getBaseRetryDelay(): number {
    const delayMap: Record<string, number> = {
      EMAIL: 30000, // 30 seconds
      SMS: 60000, // 1 minute
      PUSH: 15000, // 15 seconds
      WEBHOOK: 45000, // 45 seconds
      IN_APP: 10000, // 10 seconds
    };
    return delayMap[this.value] || 30000;
  }

  public getTimeout(): number {
    const timeoutMap: Record<string, number> = {
      EMAIL: 30000, // 30 seconds
      SMS: 15000, // 15 seconds
      PUSH: 10000, // 10 seconds
      WEBHOOK: 30000, // 30 seconds
      IN_APP: 5000, // 5 seconds
    };
    return timeoutMap[this.value] || 30000;
  }

  public static fromString(value: string): DeliveryChannel {
    const channelMap: Record<string, DeliveryChannel> = {
      EMAIL: DeliveryChannel.EMAIL,
      SMS: DeliveryChannel.SMS,
      PUSH: DeliveryChannel.PUSH,
      WEBHOOK: DeliveryChannel.WEBHOOK,
      IN_APP: DeliveryChannel.IN_APP,
    };

    const channel = channelMap[value.toUpperCase()];
    if (!channel) {
      throw new Error(`Invalid delivery channel: ${value}`);
    }

    return channel;
  }

  public static getAllChannels(): DeliveryChannel[] {
    return [
      DeliveryChannel.EMAIL,
      DeliveryChannel.SMS,
      DeliveryChannel.PUSH,
      DeliveryChannel.WEBHOOK,
      DeliveryChannel.IN_APP,
    ];
  }

  public toString(): string {
    return this._value;
  }
}
