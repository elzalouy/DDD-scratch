import { DomainEvent } from '../../shared/entities/base-entity';

export class UserRegisteredEvent implements DomainEvent {
  public readonly eventName = 'user.registered';
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly fullName: string,
  ) {
    this.occurredOn = new Date();
  }
} 