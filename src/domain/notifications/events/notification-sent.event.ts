export class NotificationSentEvent {
  constructor(
    public readonly notificationId: string,
    public readonly recipientId: string,
    public readonly channel: string,
    public readonly attemptCount: number,
    public readonly sentAt: Date = new Date(),
  ) {}

  public getEventName(): string {
    return 'NotificationSent';
  }

  public getVersion(): string {
    return '1.0';
  }

  public toPayload(): Record<string, any> {
    return {
      notificationId: this.notificationId,
      recipientId: this.recipientId,
      channel: this.channel,
      attemptCount: this.attemptCount,
      sentAt: this.sentAt.toISOString(),
      eventName: this.getEventName(),
      version: this.getVersion(),
    };
  }
}
