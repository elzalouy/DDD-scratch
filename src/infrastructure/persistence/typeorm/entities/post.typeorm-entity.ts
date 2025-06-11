import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { PostType } from '@app/domain/posts/entities/post.entity';

@Entity('posts')
@Index(['categoryId', 'locationId', 'status'])
@Index(['userId'])
@Index(['type', 'status'])
export class PostTypeormEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: PostType,
  })
  type: PostType;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  categoryId: string;

  @Column('uuid')
  locationId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  priceAmount: number | null;

  @Column({
    type: 'varchar',
    length: 3,
    nullable: true,
  })
  priceCurrency: string | null;

  @Column('json', { default: [] })
  images: Array<{ url: string; caption?: string; order: number }>;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft',
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  statusReason: string | null;

  @Column({
    type: 'int',
    default: 0,
  })
  viewCount: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date | null;

  @Column('json', { default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 