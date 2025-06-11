import { DomainEvent } from '../../shared/entities/base-entity';
import { UserRoleType } from '../value-objects/user-role.vo';

export class UserRoleChangedEvent implements DomainEvent {
  public readonly eventName = 'user.role.changed';
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly oldRole: UserRoleType,
    public readonly newRole: UserRoleType,
    public readonly changedBy: string,
  ) {
    this.occurredOn = new Date();
  }
} 