import { ApiProperty } from '@nestjs/swagger';

export class DeliveryAttemptDto {
  @ApiProperty({
    description: 'Delivery channel used',
    example: 'EMAIL',
  })
  channel: string;

  @ApiProperty({
    description: 'Timestamp when delivery was attempted',
    example: '2024-01-15T10:30:15Z',
  })
  attemptedAt: Date;

  @ApiProperty({
    description: 'Whether the delivery was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'External service message ID',
    example: 'ses-message-id-123',
    required: false,
  })
  externalId?: string;

  @ApiProperty({
    description: 'Response time in milliseconds',
    example: 245,
    required: false,
  })
  responseTime?: number;

  @ApiProperty({
    description: 'Error message if delivery failed',
    example: 'Connection timeout',
    required: false,
  })
  error?: string;
}

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Unique notification identifier',
    example: '456e7890-e89b-12d3-a456-426614174001',
  })
  notificationId: string;

  @ApiProperty({
    description: 'Recipient user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  recipientId: string;

  @ApiProperty({
    description: 'Notification type',
    example: 'POST_APPROVED',
  })
  type: string;

  @ApiProperty({
    description: 'Current notification status',
    example: 'SENT',
  })
  status: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Your post has been approved!',
  })
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Your classified ad is now live.',
  })
  message: string;

  @ApiProperty({
    description: 'Delivery channels',
    example: ['EMAIL', 'PUSH'],
    type: [String],
  })
  channels: string[];

  @ApiProperty({
    description: 'Notification priority',
    example: 'NORMAL',
  })
  priority: string;

  @ApiProperty({
    description: 'When the notification was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the notification was sent',
    example: '2024-01-15T10:30:25Z',
    required: false,
  })
  sentAt?: Date;

  @ApiProperty({
    description: 'When the notification is scheduled for',
    example: '2024-01-15T15:00:00Z',
    required: false,
  })
  scheduledAt?: Date;

  @ApiProperty({
    description: 'When the notification expires',
    example: '2024-01-16T10:30:00Z',
    required: false,
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Number of retry attempts made',
    example: 0,
  })
  retryCount: number;

  @ApiProperty({
    description: 'Template ID used for rendering',
    example: 'post-approval-template',
    required: false,
  })
  templateId?: string;

  @ApiProperty({
    description: 'Variables used for template rendering',
    example: { postTitle: 'Vintage Camera', username: 'john_doe' },
    required: false,
  })
  templateVariables?: Record<string, any>;

  @ApiProperty({
    description: 'Additional metadata',
    example: { source: 'web', campaign: 'user-engagement' },
    required: false,
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Delivery attempts made',
    type: [DeliveryAttemptDto],
    required: false,
  })
  deliveryAttempts?: DeliveryAttemptDto[];
}

export class NotificationStatusResponseDto {
  @ApiProperty({
    description: 'Unique notification identifier',
    example: '456e7890-e89b-12d3-a456-426614174001',
  })
  notificationId: string;

  @ApiProperty({
    description: 'Current notification status',
    example: 'SENT',
  })
  status: string;

  @ApiProperty({
    description: 'When the notification was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Delivery attempts made',
    type: [DeliveryAttemptDto],
  })
  deliveryAttempts: DeliveryAttemptDto[];
}

export class BatchNotificationResponseDto {
  @ApiProperty({
    description: 'Number of notifications successfully queued',
    example: 2,
  })
  queuedCount: number;

  @ApiProperty({
    description: 'Array of notification IDs created',
    example: [
      '456e7890-e89b-12d3-a456-426614174001',
      '456e7890-e89b-12d3-a456-426614174002',
    ],
    type: [String],
  })
  notificationIds: string[];

  @ApiProperty({
    description: 'When the batch was queued',
    example: '2024-01-15T10:30:00Z',
  })
  queuedAt: Date;

  @ApiProperty({
    description: 'Number of notifications that failed to queue',
    example: 0,
    required: false,
  })
  failedCount?: number;

  @ApiProperty({
    description: 'Error details for failed notifications',
    required: false,
  })
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

export class SendNotificationResponseDto {
  @ApiProperty({
    description: 'Unique notification identifier',
    example: '456e7890-e89b-12d3-a456-426614174001',
  })
  notificationId: string;

  @ApiProperty({
    description: 'Current notification status',
    example: 'QUEUED',
  })
  status: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Notification queued successfully',
  })
  message: string;

  @ApiProperty({
    description: 'When the notification was queued',
    example: '2024-01-15T10:30:00Z',
  })
  queuedAt: Date;
}
