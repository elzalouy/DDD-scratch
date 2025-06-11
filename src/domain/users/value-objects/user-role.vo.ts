export enum UserRoleType {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export class UserRole {
  private readonly _role: UserRoleType;

  constructor(role: UserRoleType) {
    this._role = role;
  }

  public get role(): UserRoleType {
    return this._role;
  }

  public isUser(): boolean {
    return this._role === UserRoleType.USER;
  }

  public isModerator(): boolean {
    return this._role === UserRoleType.MODERATOR;
  }

  public isAdmin(): boolean {
    return this._role === UserRoleType.ADMIN;
  }

  public canModerate(): boolean {
    return this.isModerator() || this.isAdmin();
  }

  public canAdminister(): boolean {
    return this.isAdmin();
  }

  public hasPermission(requiredRole: UserRoleType): boolean {
    const hierarchy = {
      [UserRoleType.USER]: 1,
      [UserRoleType.MODERATOR]: 2,
      [UserRoleType.ADMIN]: 3,
    };

    return hierarchy[this._role] >= hierarchy[requiredRole];
  }

  public equals(other: UserRole): boolean {
    return this._role === other._role;
  }

  public toString(): string {
    return this._role;
  }

  static user(): UserRole {
    return new UserRole(UserRoleType.USER);
  }

  static moderator(): UserRole {
    return new UserRole(UserRoleType.MODERATOR);
  }

  static admin(): UserRole {
    return new UserRole(UserRoleType.ADMIN);
  }

  static create(role: UserRoleType): UserRole {
    return new UserRole(role);
  }
} 