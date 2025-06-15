import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { SendNotificationCommand } from './send-notification.command';
import { NotificationEntity } from '../../../../domain/notifications/entities/notification.entity';
import { NotificationId } from '../../../../domain/notifications/value-objects/notification-id.vo';
import { NotificationType } from '../../../../domain/notifications/value-objects/notification-type.vo';
import { NotificationContent } from '../../../../domain/notifications/value-objects/notification-content.vo';
import { NotificationPriority } from '../../../../domain/notifications/value-objects/notification-priority.vo';
import { DeliveryChannel } from '../../../../domain/notifications/value-objects/delivery-channel.vo';
import { SchedulingInfo } from '../../../../domain/notifications/value-objects/scheduling-info.vo';
import { INotificationRepository } from '../../../../domain/notifications/repositories/notification.repository.interface';
import { IPubSubMessagePublisher } from '../../../../infrastructure/notifications/pubsub/pubsub-message-publisher.interface';

@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler
  implements ICommandHandler<SendNotificationCommand>
{
  private readonly logger = new Logger(SendNotificationHandler.name);

  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    @Inject('IPubSubMessagePublisher')
    private readonly messagePublisher: IPubSubMessagePublisher,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SendNotificationCommand): Promise<string> {
    try {
      this.logger.log(
        `Processing send notification command for recipient: ${command.recipientId}`,
      );

      // Create domain objects from command
      const notificationId = NotificationId.generate();
      const type = NotificationType.fromString(command.type);
      const content = new NotificationContent(command.title, command.message);
      const priority = NotificationPriority.fromString(command.priority);
      const channels = command.channels.map((ch) =>
        DeliveryChannel.fromString(ch),
      );

      const schedulingInfo = command.scheduledAt
        ? new SchedulingInfo(command.scheduledAt)
        : undefined;

      // Create notification entity
      const notification = new NotificationEntity(
        notificationId,
        command.recipientId,
        type,
        content,
        priority,
        channels,
        schedulingInfo,
        command.templateId,
        command.templateVariables,
        command.metadata || {},
        command.maxRetries || 3,
        command.expiresAt,
      );

      // Save to repository (Firestore)
      await this.notificationRepository.save(notification);

      // Publish domain events
      const domainEvents = notification.getDomainEvents();
      for (const event of domainEvents) {
        await this.eventBus.publish(event);
      }

      // Publish to Pub/Sub for processing
      await this.publishNotificationMessage(notification);

      this.logger.log(
        `Notification created and queued: ${notificationId.value}`,
      );

      return notificationId.value;
    } catch (error) {
      this.logger.error(
        `Failed to process send notification command: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async publishNotificationMessage(
    notification: NotificationEntity,
  ): Promise<void> {
    const topicName = this.getTopicName(notification);
    const message = this.createPubSubMessage(notification);

    await this.messagePublisher.publish(topicName, message);
  }

  private getTopicName(notification: NotificationEntity): string {
    if (notification.schedulingInfo?.isScheduled()) {
      return 'notification-scheduled';
    }

    if (notification.priority.isHigh()) {
      return 'notification-priority';
    }

    return 'notification-created';
  }

  private createPubSubMessage(notification: NotificationEntity): any {
    return {
      notificationId: notification.id.value,
      recipientId: notification.recipientId,
      type: notification.type.value,
      priority: notification.priority.value,
      channels: notification.deliveryChannels.map((ch) => ch.value),
      scheduledAt: notification.schedulingInfo?.scheduledAt?.toISOString(),
      metadata: notification.metadata,
      timestamp: new Date().toISOString(),
    };
  }
}
