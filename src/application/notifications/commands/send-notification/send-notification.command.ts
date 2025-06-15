export class SendNotificationCommand {
  constructor(
    public readonly recipientId: string,
    public readonly type: string,
    public readonly title: string,
    public readonly message: string,
    public readonly channels: string[],
    public readonly priority: string = 'NORMAL',
    public readonly scheduledAt?: Date,
    public readonly templateId?: string,
    public readonly templateVariables?: Record<string, any>,
    public readonly metadata?: Record<string, any>,
    public readonly expiresAt?: Date,
    public readonly maxRetries?: number,
  ) {}
}
