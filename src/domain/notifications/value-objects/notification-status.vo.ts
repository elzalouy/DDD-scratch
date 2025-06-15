export class NotificationStatus {
  public static readonly PENDING = new NotificationStatus('PENDING');
  public static readonly SCHEDULED = new NotificationStatus('SCHEDULED');
  public static readonly PROCESSING = new NotificationStatus('PROCESSING');
  public static readonly SENT = new NotificationStatus('SENT');
  public static readonly FAILED = new NotificationStatus('FAILED');
  public static readonly RETRY = new NotificationStatus('RETRY');
  public static readonly EXPIRED = new NotificationStatus('EXPIRED');
  public static readonly CANCELLED = new NotificationStatus('CANCELLED');

  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  public equals(other: NotificationStatus): boolean {
    return this.value === other.value;
  }

  public canTransitionTo(newStatus: NotificationStatus): boolean {
    const validTransitions: Record<string, string[]> = {
      PENDING: ['SCHEDULED', 'PROCESSING', 'CANCELLED'],
      SCHEDULED: ['PROCESSING', 'CANCELLED', 'EXPIRED'],
      PROCESSING: ['SENT', 'FAILED', 'RETRY'],
      RETRY: ['PROCESSING', 'FAILED', 'EXPIRED'],
      SENT: [],
      FAILED: ['RETRY'],
      EXPIRED: [],
      CANCELLED: [],
    };

    return validTransitions[this.value]?.includes(newStatus.value) || false;
  }

  public static fromString(value: string): NotificationStatus {
    const statusMap: Record<string, NotificationStatus> = {
      PENDING: NotificationStatus.PENDING,
      SCHEDULED: NotificationStatus.SCHEDULED,
      PROCESSING: NotificationStatus.PROCESSING,
      SENT: NotificationStatus.SENT,
      FAILED: NotificationStatus.FAILED,
      RETRY: NotificationStatus.RETRY,
      EXPIRED: NotificationStatus.EXPIRED,
      CANCELLED: NotificationStatus.CANCELLED,
    };

    const status = statusMap[value.toUpperCase()];
    if (!status) {
      throw new Error(`Invalid notification status: ${value}`);
    }

    return status;
  }

  public toString(): string {
    return this._value;
  }
}
