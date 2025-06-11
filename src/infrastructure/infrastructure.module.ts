import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { I18nModule } from 'nestjs-i18n';
import { ScheduleModule } from '@nestjs/schedule';

// Configuration
import { getDatabaseConfig } from './config/database.config';
import { i18nConfig } from './config/i18n.config';

// Domain and Infrastructure
import { PostTypeormEntity } from './persistence/typeorm/entities/post.typeorm-entity';
import { PostRepository } from './persistence/typeorm/repositories/post.repository';
import { POST_REPOSITORY_TOKEN } from '@app/domain/posts/repositories/post.repository.interface';

@Module({
  imports: [
    // Database
    TypeOrmModule.forRootAsync({
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // TypeORM Feature modules for entities
    TypeOrmModule.forFeature([PostTypeormEntity]),

    // Authentication
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),

    // Queue system for notifications
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Internationalization
    I18nModule.forRoot(i18nConfig),

    // Task scheduling
    ScheduleModule.forRoot(),
  ],
  providers: [
    // Repository implementations
    {
      provide: POST_REPOSITORY_TOKEN,
      useClass: PostRepository,
    },
    // Authentication strategies will be added
  ],
  exports: [
    // Export infrastructure services that application layer needs
    POST_REPOSITORY_TOKEN,
  ],
})
export class InfrastructureModule {} 