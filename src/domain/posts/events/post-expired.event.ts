import { DomainEvent } from '../../shared/interfaces/domain-event.interface';

export class PostExpiredEvent implements DomainEvent {
  public readonly eventName = 'post.expired';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;

  constructor(
    public readonly postId: string,
    public readonly userId: string,
  ) {
    this.aggregateId = postId;
    this.occurredOn = new Date();
  }
} 