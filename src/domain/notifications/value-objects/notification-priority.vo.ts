export class NotificationPriority {
  public static readonly LOW = new NotificationPriority('LOW', 1);
  public static readonly NORMAL = new NotificationPriority('NORMAL', 2);
  public static readonly HIGH = new NotificationPriority('HIGH', 3);
  public static readonly URGENT = new NotificationPriority('URGENT', 4);
  public static readonly CRITICAL = new NotificationPriority('CRITICAL', 5);

  private constructor(
    private readonly _value: string,
    private readonly _level: number,
  ) {}

  get value(): string {
    return this._value;
  }

  get level(): number {
    return this._level;
  }

  public equals(other: NotificationPriority): boolean {
    return this.value === other.value;
  }

  public isHigherThan(other: NotificationPriority): boolean {
    return this.level > other.level;
  }

  public isLowerThan(other: NotificationPriority): boolean {
    return this.level < other.level;
  }

  public isHigh(): boolean {
    return this.level >= NotificationPriority.HIGH.level;
  }

  public isCritical(): boolean {
    return this.level >= NotificationPriority.CRITICAL.level;
  }

  public getProcessingOrder(): number {
    // Higher priority = lower number for queue processing
    return 10 - this.level;
  }

  public getRetryDelay(): number {
    // Higher priority = shorter delay
    const baseDelay = 60000; // 1 minute
    return Math.max(baseDelay / this.level, 5000); // Minimum 5 seconds
  }

  public static fromString(value: string): NotificationPriority {
    const priorityMap: Record<string, NotificationPriority> = {
      LOW: NotificationPriority.LOW,
      NORMAL: NotificationPriority.NORMAL,
      HIGH: NotificationPriority.HIGH,
      URGENT: NotificationPriority.URGENT,
      CRITICAL: NotificationPriority.CRITICAL,
    };

    const priority = priorityMap[value.toUpperCase()];
    if (!priority) {
      throw new Error(`Invalid notification priority: ${value}`);
    }

    return priority;
  }

  public toString(): string {
    return this._value;
  }
}
