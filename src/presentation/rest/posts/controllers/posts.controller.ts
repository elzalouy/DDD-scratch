import { Controller, Post, Body, HttpStatus, HttpCode, Request, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreatePostDto } from '../dto/create-post.dto';
import { CreatePostCommand } from '@app/application/posts/commands/create-post/create-post.command';
import { JwtAuthGuard } from '@app/infrastructure/auth/guards/jwt-auth.guard';
import { ValidationPipe } from '@nestjs/common';

@ApiTags('Posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'The ID of the created post',
        },
        message: {
          type: 'string',
          description: 'Success message',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req: any,
  ): Promise<{ id: string; message: string }> {
    const userId = req.user.sub; // Extracted from JWT token

    const command = new CreatePostCommand(
      createPostDto.title,
      createPostDto.description,
      createPostDto.type,
      userId,
      createPostDto.categoryId,
      createPostDto.locationId,
      createPostDto.price,
      createPostDto.images,
      createPostDto.metadata,
    );

    const postId = await this.commandBus.execute(command);

    return {
      id: postId,
      message: 'Post created successfully and is pending approval',
    };
  }
} 