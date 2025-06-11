import { BaseEntity } from '../../shared/entities/base-entity';
import { UserId } from '../../shared/value-objects/base-id.vo';
import { Email } from '../../shared/value-objects/email.vo';
import { UserProfile, UserProfileData } from '../value-objects/user-profile.vo';
import { UserRole, UserRoleType } from '../value-objects/user-role.vo';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { UserProfileUpdatedEvent } from '../events/user-profile-updated.event';
import { UserRoleChangedEvent } from '../events/user-role-changed.event';

export class User extends BaseEntity<UserId> {
  private _email: Email;
  private _profile: UserProfile;
  private _role: UserRole;
  private _isActive: boolean;
  private _lastLoginAt?: Date;
  private _emailVerifiedAt?: Date;

  constructor(
    id: UserId,
    email: Email,
    profile: UserProfile,
    role: UserRole = UserRole.user(),
    isActive: boolean = true,
  ) {
    super(id);
    this._email = email;
    this._profile = profile;
    this._role = role;
    this._isActive = isActive;
  }

  // Getters
  public get email(): Email {
    return this._email;
  }

  public get profile(): UserProfile {
    return this._profile;
  }

  public get role(): UserRole {
    return this._role;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  public get emailVerifiedAt(): Date | undefined {
    return this._emailVerifiedAt;
  }

  public get isEmailVerified(): boolean {
    return this._emailVerifiedAt !== undefined;
  }

  public get fullName(): string {
    return this._profile.fullName;
  }

  // Business methods
  public updateProfile(profileData: Partial<UserProfileData>): void {
    const oldProfile = this._profile;
    this._profile = this._profile.updateProfile(profileData);
    this.touch();

    this.addDomainEvent(new UserProfileUpdatedEvent(
      this._id.value,
      oldProfile,
      this._profile,
    ));
  }

  public changeRole(newRole: UserRoleType, changedBy: UserId): void {
    if (this._role.role === newRole) {
      return; // No change needed
    }

    const oldRole = this._role;
    this._role = UserRole.create(newRole);
    this.touch();

    this.addDomainEvent(new UserRoleChangedEvent(
      this._id.value,
      oldRole.role,
      newRole,
      changedBy.value,
    ));
  }

  public activate(): void {
    if (this._isActive) {
      return;
    }

    this._isActive = true;
    this.touch();
  }

  public deactivate(): void {
    if (!this._isActive) {
      return;
    }

    this._isActive = false;
    this.touch();
  }

  public recordLogin(): void {
    this._lastLoginAt = new Date();
    this.touch();
  }

  public verifyEmail(): void {
    if (this.isEmailVerified) {
      return;
    }

    this._emailVerifiedAt = new Date();
    this.touch();
  }

  public canModerate(): boolean {
    return this._isActive && this._role.canModerate();
  }

  public canAdminister(): boolean {
    return this._isActive && this._role.canAdminister();
  }

  public hasPermission(requiredRole: UserRoleType): boolean {
    return this._isActive && this._role.hasPermission(requiredRole);
  }

  // Factory method
  public static create(
    email: Email,
    profileData: UserProfileData,
    role: UserRoleType = UserRoleType.USER,
  ): User {
    const id = UserId.create();
    const profile = UserProfile.create(profileData);
    const userRole = UserRole.create(role);

    const user = new User(id, email, profile, userRole);

    user.addDomainEvent(new UserRegisteredEvent(
      id.value,
      email.value,
      profile.fullName,
    ));

    return user;
  }

  // Reconstruction from persistence
  public static reconstitute(
    id: string,
    email: string,
    profileData: UserProfileData,
    role: UserRoleType,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
    lastLoginAt?: Date,
    emailVerifiedAt?: Date,
  ): User {
    const userId = UserId.create(id);
    const userEmail = Email.create(email);
    const userProfile = UserProfile.create(profileData);
    const userRole = UserRole.create(role);

    const user = new User(userId, userEmail, userProfile, userRole, isActive);
    
    // Set dates from persistence
    (user as any)._createdAt = createdAt;
    (user as any)._updatedAt = updatedAt;
    user._lastLoginAt = lastLoginAt;
    user._emailVerifiedAt = emailVerifiedAt;

    return user;
  }
} 