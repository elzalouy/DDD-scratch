import { DomainEvent } from '../../shared/interfaces/domain-event.interface';
import { PostType } from '../entities/post.entity';

export class PostCreatedEvent implements DomainEvent {
  public readonly eventName = 'post.created';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;

  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly type: PostType,
  ) {
    this.aggregateId = postId;
    this.occurredOn = new Date();
  }
} 