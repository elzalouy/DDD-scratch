import { Post } from '../entities/post.entity';
import { PostId, UserId, CategoryId, LocationId } from '../../shared/value-objects/base-id.vo';

export interface PostSearchFilters {
  categoryId?: CategoryId;
  locationId?: LocationId;
  userId?: UserId;
  status?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  searchTerm?: string;
}

export interface PostSearchResult {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

export interface IPostRepository {
  save(post: Post): Promise<void>;
  findById(id: PostId): Promise<Post | null>;
  findByUserId(userId: UserId): Promise<Post[]>;
  search(filters: PostSearchFilters, page: number, limit: number): Promise<PostSearchResult>;
  delete(id: PostId): Promise<void>;
  exists(id: PostId): Promise<boolean>;
}

export const POST_REPOSITORY_TOKEN = Symbol('IPostRepository'); 