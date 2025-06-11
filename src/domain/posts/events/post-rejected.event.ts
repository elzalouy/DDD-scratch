import { DomainEvent } from '../../shared/interfaces/domain-event.interface';

export class PostRejectedEvent implements DomainEvent {
  public readonly eventName = 'post.rejected';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;

  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly moderatorId: string,
    public readonly reason: string,
  ) {
    this.aggregateId = postId;
    this.occurredOn = new Date();
  }
} 