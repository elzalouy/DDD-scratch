export interface UserProfileData {
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}

export class UserProfile {
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _phone?: string;
  private readonly _bio?: string;
  private readonly _avatarUrl?: string;

  constructor(data: UserProfileData) {
    this.validateFirstName(data.firstName);
    this.validateLastName(data.lastName);
    if (data.phone) this.validatePhone(data.phone);
    if (data.bio) this.validateBio(data.bio);

    this._firstName = data.firstName.trim();
    this._lastName = data.lastName.trim();
    this._phone = data.phone?.trim();
    this._bio = data.bio?.trim();
    this._avatarUrl = data.avatarUrl?.trim();
  }

  public get firstName(): string {
    return this._firstName;
  }

  public get lastName(): string {
    return this._lastName;
  }

  public get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  public get phone(): string | undefined {
    return this._phone;
  }

  public get bio(): string | undefined {
    return this._bio;
  }

  public get avatarUrl(): string | undefined {
    return this._avatarUrl;
  }

  private validateFirstName(firstName: string): void {
    if (!firstName || firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (firstName.length > 50) {
      throw new Error('First name cannot exceed 50 characters');
    }
  }

  private validateLastName(lastName: string): void {
    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
    if (lastName.length > 50) {
      throw new Error('Last name cannot exceed 50 characters');
    }
  }

  private validatePhone(phone: string): void {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Invalid phone number format');
    }
  }

  private validateBio(bio: string): void {
    if (bio.length > 500) {
      throw new Error('Bio cannot exceed 500 characters');
    }
  }

  public updateProfile(data: Partial<UserProfileData>): UserProfile {
    return new UserProfile({
      firstName: data.firstName ?? this._firstName,
      lastName: data.lastName ?? this._lastName,
      phone: data.phone ?? this._phone,
      bio: data.bio ?? this._bio,
      avatarUrl: data.avatarUrl ?? this._avatarUrl,
    });
  }

  static create(data: UserProfileData): UserProfile {
    return new UserProfile(data);
  }
} 