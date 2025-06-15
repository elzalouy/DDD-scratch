import { NotificationEntity } from '../entities/notification.entity';
import { NotificationId } from '../value-objects/notification-id.vo';
import { NotificationStatus } from '../value-objects/notification-status.vo';
import { NotificationPriority } from '../value-objects/notification-priority.vo';

export interface INotificationRepository {
  /**
   * Save or update a notification
   */
  save(notification: NotificationEntity): Promise<void>;

  /**
   * Find notification by ID
   */
  findById(id: NotificationId): Promise<NotificationEntity | null>;

  /**
   * Find notifications by recipient ID
   */
  findByRecipientId(
    recipientId: string,
    limit?: number,
    offset?: number,
  ): Promise<NotificationEntity[]>;

  /**
   * Find notifications by status
   */
  findByStatus(
    status: NotificationStatus,
    limit?: number,
    offset?: number,
  ): Promise<NotificationEntity[]>;

  /**
   * Find scheduled notifications that are due for processing
   */
  findDueScheduledNotifications(limit?: number): Promise<NotificationEntity[]>;

  /**
   * Find notifications that need retry
   */
  findRetryableNotifications(limit?: number): Promise<NotificationEntity[]>;

  /**
   * Find notifications by priority for processing
   */
  findByPriority(
    priority: NotificationPriority,
    limit?: number,
  ): Promise<NotificationEntity[]>;

  /**
   * Find expired notifications
   */
  findExpiredNotifications(limit?: number): Promise<NotificationEntity[]>;

  /**
   * Count notifications by status
   */
  countByStatus(status: NotificationStatus): Promise<number>;

  /**
   * Count notifications by recipient
   */
  countByRecipient(recipientId: string): Promise<number>;

  /**
   * Delete notification by ID
   */
  delete(id: NotificationId): Promise<void>;

  /**
   * Bulk update notification status
   */
  bulkUpdateStatus(
    ids: NotificationId[],
    status: NotificationStatus,
  ): Promise<void>;

  /**
   * Find notifications created within date range
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
    limit?: number,
    offset?: number,
  ): Promise<NotificationEntity[]>;

  /**
   * Search notifications by content
   */
  searchByContent(
    searchTerm: string,
    limit?: number,
    offset?: number,
  ): Promise<NotificationEntity[]>;

  /**
   * Get notification statistics
   */
  getStatistics(
    startDate: Date,
    endDate: Date,
  ): Promise<NotificationStatistics>;
}

export interface NotificationStatistics {
  totalNotifications: number;
  sentNotifications: number;
  failedNotifications: number;
  pendingNotifications: number;
  scheduledNotifications: number;
  successRate: number;
  averageDeliveryTime: number;
  channelBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
}
