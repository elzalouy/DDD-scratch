export class NotificationScheduledEvent {
  constructor(
    public readonly notificationId: string,
    public readonly recipientId: string,
    public readonly scheduledAt: Date,
    public readonly scheduledOn: Date = new Date(),
  ) {}

  public getEventName(): string {
    return 'NotificationScheduled';
  }

  public getVersion(): string {
    return '1.0';
  }

  public toPayload(): Record<string, any> {
    return {
      notificationId: this.notificationId,
      recipientId: this.recipientId,
      scheduledAt: this.scheduledAt.toISOString(),
      scheduledOn: this.scheduledOn.toISOString(),
      eventName: this.getEventName(),
      version: this.getVersion(),
    };
  }
}
