import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, IsArray, ValidateNested, IsObject, MinLength, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PostType } from '@app/domain/posts/entities/post.entity';

export class PriceDto {
  @ApiProperty({ description: 'Price amount', example: 100.50 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'USD', maxLength: 3 })
  @IsString()
  @MaxLength(3)
  currency: string;
}

export class PostImageDto {
  @ApiProperty({ description: 'Image URL', example: 'https://example.com/image.jpg' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Image caption', required: false })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiProperty({ description: 'Image order', example: 1 })
  @IsNumber()
  @Min(0)
  order: number;
}

export class CreatePostDto {
  @ApiProperty({ description: 'Post title', example: 'iPhone 13 Pro for sale' })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'Post description', example: 'Excellent condition iPhone 13 Pro with box and accessories' })
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ description: 'Post type', enum: PostType, example: PostType.SELL })
  @IsEnum(PostType)
  type: PostType;

  @ApiProperty({ description: 'Category ID', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Location ID', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480' })
  @IsString()
  locationId: string;

  @ApiProperty({ description: 'Price details', required: false, type: PriceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PriceDto)
  price?: PriceDto;

  @ApiProperty({ description: 'Post images', required: false, type: [PostImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostImageDto)
  images?: PostImageDto[];

  @ApiProperty({ description: 'Additional metadata', required: false, example: { tags: ['electronics', 'apple'] } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 