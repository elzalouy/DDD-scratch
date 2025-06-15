import { BaseId } from '../../shared/value-objects/base-id.vo';

export class NotificationId extends BaseId {
  constructor(value?: string) {
    super(value);
  }

  public static generate(): NotificationId {
    return new NotificationId();
  }

  public static fromString(value: string): NotificationId {
    return new NotificationId(value);
  }
}
