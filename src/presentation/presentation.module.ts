import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { PostsController } from './rest/posts/controllers/posts.controller';

// Controllers will be imported here

@Module({
  imports: [
    ApplicationModule, // Presentation layer depends on application
  ],
  controllers: [
    PostsController,
    // REST controllers will be added here
  ],
  providers: [
    // Presentation-specific services (if any)
  ],
})
export class PresentationModule {} 