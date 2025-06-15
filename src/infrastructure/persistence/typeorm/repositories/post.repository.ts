import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post } from '../../../../domain/posts/entities/post.entity';
import {
  PostId,
  UserId,
  CategoryId,
  LocationId,
} from '../../../../domain/shared/value-objects/base-id.vo';
import {
  IPostRepository,
  PostSearchFilters,
  PostSearchResult,
} from '../../../../domain/posts/repositories/post.repository.interface';
import { PostTypeormEntity } from '../entities/post.typeorm-entity';

@Injectable()
export class PostRepository implements IPostRepository {
  constructor(
    @InjectRepository(PostTypeormEntity)
    private readonly repository: Repository<PostTypeormEntity>,
  ) {}

  async save(post: Post): Promise<void> {
    const entity = this.toTypeormEntity(post);
    await this.repository.save(entity);
  }

  async findById(id: PostId): Promise<Post | null> {
    const entity = await this.repository.findOne({
      where: { id: id.value },
    });

    return entity ? this.toDomainEntity(entity) : null;
  }

  async findByUserId(userId: UserId): Promise<Post[]> {
    const entities = await this.repository.find({
      where: { userId: userId.value },
      order: { createdAt: 'DESC' },
    });

    return entities.map(entity => this.toDomainEntity(entity));
  }

  async search(
    filters: PostSearchFilters,
    page: number,
    limit: number,
  ): Promise<PostSearchResult> {
    const query = this.repository.createQueryBuilder('post');

    this.applyFilters(query, filters);

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    query.skip((page - 1) * limit).take(limit);

    // Add ordering
    query.orderBy('post.createdAt', 'DESC');

    const entities = await query.getMany();
    const posts = entities.map(entity => this.toDomainEntity(entity));

    return {
      posts,
      total,
      page,
      limit,
    };
  }

  async delete(id: PostId): Promise<void> {
    await this.repository.delete({ id: id.value });
  }

  async exists(id: PostId): Promise<boolean> {
    const count = await this.repository.count({
      where: { id: id.value },
    });
    return count > 0;
  }

  private applyFilters(
    query: SelectQueryBuilder<PostTypeormEntity>,
    filters: PostSearchFilters,
  ): void {
    if (filters.categoryId) {
      query.andWhere('post.categoryId = :categoryId', {
        categoryId: filters.categoryId.value,
      });
    }

    if (filters.locationId) {
      query.andWhere('post.locationId = :locationId', {
        locationId: filters.locationId.value,
      });
    }

    if (filters.userId) {
      query.andWhere('post.userId = :userId', {
        userId: filters.userId.value,
      });
    }

    if (filters.status) {
      query.andWhere('post.status = :status', {
        status: filters.status,
      });
    }

    if (filters.type) {
      query.andWhere('post.type = :type', {
        type: filters.type,
      });
    }

    if (filters.minPrice !== undefined) {
      query.andWhere('post.priceAmount >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice !== undefined) {
      query.andWhere('post.priceAmount <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    if (filters.currency) {
      query.andWhere('post.priceCurrency = :currency', {
        currency: filters.currency,
      });
    }

    if (filters.searchTerm) {
      query.andWhere(
        '(post.title ILIKE :searchTerm OR post.description ILIKE :searchTerm)',
        { searchTerm: `%${filters.searchTerm}%` },
      );
    }
  }

  private toTypeormEntity(post: Post): PostTypeormEntity {
    const entity = new PostTypeormEntity();
    
    entity.id = post.id.value;
    entity.title = post.title;
    entity.description = post.description;
    entity.type = post.type;
    entity.userId = post.userId.value;
    entity.categoryId = post.categoryId.value;
    entity.locationId = post.locationId.value;
    entity.images = post.images;
    entity.status = post.status.status;
    entity.statusReason = post.status.reason || null;
    entity.viewCount = post.viewCount;
    entity.expiresAt = post.expiresAt;
    entity.metadata = post.metadata;
    entity.createdAt = post.createdAt;
    entity.updatedAt = post.updatedAt;

    if (post.price) {
      entity.priceAmount = post.price.amount;
      entity.priceCurrency = post.price.currency;
    } else {
      entity.priceAmount = null;
      entity.priceCurrency = null;
    }

    return entity;
  }

  private toDomainEntity(entity: PostTypeormEntity): Post {
    const price = entity.priceAmount && entity.priceCurrency 
      ? { amount: Number(entity.priceAmount), currency: entity.priceCurrency }
      : undefined;

    return Post.reconstitute(
      entity.id,
      entity.title,
      entity.description,
      entity.type,
      entity.userId,
      entity.categoryId,
      entity.locationId,
      entity.status,
      entity.statusReason || undefined,
      entity.viewCount,
      entity.createdAt,
      entity.updatedAt,
      entity.expiresAt,
      price,
      entity.images,
      entity.metadata,
    );
  }
}