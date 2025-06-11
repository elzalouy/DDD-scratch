# Create Post API Documentation

## Overview

The Create Post API allows authenticated users to create new classified ads in the system. This API follows Domain Driven Design (DDD) principles and implements CQRS pattern for clean separation of concerns.

## Architecture Implementation

### Domain Layer
- **Post Aggregate**: Rich domain entity with business logic
- **Value Objects**: PostContent, Price, PostStatus for data validation
- **Domain Events**: PostCreatedEvent triggered when post is published
- **Repository Interface**: IPostRepository for persistence abstraction

### Application Layer  
- **CQRS Command**: CreatePostCommand with validation
- **Command Handler**: CreatePostHandler orchestrates business logic
- **Dependency Injection**: Repository interface injected via token

### Infrastructure Layer
- **TypeORM Entity**: PostTypeormEntity for database persistence
- **Repository Implementation**: PostRepository with search capabilities
- **Database Migration**: Posts table with optimized indexes

### Presentation Layer
- **REST Controller**: PostsController with OpenAPI documentation
- **DTO Validation**: CreatePostDto with comprehensive validation rules
- **Authentication**: JWT-protected endpoint

## API Endpoint

```
POST /posts
```

### Authentication
- **Required**: Bearer JWT token
- **Guard**: JwtAuthGuard
- **User Context**: User ID extracted from JWT payload

### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body

```typescript
{
  "title": string,           // 5-100 characters
  "description": string,     // 20-2000 characters  
  "type": PostType,         // "sell" | "buy" | "rent" | "service" | "job"
  "categoryId": string,     // UUID format
  "locationId": string,     // UUID format
  "price"?: {               // Optional
    "amount": number,       // >= 0
    "currency": string      // 3-character currency code
  },
  "images"?: Array<{        // Optional, max 10 images
    "url": string,
    "caption"?: string,
    "order": number         // >= 0
  }>,
  "metadata"?: object       // Optional additional data
}
```

### Example Request

```json
{
  "title": "iPhone 13 Pro for sale",
  "description": "Excellent condition iPhone 13 Pro with original box, charger, and protective case. Used for 6 months, no scratches or damage. Battery health 98%. Selling due to upgrade.",
  "type": "sell",
  "categoryId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "locationId": "f47ac10b-58cc-4372-a567-0e02b2c3d480", 
  "price": {
    "amount": 899.99,
    "currency": "USD"
  },
  "images": [
    {
      "url": "https://storage.example.com/posts/image1.jpg",
      "caption": "Front view of iPhone",
      "order": 1
    },
    {
      "url": "https://storage.example.com/posts/image2.jpg", 
      "caption": "Back view with case",
      "order": 2
    }
  ],
  "metadata": {
    "tags": ["electronics", "apple", "smartphone"],
    "condition": "excellent",
    "warranty": "6 months remaining"
  }
}
```

### Response

#### Success (201 Created)
```json
{
  "id": "8f7e6d5c-4b3a-2918-7f6e-5d4c3b2a1908",
  "message": "Post created successfully and is pending approval"
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "statusCode": 400,
  "message": [
    "title must be longer than or equal to 5 characters",
    "description must be longer than or equal to 20 characters"
  ],
  "error": "Bad Request"
}
```

**401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Business Rules

### Post Creation Rules
1. **User Authentication**: Only authenticated users can create posts
2. **Content Validation**: Title (5-100 chars), Description (20-2000 chars)
3. **Initial Status**: New posts start in "pending" status awaiting approval
4. **Image Limit**: Maximum 10 images per post
5. **Price Optional**: Not all post types require pricing
6. **Automatic Events**: PostCreatedEvent fired for notification system

### Post Types
- **sell**: Items for sale
- **buy**: Wanted to buy requests  
- **rent**: Rental offers/requests
- **service**: Service offerings
- **job**: Job postings

### Post Status Workflow
1. **draft** → **pending** (on publish)
2. **pending** → **approved** (by moderator)
3. **pending** → **rejected** (by moderator with reason)
4. **approved** → **expired** (after 30 days)
5. **any** → **deleted** (by user/admin)

## cURL Example

```bash
curl -X POST "http://localhost:3000/posts" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 13 Pro for sale",
    "description": "Excellent condition iPhone 13 Pro with original box and accessories. Used for 6 months, no damage.",
    "type": "sell",
    "categoryId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "locationId": "f47ac10b-58cc-4372-a567-0e02b2c3d480",
    "price": {
      "amount": 899.99,
      "currency": "USD"
    }
  }'
```

## Database Schema

The API creates posts in the following database structure:

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  type ENUM('sell','buy','rent','service','job') NOT NULL,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL,
  location_id UUID NOT NULL,
  price_amount DECIMAL(10,2),
  price_currency VARCHAR(3),
  images JSON DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'draft',
  status_reason VARCHAR(500),
  view_count INT DEFAULT 0,
  expires_at TIMESTAMP,
  metadata JSON DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optimized indexes for performance
CREATE INDEX idx_posts_category_location_status ON posts(category_id, location_id, status);
CREATE INDEX idx_posts_user ON posts(user_id);  
CREATE INDEX idx_posts_type_status ON posts(type, status);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

## Integration Testing

### Prerequisites
1. Running PostgreSQL database
2. Valid JWT authentication token
3. Existing Category and Location records

### Test Scenarios

**1. Valid Post Creation**
- Authenticated user creates post with all required fields
- Verify 201 response with post ID
- Check database record created with correct status

**2. Validation Failures**  
- Missing required fields → 400 error
- Invalid title length → 400 error
- Invalid post type → 400 error
- Invalid price amount → 400 error

**3. Authentication Failures**
- No token → 401 error
- Invalid token → 401 error  
- Expired token → 401 error

**4. Business Logic Verification**
- Post created in "pending" status
- PostCreatedEvent domain event fired
- Price validation for different currencies
- Image order validation

## Domain Events

When a post is created and published, the following domain event is fired:

```typescript
PostCreatedEvent {
  eventName: 'post.created',
  aggregateId: '<post-id>',
  occurredOn: Date,
  postId: '<post-id>',
  userId: '<user-id>',
  title: 'Post title',
  type: PostType
}
```

This event can be used to:
- Send notifications to moderators
- Update search indexes
- Trigger automated moderation workflows
- Log analytics events

## Security Considerations

1. **Input Validation**: All inputs validated with class-validator
2. **SQL Injection**: Protected via TypeORM parameterized queries  
3. **XSS Prevention**: Content escaped in responses
4. **Rate Limiting**: Configurable throttling on endpoint
5. **Authentication**: JWT token validation required
6. **Authorization**: User can only create posts for themselves

## Performance Considerations

1. **Database Indexes**: Optimized for common query patterns
2. **Connection Pooling**: TypeORM handles connection management
3. **Validation Pipeline**: Fail-fast validation before business logic
4. **Event Publishing**: Asynchronous domain event handling
5. **Image Storage**: URLs only stored, actual files handled separately

## Future Enhancements

1. **Draft Mode**: Save posts as drafts before publishing
2. **Image Upload**: Direct image upload endpoints
3. **Geolocation**: Enhanced location-based searching
4. **Analytics**: View tracking and performance metrics
5. **AI Moderation**: Automated content moderation
6. **Multi-language**: i18n support for global markets 