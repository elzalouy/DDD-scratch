export enum PostStatusType {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  DELETED = 'deleted',
}

export class PostStatus {
  private readonly _status: PostStatusType;
  private readonly _reason?: string;
  private readonly _timestamp: Date;

  constructor(status: PostStatusType, reason?: string) {
    this._status = status;
    this._reason = reason;
    this._timestamp = new Date();
  }

  public get status(): PostStatusType {
    return this._status;
  }

  public get reason(): string | undefined {
    return this._reason;
  }

  public get timestamp(): Date {
    return this._timestamp;
  }

  public isDraft(): boolean {
    return this._status === PostStatusType.DRAFT;
  }

  public isPending(): boolean {
    return this._status === PostStatusType.PENDING;
  }

  public isApproved(): boolean {
    return this._status === PostStatusType.APPROVED;
  }

  public isRejected(): boolean {
    return this._status === PostStatusType.REJECTED;
  }

  public isExpired(): boolean {
    return this._status === PostStatusType.EXPIRED;
  }

  public isDeleted(): boolean {
    return this._status === PostStatusType.DELETED;
  }

  public isVisible(): boolean {
    return this.isApproved() && !this.isExpired() && !this.isDeleted();
  }

  public canBeApproved(): boolean {
    return this.isPending();
  }

  public canBeRejected(): boolean {
    return this.isPending() || this.isApproved();
  }

  public canBeDeleted(): boolean {
    return !this.isDeleted();
  }

  public canBeEdited(): boolean {
    return this.isDraft() || this.isRejected();
  }

  public canBePublished(): boolean {
    return this.isDraft();
  }

  public equals(other: PostStatus): boolean {
    return this._status === other._status;
  }

  public toString(): string {
    return this._status;
  }

  public toJSON(): { status: PostStatusType; reason?: string; timestamp: Date } {
    return {
      status: this._status,
      reason: this._reason,
      timestamp: this._timestamp,
    };
  }

  // Factory methods for creating different statuses
  public static draft(): PostStatus {
    return new PostStatus(PostStatusType.DRAFT);
  }

  public static pending(): PostStatus {
    return new PostStatus(PostStatusType.PENDING);
  }

  public static approved(): PostStatus {
    return new PostStatus(PostStatusType.APPROVED);
  }

  public static rejected(reason: string): PostStatus {
    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }
    return new PostStatus(PostStatusType.REJECTED, reason);
  }

  public static expired(): PostStatus {
    return new PostStatus(PostStatusType.EXPIRED);
  }

  public static deleted(): PostStatus {
    return new PostStatus(PostStatusType.DELETED);
  }

  // Status transition methods
  public approve(): PostStatus {
    if (!this.canBeApproved()) {
      throw new Error(`Cannot approve post with status: ${this._status}`);
    }
    return PostStatus.approved();
  }

  public reject(reason: string): PostStatus {
    if (!this.canBeRejected()) {
      throw new Error(`Cannot reject post with status: ${this._status}`);
    }
    return PostStatus.rejected(reason);
  }

  public delete(): PostStatus {
    if (!this.canBeDeleted()) {
      throw new Error(`Cannot delete post with status: ${this._status}`);
    }
    return PostStatus.deleted();
  }

  public publish(): PostStatus {
    if (!this.canBePublished()) {
      throw new Error(`Cannot publish post with status: ${this._status}`);
    }
    return PostStatus.pending();
  }

  public expire(): PostStatus {
    if (!this.isApproved()) {
      throw new Error(`Cannot expire post with status: ${this._status}`);
    }
    return PostStatus.expired();
  }
} 