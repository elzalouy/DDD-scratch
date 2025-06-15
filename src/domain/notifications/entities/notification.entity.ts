import { BaseEntity } from '../../shared/entities/base-entity';
import { NotificationId } from '../value-objects/notification-id.vo';
import { NotificationType } from '../value-objects/notification-type.vo';
import { NotificationStatus } from '../value-objects/notification-status.vo';
import { NotificationPriority } from '../value-objects/notification-priority.vo';
import { DeliveryChannel } from '../value-objects/delivery-channel.vo';
import { NotificationContent } from '../value-objects/notification-content.vo';
import { SchedulingInfo } from '../value-objects/scheduling-info.vo';
import { DeliveryAttempt } from '../value-objects/delivery-attempt.vo';
import { NotificationCreatedEvent } from '../events/notification-created.event';
import { NotificationSentEvent } from '../events/notification-sent.event';
import { NotificationFailedEvent } from '../events/notification-failed.event';
import { NotificationScheduledEvent } from '../events/notification-scheduled.event';

export class NotificationEntity extends BaseEntity<NotificationId> {
  private _recipientId: string;
  private _type: NotificationType;
  private _content: NotificationContent;
  private _status: NotificationStatus;
  private _priority: NotificationPriority;
  private _deliveryChannels: DeliveryChannel[];
  private _schedulingInfo: SchedulingInfo | null;
  private _metadata: Record<string, any>;
  private _deliveryAttempts: DeliveryAttempt[];
  private _maxRetries: number;
  private _expiresAt: Date | null;
  private _templateId: string | null;
  private _templateVariables: Record<string, any>;

  constructor(
    id: NotificationId,
    recipientId: string,
    type: NotificationType,
    content: NotificationContent,
    priority: NotificationPriority,
    deliveryChannels: DeliveryChannel[],
    schedulingInfo?: SchedulingInfo,
    templateId?: string,
    templateVariables?: Record<string, any>,
    metadata: Record<string, any> = {},
    maxRetries: number = 3,
    expiresAt?: Date,
  ) {
    super(id);
    this._recipientId = recipientId;
    this._type = type;
    this._content = content;
    this._status = NotificationStatus.PENDING;
    this._priority = priority;
    this._deliveryChannels = deliveryChannels;
    this._schedulingInfo = schedulingInfo || null;
    this._metadata = metadata;
    this._deliveryAttempts = [];
    this._maxRetries = maxRetries;
    this._expiresAt = expiresAt || null;
    this._templateId = templateId || null;
    this._templateVariables = templateVariables || {};

    // Domain event
    this.addDomainEvent(
      new NotificationCreatedEvent(
        this.id.value,
        this._recipientId,
        this._type.value,
        this._priority.value,
        schedulingInfo?.isScheduled() || false,
      ),
    );
  }

  // Getters
  get recipientId(): string {
    return this._recipientId;
  }

  get type(): NotificationType {
    return this._type;
  }

  get content(): NotificationContent {
    return this._content;
  }

  get status(): NotificationStatus {
    return this._status;
  }

  get priority(): NotificationPriority {
    return this._priority;
  }

  get deliveryChannels(): DeliveryChannel[] {
    return [...this._deliveryChannels];
  }

  get schedulingInfo(): SchedulingInfo | null {
    return this._schedulingInfo;
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  get deliveryAttempts(): DeliveryAttempt[] {
    return [...this._deliveryAttempts];
  }

  get maxRetries(): number {
    return this._maxRetries;
  }

  get expiresAt(): Date | null {
    return this._expiresAt;
  }

  get templateId(): string | null {
    return this._templateId;
  }

  get templateVariables(): Record<string, any> {
    return { ...this._templateVariables };
  }

  // Business methods
  public schedule(schedulingInfo: SchedulingInfo): void {
    if (this._status !== NotificationStatus.PENDING) {
      throw new Error('Cannot schedule notification that is not pending');
    }

    this._schedulingInfo = schedulingInfo;
    this._status = NotificationStatus.SCHEDULED;

    this.addDomainEvent(
      new NotificationScheduledEvent(
        this.id.value,
        this._recipientId,
        schedulingInfo.scheduledAt,
      ),
    );
  }

  public markAsProcessing(): void {
    if (!this.canBeProcessed()) {
      throw new Error('Notification cannot be processed in current state');
    }

    this._status = NotificationStatus.PROCESSING;
  }

  public recordDeliveryAttempt(
    channel: DeliveryChannel,
    success: boolean,
    error?: string,
    externalId?: string,
  ): void {
    const attempt = new DeliveryAttempt(
      channel,
      new Date(),
      success,
      error,
      externalId,
    );

    this._deliveryAttempts.push(attempt);

    if (success) {
      this.markAsSent(channel);
    } else {
      this.handleFailedAttempt(attempt);
    }
  }

  public markAsSent(successfulChannel?: DeliveryChannel): void {
    this._status = NotificationStatus.SENT;

    this.addDomainEvent(
      new NotificationSentEvent(
        this.id.value,
        this._recipientId,
        successfulChannel?.value || 'unknown',
        this._deliveryAttempts.length,
      ),
    );
  }

  public markAsFailed(reason: string): void {
    this._status = NotificationStatus.FAILED;

    this.addDomainEvent(
      new NotificationFailedEvent(
        this.id.value,
        this._recipientId,
        reason,
        this._deliveryAttempts.length,
      ),
    );
  }

  public isExpired(): boolean {
    return this._expiresAt ? new Date() > this._expiresAt : false;
  }

  public canBeProcessed(): boolean {
    if (this.isExpired()) {
      return false;
    }

    return [
      NotificationStatus.PENDING,
      NotificationStatus.SCHEDULED,
      NotificationStatus.RETRY,
    ].includes(this._status);
  }

  public shouldRetry(): boolean {
    return (
      this._status === NotificationStatus.RETRY &&
      this._deliveryAttempts.length < this._maxRetries &&
      !this.isExpired()
    );
  }

  public updateContent(content: NotificationContent): void {
    if (this._status !== NotificationStatus.PENDING) {
      throw new Error('Cannot update content of non-pending notification');
    }
    this._content = content;
  }

  private handleFailedAttempt(attempt: DeliveryAttempt): void {
    if (this._deliveryAttempts.length >= this._maxRetries) {
      this.markAsFailed(attempt.error || 'Max retries exceeded');
    } else {
      this._status = NotificationStatus.RETRY;
    }
  }
}
