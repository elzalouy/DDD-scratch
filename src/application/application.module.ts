import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { CreatePostHandler } from './posts/commands/create-post/create-post.handler';

// Command handlers, query handlers, and application services
const CommandHandlers = [CreatePostHandler];
const QueryHandlers = [];
const EventHandlers = [];

@Module({
  imports: [
    CqrsModule,
    InfrastructureModule, // Application layer depends on infrastructure
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [
    // Export CQRS module for controllers
    CqrsModule,
    // Export handlers that presentation layer might need
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
})
export class ApplicationModule {} 