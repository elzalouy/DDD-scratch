export class NotificationType {
  public static readonly POST_CREATED = new NotificationType('POST_CREATED');
  public static readonly POST_APPROVED = new NotificationType('POST_APPROVED');
  public static readonly POST_REJECTED = new NotificationType('POST_REJECTED');
  public static readonly POST_EXPIRED = new NotificationType('POST_EXPIRED');
  public static readonly USER_WELCOME = new NotificationType('USER_WELCOME');
  public static readonly USER_VERIFICATION = new NotificationType(
    'USER_VERIFICATION',
  );
  public static readonly PASSWORD_RESET = new NotificationType(
    'PASSWORD_RESET',
  );
  public static readonly SYSTEM_MAINTENANCE = new NotificationType(
    'SYSTEM_MAINTENANCE',
  );
  public static readonly PROMOTIONAL = new NotificationType('PROMOTIONAL');
  public static readonly SECURITY_ALERT = new NotificationType(
    'SECURITY_ALERT',
  );

  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  public equals(other: NotificationType): boolean {
    return this.value === other.value;
  }

  public isTransactional(): boolean {
    return [
      'POST_CREATED',
      'POST_APPROVED',
      'POST_REJECTED',
      'USER_WELCOME',
      'USER_VERIFICATION',
      'PASSWORD_RESET',
      'SECURITY_ALERT',
    ].includes(this.value);
  }

  public isPromotional(): boolean {
    return ['PROMOTIONAL', 'SYSTEM_MAINTENANCE'].includes(this.value);
  }

  public static fromString(value: string): NotificationType {
    const typeMap: Record<string, NotificationType> = {
      POST_CREATED: NotificationType.POST_CREATED,
      POST_APPROVED: NotificationType.POST_APPROVED,
      POST_REJECTED: NotificationType.POST_REJECTED,
      POST_EXPIRED: NotificationType.POST_EXPIRED,
      USER_WELCOME: NotificationType.USER_WELCOME,
      USER_VERIFICATION: NotificationType.USER_VERIFICATION,
      PASSWORD_RESET: NotificationType.PASSWORD_RESET,
      SYSTEM_MAINTENANCE: NotificationType.SYSTEM_MAINTENANCE,
      PROMOTIONAL: NotificationType.PROMOTIONAL,
      SECURITY_ALERT: NotificationType.SECURITY_ALERT,
    };

    const type = typeMap[value.toUpperCase()];
    if (!type) {
      throw new Error(`Invalid notification type: ${value}`);
    }

    return type;
  }

  public toString(): string {
    return this._value;
  }
}
