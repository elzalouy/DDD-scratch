import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { NotificationResponseDto } from './notification-response.dto';

export class GetNotificationHistoryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Filter by recipient user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  recipientId?: string;

  @ApiProperty({
    description: 'Filter by notification status',
    example: 'SENT',
    enum: [
      'PENDING',
      'SCHEDULED',
      'PROCESSING',
      'SENT',
      'FAILED',
      'RETRY',
      'EXPIRED',
      'CANCELLED',
    ],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'PENDING',
    'SCHEDULED',
    'PROCESSING',
    'SENT',
    'FAILED',
    'RETRY',
    'EXPIRED',
    'CANCELLED',
  ])
  status?: string;

  @ApiProperty({
    description: 'Filter by notification type',
    example: 'POST_APPROVED',
    enum: [
      'POST_CREATED',
      'POST_APPROVED',
      'POST_REJECTED',
      'POST_EXPIRED',
      'USER_WELCOME',
      'USER_VERIFICATION',
      'PASSWORD_RESET',
      'SYSTEM_MAINTENANCE',
      'PROMOTIONAL',
      'SECURITY_ALERT',
    ],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'POST_CREATED',
    'POST_APPROVED',
    'POST_REJECTED',
    'POST_EXPIRED',
    'USER_WELCOME',
    'USER_VERIFICATION',
    'PASSWORD_RESET',
    'SYSTEM_MAINTENANCE',
    'PROMOTIONAL',
    'SECURITY_ALERT',
  ])
  type?: string;

  @ApiProperty({
    description: 'Filter by delivery channel',
    example: 'EMAIL',
    enum: ['EMAIL', 'SMS', 'PUSH', 'WEBHOOK', 'IN_APP'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['EMAIL', 'SMS', 'PUSH', 'WEBHOOK', 'IN_APP'])
  channel?: string;

  @ApiProperty({
    description: 'Filter by priority level',
    example: 'HIGH',
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'])
  priority?: string;

  @ApiProperty({
    description:
      'Filter notifications created from this date (ISO 8601 format)',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description:
      'Filter notifications created until this date (ISO 8601 format)',
    example: '2024-01-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Sort field',
    example: 'createdAt',
    enum: ['createdAt', 'sentAt', 'priority', 'status'],
    default: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'sentAt', 'priority', 'status'])
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: string = 'desc';

  @ApiProperty({
    description: 'Include delivery attempts in response',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  includeAttempts?: boolean = false;

  @ApiProperty({
    description: 'Search term for title or message content',
    example: 'approval',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class NotificationHistoryResponseDto {
  @ApiProperty({
    description: 'Array of notifications',
    type: [NotificationResponseDto],
  })
  notifications: NotificationResponseDto[];

  @ApiProperty({
    description: 'Total number of notifications matching the filter',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrevious: boolean;
}

export class GetNotificationAnalyticsDto {
  @ApiProperty({
    description: 'Start date for analytics (ISO 8601 format)',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for analytics (ISO 8601 format)',
    example: '2024-01-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Group analytics by time period',
    example: 'day',
    enum: ['hour', 'day', 'week', 'month'],
    default: 'day',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['hour', 'day', 'week', 'month'])
  groupBy?: string = 'day';

  @ApiProperty({
    description: 'Filter by notification type',
    example: 'POST_APPROVED',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'Filter by delivery channel',
    example: 'EMAIL',
    required: false,
  })
  @IsOptional()
  @IsString()
  channel?: string;
}

export class NotificationAnalyticsResponseDto {
  @ApiProperty({
    description: 'Total number of notifications in the period',
    example: 1250,
  })
  totalNotifications: number;

  @ApiProperty({
    description: 'Success rate percentage',
    example: 98.5,
  })
  successRate: number;

  @ApiProperty({
    description: 'Average delivery time in seconds',
    example: 2.3,
  })
  averageDeliveryTime: number;

  @ApiProperty({
    description: 'Breakdown by delivery channel',
    example: {
      EMAIL: 650,
      PUSH: 400,
      SMS: 150,
      IN_APP: 50,
    },
  })
  channelBreakdown: Record<string, number>;

  @ApiProperty({
    description: 'Breakdown by notification type',
    example: {
      POST_APPROVED: 400,
      USER_WELCOME: 300,
      POST_CREATED: 250,
      SECURITY_ALERT: 150,
      PROMOTIONAL: 150,
    },
  })
  typeBreakdown: Record<string, number>;

  @ApiProperty({
    description: 'Breakdown by status',
    example: {
      SENT: 1231,
      FAILED: 19,
    },
  })
  statusBreakdown: Record<string, number>;

  @ApiProperty({
    description: 'Timeline data grouped by the specified period',
    example: [
      {
        date: '2024-01-15',
        sent: 125,
        failed: 2,
      },
    ],
  })
  timeline: Array<{
    date: string;
    sent: number;
    failed: number;
    [key: string]: any;
  }>;
}
