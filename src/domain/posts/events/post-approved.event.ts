import { DomainEvent } from '../../shared/interfaces/domain-event.interface';

export class PostApprovedEvent implements DomainEvent {
  public readonly eventName = 'post.approved';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;

  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly moderatorId: string,
  ) {
    this.aggregateId = postId;
    this.occurredOn = new Date();
  }
} 