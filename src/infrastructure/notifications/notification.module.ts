import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

// Infrastructure
import { FirebaseConfig } from './firebase/firebase.config';
import { FirestoreNotificationRepository } from './firebase/firestore-notification.repository';
import { PubSubMessagePublisher } from './pubsub/pubsub-message-publisher';

// Application Layer
import { SendNotificationHandler } from '../../application/notifications/commands/send-notification/send-notification.handler';

// Domain Services
import { NotificationTemplateService } from '../../domain/notifications/services/notification-template.service';

@Module({
  imports: [CqrsModule, ConfigModule],
  providers: [
    // Infrastructure
    FirebaseConfig,
    {
      provide: 'INotificationRepository',
      useClass: FirestoreNotificationRepository,
    },
    {
      provide: 'IPubSubMessagePublisher',
      useClass: PubSubMessagePublisher,
    },

    // Application Handlers
    SendNotificationHandler,

    // Domain Services
    NotificationTemplateService,
  ],
  exports: [
    'INotificationRepository',
    'IPubSubMessagePublisher',
    FirebaseConfig,
    NotificationTemplateService,
  ],
})
export class NotificationModule {
  constructor(private readonly pubSubPublisher: PubSubMessagePublisher) {
    // Initialize topics on module load
    this.initializeTopics();
  }

  private async initializeTopics(): Promise<void> {
    try {
      await this.pubSubPublisher.initializeTopics();
    } catch (error) {
      console.error('Failed to initialize notification topics:', error);
    }
  }
}
