import { PostType } from '@app/domain/posts/entities/post.entity';

export class CreatePostCommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly type: PostType,
    public readonly userId: string,
    public readonly categoryId: string,
    public readonly locationId: string,
    public readonly price?: { amount: number; currency: string },
    public readonly images?: Array<{ url: string; caption?: string; order: number }>,
    public readonly metadata?: Record<string, any>,
  ) {}
}