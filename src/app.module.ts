import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Import DDD modules
import { DomainModule } from './domain/domain.module';
import { ApplicationModule } from './application/application.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { PresentationModule } from './presentation/presentation.module';

// Core controllers
import { AppController } from './app.controller';

@Module({
  imports: [
    // Configuration (global)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // DDD Layers (bottom-up dependency)
    DomainModule,         // Core business logic
    InfrastructureModule, // External concerns
    ApplicationModule,    // Use cases & orchestration
    PresentationModule,   // API layer
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
