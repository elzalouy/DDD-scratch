import { BaseEntity } from '../../shared/entities/base-entity';
import { PostId, UserId, CategoryId, LocationId } from '../../shared/value-objects/base-id.vo';
import { Price } from '../value-objects/price.vo';
import { PostStatus } from '../value-objects/post-status.vo';
import { PostContent } from '../value-objects/post-content.vo';
import { PostCreatedEvent } from '../events/post-created.event';
import { PostApprovedEvent } from '../events/post-approved.event';
import { PostRejectedEvent } from '../events/post-rejected.event';
import { PostExpiredEvent } from '../events/post-expired.event';

export enum PostType {
  SELL = 'sell',
  BUY = 'buy',
  RENT = 'rent',
  SERVICE = 'service',
  JOB = 'job',
}

export interface PostImage {
  url: string;
  caption?: string;
  order: number;
}

export class Post extends BaseEntity<PostId> {
  private _content: PostContent;
  private _type: PostType;
  private _price: Price | null;
  private _images: PostImage[];
  private _status: PostStatus;
  private _userId: UserId;
  private _categoryId: CategoryId;
  private _locationId: LocationId;
  private _viewCount: number;
  private _expiresAt: Date | null;
  private _metadata: Record<string, any>;

  constructor(
    id: PostId,
    content: PostContent,
    type: PostType,
    userId: UserId,
    categoryId: CategoryId,
    locationId: LocationId,
    price?: Price,
    images: PostImage[] = [],
    metadata: Record<string, any> = {},
  ) {
    super(id);
    this._content = content;
    this._type = type;
    this._price = price || null;
    this._images = images;
    this._status = PostStatus.draft();
    this._userId = userId;
    this._categoryId = categoryId;
    this._locationId = locationId;
    this._viewCount = 0;
    this._expiresAt = null;
    this._metadata = metadata;
  }

  // Getters
  public get content(): PostContent {
    return this._content;
  }

  public get title(): string {
    return this._content.title;
  }

  public get description(): string {
    return this._content.description;
  }

  public get type(): PostType {
    return this._type;
  }

  public get price(): Price | null {
    return this._price;
  }

  public get images(): PostImage[] {
    return [...this._images];
  }

  public get status(): PostStatus {
    return this._status;
  }

  public get userId(): UserId {
    return this._userId;
  }

  public get categoryId(): CategoryId {
    return this._categoryId;
  }

  public get locationId(): LocationId {
    return this._locationId;
  }

  public get viewCount(): number {
    return this._viewCount;
  }

  public get expiresAt(): Date | null {
    return this._expiresAt;
  }

  public get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  // Business methods
  public publish(): void {
    if (!this._status.canBePublished()) {
      throw new Error('Post cannot be published in its current state');
    }

    this._status = this._status.publish();
    this.touch();
    
    this.addDomainEvent(new PostCreatedEvent(
      this._id.value,
      this._userId.value,
      this._content.title,
      this._type,
    ));
  }

  public approve(moderatorId: UserId): void {
    if (!this._status.canBeApproved()) {
      throw new Error('Post cannot be approved in its current state');
    }

    this._status = this._status.approve();
    this.setExpirationDate();
    this.touch();
    
    this.addDomainEvent(new PostApprovedEvent(
      this._id.value,
      this._userId.value,
      moderatorId.value,
    ));
  }

  public reject(reason: string, moderatorId: UserId): void {
    if (!this._status.canBeRejected()) {
      throw new Error('Post cannot be rejected in its current state');
    }

    this._status = this._status.reject(reason);
    this.touch();
    
    this.addDomainEvent(new PostRejectedEvent(
      this._id.value,
      this._userId.value,
      moderatorId.value,
      reason,
    ));
  }

  public expire(): void {
    if (!this._status.isApproved()) {
      throw new Error('Only approved posts can expire');
    }

    this._status = this._status.expire();
    this.touch();
    
    this.addDomainEvent(new PostExpiredEvent(
      this._id.value,
      this._userId.value,
    ));
  }

  public delete(): void {
    if (!this._status.canBeDeleted()) {
      throw new Error('Post cannot be deleted in its current state');
    }

    this._status = this._status.delete();
    this.touch();
  }

  public updateContent(content: PostContent, price?: Price): void {
    if (!this._status.canBeEdited()) {
      throw new Error('Post cannot be edited in its current state');
    }

    this._content = content;
    this._price = price || null;
    this.touch();
  }

  public addImage(image: PostImage): void {
    if (this._images.length >= 10) {
      throw new Error('Maximum 10 images allowed per post');
    }

    this._images.push(image);
    this.touch();
  }

  public removeImage(imageUrl: string): void {
    this._images = this._images.filter(img => img.url !== imageUrl);
    this.touch();
  }

  public incrementViewCount(): void {
    this._viewCount++;
    this.touch();
  }

  public isVisible(): boolean {
    return this._status.isVisible() && (this._expiresAt === null || this._expiresAt > new Date());
  }

  public isOwnedBy(userId: UserId): boolean {
    return this._userId.equals(userId);
  }

  public hasExpired(): boolean {
    return this._expiresAt !== null && this._expiresAt <= new Date();
  }

  public updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this.touch();
  }

  // Private methods
  private setExpirationDate(): void {
    // Posts expire after 30 days by default
    const expirationDays = 30;
    this._expiresAt = new Date();
    this._expiresAt.setDate(this._expiresAt.getDate() + expirationDays);
  }

  // Factory method
  public static create(
    title: string,
    description: string,
    type: PostType,
    userId: UserId,
    categoryId: CategoryId,
    locationId: LocationId,
    price?: Price,
    images: PostImage[] = [],
    metadata: Record<string, any> = {},
  ): Post {
    const id = PostId.create();
    const content = PostContent.create(title, description);
    
    const post = new Post(
      id,
      content,
      type,
      userId,
      categoryId,
      locationId,
      price,
      images,
      metadata,
    );
    
    return post;
  }

  // Reconstruction from persistence
  public static reconstitute(
    id: string,
    title: string,
    description: string,
    type: PostType,
    userId: string,
    categoryId: string,
    locationId: string,
    status: string,
    statusReason: string | undefined,
    viewCount: number,
    createdAt: Date,
    updatedAt: Date,
    expiresAt: Date | null,
    price?: { amount: number; currency: string },
    images: PostImage[] = [],
    metadata: Record<string, any> = {},
  ): Post {
    const postId = PostId.create(id);
    const content = PostContent.create(title, description);
    const postUserId = UserId.create(userId);
    const postCategoryId = CategoryId.create(categoryId);
    const postLocationId = LocationId.create(locationId);
    const postPrice = price ? Price.create(price.amount, price.currency) : null;

    const post = new Post(
      postId,
      content,
      type,
      postUserId,
      postCategoryId,
      postLocationId,
      postPrice,
      images,
      metadata,
    );

    // Set state from persistence
    (post as any)._createdAt = createdAt;
    (post as any)._updatedAt = updatedAt;
    post._viewCount = viewCount;
    post._expiresAt = expiresAt;
    
    // Reconstruct status
    if (statusReason) {
      post._status = PostStatus.rejected(statusReason);
    } else {
      switch (status) {
        case 'draft':
          post._status = PostStatus.draft();
          break;
        case 'pending':
          post._status = PostStatus.pending();
          break;
        case 'approved':
          post._status = PostStatus.approved();
          break;
        case 'expired':
          post._status = PostStatus.expired();
          break;
        case 'deleted':
          post._status = PostStatus.deleted();
          break;
        default:
          post._status = PostStatus.draft();
      }
    }

    return post;
  }
} 