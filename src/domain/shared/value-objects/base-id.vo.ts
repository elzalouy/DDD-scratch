import { v4 as uuidv4, validate } from 'uuid';

export abstract class BaseId {
  protected readonly _value: string;

  constructor(value?: string) {
    if (value) {
      if (!this.isValid(value)) {
        throw new Error(`Invalid ID format: ${value}`);
      }
      this._value = value;
    } else {
      this._value = uuidv4();
    }
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: BaseId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  private isValid(value: string): boolean {
    return validate(value);
  }
}

// Specific ID types for type safety
export class PostId extends BaseId {
  static create(value?: string): PostId {
    return new PostId(value);
  }
}

export class UserId extends BaseId {
  static create(value?: string): UserId {
    return new UserId(value);
  }
}

export class CategoryId extends BaseId {
  static create(value?: string): CategoryId {
    return new CategoryId(value);
  }
}

export class LocationId extends BaseId {
  static create(value?: string): LocationId {
    return new LocationId(value);
  }
}