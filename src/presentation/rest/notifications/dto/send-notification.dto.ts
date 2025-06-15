import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsDate,
  IsObject,
  IsNumber,
  IsEnum,
  IsUUID,
  Length,
  ArrayNotEmpty,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum NotificationTypeEnum {
  POST_CREATED = 'POST_CREATED',
  POST_APPROVED = 'POST_APPROVED',
  POST_REJECTED = 'POST_REJECTED',
  POST_EXPIRED = 'POST_EXPIRED',
  USER_WELCOME = 'USER_WELCOME',
  USER_VERIFICATION = 'USER_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  PROMOTIONAL = 'PROMOTIONAL',
  SECURITY_ALERT = 'SECURITY_ALERT',
}

export enum NotificationPriorityEnum {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export enum DeliveryChannelEnum {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  WEBHOOK = 'WEBHOOK',
  IN_APP = 'IN_APP',
}

export class SendNotificationDto {
  @ApiProperty({
    description: 'Recipient user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  recipientId: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationTypeEnum,
    example: NotificationTypeEnum.POST_CREATED,
  })
  @IsNotEmpty()
  @IsEnum(NotificationTypeEnum)
  type: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Your post has been approved!',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  title: string;

  @ApiProperty({
    description: 'Notification message content',
    example:
      'Your classified ad "Vintage Camera" has been approved and is now live.',
    maxLength: 2000,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 2000)
  message: string;

  @ApiProperty({
    description: 'Delivery channels to use',
    enum: DeliveryChannelEnum,
    isArray: true,
    example: [DeliveryChannelEnum.EMAIL, DeliveryChannelEnum.PUSH],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(DeliveryChannelEnum, { each: true })
  channels: string[];

  @ApiProperty({
    description: 'Notification priority',
    enum: NotificationPriorityEnum,
    example: NotificationPriorityEnum.NORMAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationPriorityEnum)
  priority?: string = NotificationPriorityEnum.NORMAL;

  @ApiProperty({
    description: 'Schedule notification for future delivery',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;

  @ApiProperty({
    description: 'Template ID for dynamic content',
    example: 'post-approval-template',
    required: false,
  })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({
    description: 'Variables for template rendering',
    example: {
      postTitle: 'Vintage Camera',
      username: 'john_doe',
      expiryDate: '2024-01-31',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  templateVariables?: Record<string, any>;

  @ApiProperty({
    description: 'Additional metadata',
    example: {
      source: 'web',
      campaign: 'user-onboarding',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Notification expiry date',
    example: '2024-02-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;

  @ApiProperty({
    description: 'Maximum retry attempts',
    example: 3,
    minimum: 1,
    maximum: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxRetries?: number;
}

export class BatchNotificationDto {
  @ApiProperty({
    description: 'Array of notifications to send',
    type: [SendNotificationDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SendNotificationDto)
  notifications: SendNotificationDto[];
}
