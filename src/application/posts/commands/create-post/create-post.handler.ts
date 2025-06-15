import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreatePostCommand } from './create-post.command';
import { Post } from '../../../../domain/posts/entities/post.entity';
import {
  UserId,
  CategoryId,
  LocationId,
} from '../../../../domain/shared/value-objects/base-id.vo';
import { Price } from '../../../../domain/posts/value-objects/price.vo';
import {
  IPostRepository,
  POST_REPOSITORY_TOKEN,
} from '../../../../domain/posts/repositories/post.repository.interface';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject(POST_REPOSITORY_TOKEN)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const {
      title,
      description,
      type,
      userId,
      categoryId,
      locationId,
      price,
      images = [],
      metadata = {},
    } = command;

    // Create value objects
    const userIdVO = UserId.create(userId);
    const categoryIdVO = CategoryId.create(categoryId);
    const locationIdVO = LocationId.create(locationId);
    const priceVO = price ? Price.create(price.amount, price.currency) : undefined;

    // Create post aggregate
    const post = Post.create(
      title,
      description,
      type,
      userIdVO,
      categoryIdVO,
      locationIdVO,
      priceVO,
      images,
      metadata,
    );

    // Publish the post (adds domain event)
    post.publish();

    // Save to repository
    await this.postRepository.save(post);

    return post.id.value;
  }
} 