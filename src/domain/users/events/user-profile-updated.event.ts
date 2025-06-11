import { DomainEvent } from '../../shared/entities/base-entity';
import { UserProfile } from '../value-objects/user-profile.vo';

export class UserProfileUpdatedEvent implements DomainEvent {
  public readonly eventName = 'user.profile.updated';
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly oldProfile: UserProfile,
    public readonly newProfile: UserProfile,
  ) {
    this.occurredOn = new Date();
  }
} 