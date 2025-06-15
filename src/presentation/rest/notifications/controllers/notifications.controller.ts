import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Commands
import { SendNotificationCommand } from '../../../../application/notifications/commands/send-notification/send-notification.command';

// DTOs
import { NotificationResponseDto } from '../dto/notification-response.dto';

// Guards
import { JwtAuthGuard } from '@app/infrastructure/common/guards/jwt-auth.guard';
import { RolesGuard } from '@app/infrastructure/common/guards/roles.guard';
import { Roles } from '@app/infrastructure/common/decorators/roles.decorator';
import { Role } from '@app/infrastructure/common/guards/roles.guard';
import { GetNotificationHistoryDto } from '../dto/get-notification-history.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.NOTIFICATION_MANAGER, Role.USER)
  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification queued successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async sendNotification(
    @Body() dto: SendNotificationCommand,
  ): Promise<NotificationResponseDto> {
    try {
      this.logger.log(`Sending notification to recipient: ${dto.recipientId}`);

      const command = new SendNotificationCommand(
        dto.recipientId,
        dto.type,
        dto.title,
        dto.message,
        dto.channels,
        dto.priority,
        dto.scheduledAt,
        dto.templateId,
        dto.templateVariables,
        dto.metadata,
        dto.expiresAt,
        dto.maxRetries,
      );

      const notificationId = await this.commandBus.execute(command);

      const response: any = {
        notificationId,
        status: 'QUEUED',
        message: 'Notification queued successfully',
        queuedAt: new Date(),
      };
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to send notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.NOTIFICATION_MANAGER)
  @ApiOperation({ summary: 'Send multiple notifications' })
  @ApiResponse({
    status: 201,
    description: 'Notifications queued successfully',
  })
  async sendBatchNotifications(
    @Body() dto: { notifications: SendNotificationCommand[] },
  ): Promise<{
    queuedCount: number;
    notificationIds: string[];
    queuedAt: Date;
  }> {
    try {
      this.logger.log(
        `Sending batch of ${dto.notifications.length} notifications`,
      );

      const commands = dto.notifications.map(
        (notif) =>
          new SendNotificationCommand(
            notif.recipientId,
            notif.type,
            notif.title,
            notif.message,
            notif.channels,
            notif.priority,
            notif.scheduledAt,
            notif.templateId,
            notif.templateVariables,
            notif.metadata,
            notif.expiresAt,
            notif.maxRetries,
          ),
      );

      const notificationIds = await Promise.all(
        commands.map((cmd) => this.commandBus.execute(cmd)),
      );

      return {
        queuedCount: notificationIds.length,
        notificationIds,
        queuedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to send batch notifications: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get(':id/status')
  @Roles(Role.ADMIN, Role.NOTIFICATION_MANAGER)
  @ApiOperation({ summary: 'Get notification status' })
  @ApiResponse({
    status: 200,
    description: 'Notification status retrieved',
  })
  async getNotificationStatus(@Param('id') notificationId: string): Promise<{
    notificationId: string;
    status: string;
    createdAt: Date;
    deliveryAttempts: any[];
  }> {
    // TODO: Implement GetNotificationStatusQuery
    return {
      notificationId,
      status: 'PENDING',
      createdAt: new Date(),
      deliveryAttempts: [],
    };
  }

  @Get('history')
  @Roles(Role.ADMIN, Role.NOTIFICATION_MANAGER)
  @ApiOperation({ summary: 'Get notification history' })
  @ApiResponse({
    status: 200,
    description: 'Notification history retrieved',
  })
  async getNotificationHistory(
    @Query() query: GetNotificationHistoryDto,
  ): Promise<{
    notifications: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    // TODO: Implement GetNotificationHistoryQuery
    return {
      notifications: [],
      total: 0,
      page: query.page || 1,
      limit: query.limit || 20,
    };
  }

  @Get('analytics')
  @Roles(Role.ADMIN, Role.NOTIFICATION_MANAGER)
  @ApiOperation({ summary: 'Get notification analytics' })
  @ApiResponse({
    status: 200,
    description: 'Notification analytics retrieved',
  })
  async getNotificationAnalytics(
    @Query() query: { startDate?: string; endDate?: string },
  ): Promise<{
    totalNotifications: number;
    successRate: number;
    channelBreakdown: Record<string, number>;
    typeBreakdown: Record<string, number>;
  }> {
    // TODO: Implement GetNotificationAnalyticsQuery
    return {
      totalNotifications: 0,
      successRate: 0,
      channelBreakdown: {},
      typeBreakdown: {},
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check notification system health' })
  @ApiResponse({
    status: 200,
    description: 'Health check result',
  })
  async healthCheck(): Promise<{
    status: string;
    timestamp: Date;
    services: Record<string, boolean>;
  }> {
    // TODO: Implement health checks for Firebase, Pub/Sub, etc.
    return {
      status: 'healthy',
      timestamp: new Date(),
      services: {
        firestore: true,
        pubsub: true,
        firebase: true,
      },
    };
  }
}
