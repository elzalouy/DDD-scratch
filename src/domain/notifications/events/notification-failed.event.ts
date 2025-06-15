export class NotificationFailedEvent {
  constructor(
    public readonly notificationId: string,
    public readonly recipientId: string,
    public readonly reason: string,
    public readonly attemptCount: number,
    public readonly failedAt: Date = new Date(),
  ) {}

  public getEventName(): string {
    return 'NotificationFailed';
  }

  public getVersion(): string {
    return '1.0';
  }

  public toPayload(): Record<string, any> {
    return {
      notificationId: this.notificationId,
      recipientId: this.recipientId,
      reason: this.reason,
      attemptCount: this.attemptCount,
      failedAt: this.failedAt.toISOString(),
      eventName: this.getEventName(),
      version: this.getVersion(),
    };
  }
}
