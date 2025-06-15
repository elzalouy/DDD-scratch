export class NotificationCreatedEvent {
  constructor(
    public readonly notificationId: string,
    public readonly recipientId: string,
    public readonly type: string,
    public readonly priority: string,
    public readonly isScheduled: boolean,
    public readonly createdAt: Date = new Date(),
  ) {}

  public getEventName(): string {
    return 'NotificationCreated';
  }

  public getVersion(): string {
    return '1.0';
  }

  public toPayload(): Record<string, any> {
    return {
      notificationId: this.notificationId,
      recipientId: this.recipientId,
      type: this.type,
      priority: this.priority,
      isScheduled: this.isScheduled,
      createdAt: this.createdAt.toISOString(),
      eventName: this.getEventName(),
      version: this.getVersion(),
    };
  }
}
