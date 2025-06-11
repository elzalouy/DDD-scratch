import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePostsTable1701234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'posts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['sell', 'buy', 'rent', 'service', 'job'],
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'categoryId',
            type: 'uuid',
          },
          {
            name: 'locationId',
            type: 'uuid',
          },
          {
            name: 'priceAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'priceCurrency',
            type: 'varchar',
            length: '3',
            isNullable: true,
          },
          {
            name: 'images',
            type: 'json',
            default: "'[]'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'draft'",
          },
          {
            name: 'statusReason',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'viewCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            default: "'{}'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for better query performance
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'IDX_POSTS_CATEGORY_LOCATION_STATUS',
        columnNames: ['categoryId', 'locationId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'IDX_POSTS_USER',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'IDX_POSTS_TYPE_STATUS',
        columnNames: ['type', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'IDX_POSTS_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('posts');
  }
} 