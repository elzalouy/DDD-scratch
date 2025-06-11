import { User } from '../entities/user.entity';
import { UserId } from '../../shared/value-objects/base-id.vo';
import { Email } from '../../shared/value-objects/email.vo';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByIds(ids: UserId[]): Promise<User[]>;
  exists(id: UserId): Promise<boolean>;
  existsByEmail(email: Email): Promise<boolean>;
  delete(id: UserId): Promise<void>;
}

export const USER_REPOSITORY_TOKEN = Symbol('USER_REPOSITORY'); 