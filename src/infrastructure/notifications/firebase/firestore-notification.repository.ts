import { Injectable, Logger } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { FirebaseConfig } from './firebase.config';
import {
  INotificationRepository,
  NotificationStatistics,
} from '../../../domain/notifications/repositories/notification.repository.interface';
import { NotificationEntity } from '../../../domain/notifications/entities/notification.entity';
import { NotificationId } from '../../../domain/notifications/value-objects/notification-id.vo';
import { NotificationStatus } from '../../../domain/notifications/value-objects/notification-status.vo';
import { NotificationPriority } from '../../../domain/notifications/value-objects/notification-priority.vo';
import { NotificationType } from '../../../domain/notifications/value-objects/notification-type.vo';
import { NotificationContent } from '../../../domain/notifications/value-objects/notification-content.vo';
import { DeliveryChannel } from '../../../domain/notifications/value-objects/delivery-channel.vo';
import { SchedulingInfo } from '../../../domain/notifications/value-objects/scheduling-info.vo';

@Injectable()
export class FirestoreNotificationRepository
  implements INotificationRepository
{
  private readonly logger = new Logger(FirestoreNotificationRepository.name);
  private readonly firestore: Firestore;
  private readonly collectionName = 'notifications';

  constructor(private readonly firebaseConfig: FirebaseConfig) {
    this.firestore = firebaseConfig.firestore;
  }

  async save(notification: NotificationEntity): Promise<void> {
    try {
      const docRef = this.firestore
        .collection(this.collectionName)
        .doc(notification.id.value);
      const data = this.toFirestoreData(notification);

      await docRef.set(data, { merge: true });

      this.logger.debug(`Notification saved: ${notification.id.value}`);
    } catch (error) {
      this.logger.error(
        `Failed to save notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: NotificationId): Promise<NotificationEntity | null> {
    try {
      const docRef = this.firestore
        .collection(this.collectionName)
        .doc(id.value);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      return this.fromFirestoreData(doc.data(), id.value);
    } catch (error) {
      this.logger.error(
        `Failed to find notification by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByRecipientId(
    recipientId: string,
    limit = 50,
    offset = 0,
  ): Promise<NotificationEntity[]> {
    try {
      const query = this.firestore
        .collection(this.collectionName)
        .where('recipientId', '==', recipientId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset);

      const snapshot = await query.get();
      return this.mapSnapshotToEntities(snapshot);
    } catch (error) {
      this.logger.error(
        `Failed to find notifications by recipient: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByStatus(
    status: NotificationStatus,
    limit = 100,
    offset = 0,
  ): Promise<NotificationEntity[]> {
    try {
      const query = this.firestore
        .collection(this.collectionName)
        .where('status', '==', status.value)
        .orderBy('createdAt', 'asc')
        .limit(limit)
        .offset(offset);

      const snapshot = await query.get();
      return this.mapSnapshotToEntities(snapshot);
    } catch (error) {
      this.logger.error(
        `Failed to find notifications by status: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findDueScheduledNotifications(
    limit = 100,
  ): Promise<NotificationEntity[]> {
    try {
      const now = new Date();
      const query = this.firestore
        .collection(this.collectionName)
        .where('status', '==', 'SCHEDULED')
        .where('scheduledAt', '<=', now)
        .orderBy('scheduledAt', 'asc')
        .limit(limit);

      const snapshot = await query.get();
      return this.mapSnapshotToEntities(snapshot);
    } catch (error) {
      this.logger.error(
        `Failed to find due scheduled notifications: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findRetryableNotifications(limit = 100): Promise<NotificationEntity[]> {
    try {
      const query = this.firestore
        .collection(this.collectionName)
        .where('status', '==', 'RETRY')
        .orderBy('priority', 'desc')
        .orderBy('createdAt', 'asc')
        .limit(limit);

      const snapshot = await query.get();
      return this.mapSnapshotToEntities(snapshot);
    } catch (error) {
      this.logger.error(
        `Failed to find retryable notifications: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByPriority(
    priority: NotificationPriority,
    limit = 100,
  ): Promise<NotificationEntity[]> {
    try {
      const query = this.firestore
        .collection(this.collectionName)
        .where('priority', '==', priority.value)
        .where('status', 'in', ['PENDING', 'RETRY'])
        .orderBy('createdAt', 'asc')
        .limit(limit);

      const snapshot = await query.get();
      return this.mapSnapshotToEntities(snapshot);
    } catch (error) {
      this.logger.error(
        `Failed to find notifications by priority: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findExpiredNotifications(limit = 100): Promise<NotificationEntity[]> {
    try {
      const now = new Date();
      const query = this.firestore
        .collection(this.collectionName)
        .where('expiresAt', '<=', now)
        .where('status', 'not-in', ['SENT', 'FAILED', 'EXPIRED'])
        .limit(limit);

      const snapshot = await query.get();
      return this.mapSnapshotToEntities(snapshot);
    } catch (error) {
      this.logger.error(
        `Failed to find expired notifications: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async countByStatus(status: NotificationStatus): Promise<number> {
    try {
      const query = this.firestore
        .collection(this.collectionName)
        .where('status', '==', status.value);

      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      this.logger.error(
        `Failed to count notifications by status: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async countByRecipient(recipientId: string): Promise<number> {
    try {
      const query = this.firestore
        .collection(this.collectionName)
        .where('recipientId', '==', recipientId);

      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      this.logger.error(
        `Failed to count notifications by recipient: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async delete(id: NotificationId): Promise<void> {
    try {
      const docRef = this.firestore
        .collection(this.collectionName)
        .doc(id.value);
      await docRef.delete();

      this.logger.debug(`Notification deleted: ${id.value}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async bulkUpdateStatus(
    ids: NotificationId[],
    status: NotificationStatus,
  ): Promise<void> {
    try {
      const batch = this.firestore.batch();

      for (const id of ids) {
        const docRef = this.firestore
          .collection(this.collectionName)
          .doc(id.value);
        batch.update(docRef, {
          status: status.value,
          updatedAt: new Date(),
        });
      }

      await batch.commit();

      this.logger.debug(
        `Bulk updated ${ids.length} notifications to status: ${status.value}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to bulk update notification status: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit = 100,
    offset = 0,
  ): Promise<NotificationEntity[]> {
    try {
      const query = this.firestore
        .collection(this.collectionName)
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset);

      const snapshot = await query.get();
      return this.mapSnapshotToEntities(snapshot);
    } catch (error) {
      this.logger.error(
        `Failed to find notifications by date range: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async searchByContent(
    searchTerm: string,
    limit = 50,
    offset = 0,
  ): Promise<NotificationEntity[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - for production, consider using Algolia or Elasticsearch
      const query = this.firestore
        .collection(this.collectionName)
        .where('title', '>=', searchTerm)
        .where('title', '<=', searchTerm + '\uf8ff')
        .limit(limit)
        .offset(offset);

      const snapshot = await query.get();
      return this.mapSnapshotToEntities(snapshot);
    } catch (error) {
      this.logger.error(
        `Failed to search notifications by content: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getStatistics(
    startDate: Date,
    endDate: Date,
  ): Promise<NotificationStatistics> {
    try {
      // This is a simplified implementation - for production, consider using aggregation queries or a separate analytics collection
      const query = this.firestore
        .collection(this.collectionName)
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate);

      const snapshot = await query.get();
      const notifications = this.mapSnapshotToEntities(snapshot);

      return this.calculateStatistics(notifications);
    } catch (error) {
      this.logger.error(
        `Failed to get notification statistics: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private toFirestoreData(notification: NotificationEntity): any {
    return {
      recipientId: notification.recipientId,
      type: notification.type.value,
      status: notification.status.value,
      priority: notification.priority.value,
      title: notification.content.title,
      message: notification.content.message,
      imageUrl: notification.content.imageUrl,
      actionUrl: notification.content.actionUrl,
      actionText: notification.content.actionText,
      channels: notification.deliveryChannels.map((ch) => ch.value),
      scheduledAt: notification.schedulingInfo?.scheduledAt,
      timezone: notification.schedulingInfo?.timezone,
      metadata: notification.metadata,
      deliveryAttempts: notification.deliveryAttempts.map((attempt) => ({
        channel: attempt.channel.value,
        attemptedAt: attempt.attemptedAt,
        success: attempt.success,
        error: attempt.error,
        externalId: attempt.externalId,
        responseCode: attempt.responseCode,
        responseTime: attempt.responseTime,
      })),
      maxRetries: notification.maxRetries,
      expiresAt: notification.expiresAt,
      templateId: notification.templateId,
      templateVariables: notification.templateVariables,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private fromFirestoreData(data: any, id: string): NotificationEntity {
    const notificationId = NotificationId.fromString(id);
    const type = NotificationType.fromString(data.type);
    const content = new NotificationContent(
      data.title,
      data.message,
      data.imageUrl,
      data.actionUrl,
      data.actionText,
    );
    const priority = NotificationPriority.fromString(data.priority);
    const channels = data.channels.map((ch: string) =>
      DeliveryChannel.fromString(ch),
    );

    const schedulingInfo = data.scheduledAt
      ? new SchedulingInfo(data.scheduledAt.toDate(), data.timezone)
      : undefined;

    const notification = new NotificationEntity(
      notificationId,
      data.recipientId,
      type,
      content,
      priority,
      channels,
      schedulingInfo,
      data.templateId,
      data.templateVariables,
      data.metadata || {},
      data.maxRetries || 3,
      data.expiresAt?.toDate(),
    );

    // Restore status and delivery attempts
    (notification as any)._status = NotificationStatus.fromString(data.status);
    (notification as any)._deliveryAttempts = data.deliveryAttempts || [];

    return notification;
  }

  private mapSnapshotToEntities(
    snapshot: FirebaseFirestore.QuerySnapshot,
  ): NotificationEntity[] {
    return snapshot.docs.map((doc) =>
      this.fromFirestoreData(doc.data(), doc.id),
    );
  }

  private calculateStatistics(
    notifications: NotificationEntity[],
  ): NotificationStatistics {
    const total = notifications.length;
    const sent = notifications.filter((n) => n.status.value === 'SENT').length;
    const failed = notifications.filter(
      (n) => n.status.value === 'FAILED',
    ).length;
    const pending = notifications.filter(
      (n) => n.status.value === 'PENDING',
    ).length;
    const scheduled = notifications.filter(
      (n) => n.status.value === 'SCHEDULED',
    ).length;

    const channelBreakdown: Record<string, number> = {};
    const typeBreakdown: Record<string, number> = {};
    const priorityBreakdown: Record<string, number> = {};

    for (const notification of notifications) {
      // Channel breakdown
      for (const channel of notification.deliveryChannels) {
        channelBreakdown[channel.value] =
          (channelBreakdown[channel.value] || 0) + 1;
      }

      // Type breakdown
      typeBreakdown[notification.type.value] =
        (typeBreakdown[notification.type.value] || 0) + 1;

      // Priority breakdown
      priorityBreakdown[notification.priority.value] =
        (priorityBreakdown[notification.priority.value] || 0) + 1;
    }

    return {
      totalNotifications: total,
      sentNotifications: sent,
      failedNotifications: failed,
      pendingNotifications: pending,
      scheduledNotifications: scheduled,
      successRate: total > 0 ? (sent / total) * 100 : 0,
      averageDeliveryTime: 0, // TODO: Calculate from delivery attempts
      channelBreakdown,
      typeBreakdown,
      priorityBreakdown,
    };
  }
}
