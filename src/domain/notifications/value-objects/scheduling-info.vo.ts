export class SchedulingInfo {
  private readonly _scheduledAt: Date;
  private readonly _timezone?: string;
  private readonly _recurrence?: RecurrencePattern;

  constructor(
    scheduledAt: Date,
    timezone?: string,
    recurrence?: RecurrencePattern,
  ) {
    this.validateScheduledAt(scheduledAt);
    this.validateTimezone(timezone);

    this._scheduledAt = scheduledAt;
    this._timezone = timezone;
    this._recurrence = recurrence;
  }

  get scheduledAt(): Date {
    return this._scheduledAt;
  }

  get timezone(): string | undefined {
    return this._timezone;
  }

  get recurrence(): RecurrencePattern | undefined {
    return this._recurrence;
  }

  public isScheduled(): boolean {
    return this._scheduledAt > new Date();
  }

  public isDue(): boolean {
    return this._scheduledAt <= new Date();
  }

  public isOverdue(): boolean {
    const now = new Date();
    const overdueThreshold = 5 * 60 * 1000; // 5 minutes
    return now.getTime() - this._scheduledAt.getTime() > overdueThreshold;
  }

  public isRecurring(): boolean {
    return !!this._recurrence;
  }

  public getDelayUntilExecution(): number {
    const now = new Date();
    return Math.max(0, this._scheduledAt.getTime() - now.getTime());
  }

  public getNextExecution(): Date | null {
    if (!this._recurrence) {
      return null;
    }

    return this._recurrence.getNextExecution(this._scheduledAt);
  }

  public shouldExecuteNow(): boolean {
    return this.isDue() && !this.isOverdue();
  }

  public toISOString(): string {
    return this._scheduledAt.toISOString();
  }

  public equals(other: SchedulingInfo): boolean {
    return (
      this._scheduledAt.getTime() === other._scheduledAt.getTime() &&
      this._timezone === other._timezone &&
      this._recurrence?.equals(other._recurrence) !== false
    );
  }

  private validateScheduledAt(scheduledAt: Date): void {
    if (!(scheduledAt instanceof Date) || isNaN(scheduledAt.getTime())) {
      throw new Error('Invalid scheduled date');
    }

    const now = new Date();
    const maxFutureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

    if (scheduledAt > maxFutureDate) {
      throw new Error(
        'Scheduled date cannot be more than 1 year in the future',
      );
    }
  }

  private validateTimezone(timezone?: string): void {
    if (timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
      } catch {
        throw new Error(`Invalid timezone: ${timezone}`);
      }
    }
  }
}

export class RecurrencePattern {
  public static readonly DAILY = new RecurrencePattern('DAILY', 1);
  public static readonly WEEKLY = new RecurrencePattern('WEEKLY', 7);
  public static readonly MONTHLY = new RecurrencePattern('MONTHLY', 30);
  public static readonly YEARLY = new RecurrencePattern('YEARLY', 365);

  private constructor(
    private readonly _type: string,
    private readonly _intervalDays: number,
  ) {}

  get type(): string {
    return this._type;
  }

  get intervalDays(): number {
    return this._intervalDays;
  }

  public getNextExecution(lastExecution: Date): Date {
    const nextExecution = new Date(lastExecution);

    switch (this._type) {
      case 'DAILY':
        nextExecution.setDate(nextExecution.getDate() + 1);
        break;
      case 'WEEKLY':
        nextExecution.setDate(nextExecution.getDate() + 7);
        break;
      case 'MONTHLY':
        nextExecution.setMonth(nextExecution.getMonth() + 1);
        break;
      case 'YEARLY':
        nextExecution.setFullYear(nextExecution.getFullYear() + 1);
        break;
    }

    return nextExecution;
  }

  public equals(other?: RecurrencePattern): boolean {
    if (!other) return false;
    return (
      this._type === other._type && this._intervalDays === other._intervalDays
    );
  }

  public static fromString(type: string): RecurrencePattern {
    const patternMap: Record<string, RecurrencePattern> = {
      DAILY: RecurrencePattern.DAILY,
      WEEKLY: RecurrencePattern.WEEKLY,
      MONTHLY: RecurrencePattern.MONTHLY,
      YEARLY: RecurrencePattern.YEARLY,
    };

    const pattern = patternMap[type.toUpperCase()];
    if (!pattern) {
      throw new Error(`Invalid recurrence pattern: ${type}`);
    }

    return pattern;
  }
}
