# Domain Driven Design Implementation Guide for Classified Ads Backend

## Overview

This guide provides a comprehensive approach to implementing Domain Driven Design (DDD) in your classified ads backend. The examples provided demonstrate proper DDD patterns and architectural principles.

## Current vs. Recommended Architecture

### Current Issues in Your Codebase

1. **Anemic Domain Models**: Your current entities are just data containers with TypeORM decorators
2. **Business Logic in Services**: Domain logic is scattered in application services
3. **Infrastructure Coupling**: Domain models are tightly coupled to database concerns
4. **Missing Value Objects**: Primitive obsession throughout the codebase
5. **No Domain Events**: Missing event-driven architecture patterns

### Recommended DDD Structure

```
src/
├── domain/                     # Core Business Logic
├── application/                # Use Cases & Application Services
├── infrastructure/             # External Concerns (DB, APIs, etc.)
└── presentation/              # Controllers & API Layer
```

## Key DDD Patterns Implemented

### 1. Value Objects

**Purpose**: Encapsulate business rules and ensure data integrity

**Example**: `Price` Value Object
```typescript
// ✅ Good: Rich domain behavior
const price = Price.create(100, 'USD');
console.log(price.format()); // "$100.00"
console.log(price.isNegotiable()); // false

// ❌ Bad: Primitive obsession
const price = 100;
const currency = 'USD';
```

**Benefits**:
- Type safety
- Business rule enforcement
- Immutability
- Rich behavior

### 2. Rich Domain Entities

**Purpose**: Contain business logic and maintain consistency

**Example**: `Post` Entity
```typescript
// ✅ Good: Business methods
const post = Post.create(title, description, type, userId, categoryId, locationId);
post.publish(); // Triggers domain event
post.approve(moderatorId); // Business logic with validation

// ❌ Bad: Anemic model
const post = new Post();
post.title = title;
post.status = 'approved'; // No validation
```

**Benefits**:
- Encapsulated business rules
- Consistent state transitions
- Domain events
- Self-validating

### 3. Domain Events

**Purpose**: Decouple domain logic and enable event-driven architecture

**Example**: Post Events
```typescript
// When a post is published
post.publish(); // Adds PostCreatedEvent to domain events

// In your application service
await this.postRepository.save(post);
await this.eventDispatcher.dispatchAll(post.domainEvents);
post.clearDomainEvents();
```

**Benefits**:
- Loose coupling
- Audit trails
- Integration with external systems
- Eventual consistency

### 4. Repository Pattern

**Purpose**: Abstract data access and maintain domain focus

**Example**: Repository Interface
```typescript
// Domain layer defines the contract
export interface PostRepository {
  save(post: Post): Promise<void>;
  findById(id: PostId): Promise<Post | null>;
  findByCriteria(criteria: PostSearchCriteria): Promise<{ posts: Post[]; total: number }>;
}

// Infrastructure layer implements it
@Injectable()
export class TypeormPostRepository implements PostRepository {
  // Implementation details
}
```

**Benefits**:
- Testability
- Database independence
- Clean separation of concerns
- Domain-focused queries

### 5. CQRS Pattern

**Purpose**: Separate read and write operations

**Example**: Command/Query Separation
```typescript
// Commands (Write operations)
export class CreatePostCommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
    // ... other properties
  ) {}
}

// Queries (Read operations)
export class GetPostsQuery {
  constructor(
    public readonly filters: PostSearchFilters,
    public readonly pagination: PaginationOptions,
  ) {}
}
```

**Benefits**:
- Optimized read/write models
- Scalability
- Clear intent
- Simplified testing

## Implementation Steps

### Step 1: Create Domain Layer

1. **Value Objects**: Start with `Id`, `Price`, `PostStatus`
2. **Entities**: Create rich `Post` entity with business methods
3. **Domain Events**: Define events for important business actions
4. **Repository Interfaces**: Define contracts for data access

### Step 2: Application Layer

1. **Commands**: Create command objects for write operations
2. **Command Handlers**: Implement use cases using domain objects
3. **Queries**: Create query objects for read operations
4. **Query Handlers**: Implement read-side logic

### Step 3: Infrastructure Layer

1. **Repository Implementations**: Implement domain repository interfaces
2. **TypeORM Entities**: Create separate persistence models
3. **Event Dispatchers**: Implement domain event handling
4. **External Services**: Integrate with third-party APIs

### Step 4: Presentation Layer

1. **Controllers**: Thin controllers that delegate to application services
2. **DTOs**: Input/output data transfer objects
3. **Validation**: Input validation and error handling

## Migration Strategy

### Phase 1: Parallel Implementation
- Keep existing code running
- Implement new DDD structure alongside
- Start with one aggregate (Posts)

### Phase 2: Gradual Migration
- Replace one feature at a time
- Update tests to use new structure
- Migrate data access patterns

### Phase 3: Cleanup
- Remove old anemic models
- Consolidate business logic
- Optimize performance

## Best Practices

### 1. Aggregate Design
- Keep aggregates small and focused
- One aggregate per transaction
- Use eventual consistency between aggregates

### 2. Value Object Usage
- Use for complex business concepts
- Make them immutable
- Include business behavior

### 3. Domain Events
- Use for important business events
- Keep events focused and specific
- Handle events asynchronously when possible

### 4. Repository Design
- Define interfaces in domain layer
- Implement in infrastructure layer
- Focus on aggregate roots

### 5. Testing Strategy
- Unit test domain logic extensively
- Integration test application services
- Mock external dependencies

## Example Use Cases

### Creating a Post
```typescript
// 1. Controller receives request
@Post()
async createPost(@Body() dto: CreatePostDto, @Request() req) {
  const command = new CreatePostCommand(
    dto.title,
    dto.description,
    dto.type,
    req.user.id,
    dto.categoryId,
    dto.locationId,
    dto.price
  );
  
  return await this.createPostHandler.handle(command);
}

// 2. Command handler orchestrates use case
async handle(command: CreatePostCommand) {
  const userId = UserId.create(command.userId);
  const categoryId = CategoryId.create(command.categoryId);
  const price = command.price ? Price.create(command.price.amount, command.price.currency) : null;
  
  const post = Post.create(
    command.title,
    command.description,
    command.type,
    userId,
    categoryId,
    command.locationId,
    price
  );
  
  post.publish(); // Domain logic + events
  
  await this.postRepository.save(post);
  await this.eventDispatcher.dispatchAll(post.domainEvents);
  
  return { postId: post.id.value };
}
```

### Post Moderation
```typescript
// Domain entity handles business logic
public approve(moderatorId: UserId): void {
  if (!this._status.canBeApproved()) {
    throw new Error('Post cannot be approved in its current state');
  }

  this._status = this._status.approve();
  this._updatedAt = new Date();
  this.setExpirationDate();
  
  this.addDomainEvent(new PostApprovedEvent(
    this._id.value, 
    this._userId.value, 
    moderatorId.value
  ));
}
```

## Benefits of This Approach

1. **Maintainability**: Business logic is centralized and well-organized
2. **Testability**: Domain logic can be tested in isolation
3. **Flexibility**: Easy to change infrastructure without affecting business logic
4. **Scalability**: Clear separation allows for independent scaling
5. **Team Collaboration**: Clear boundaries help teams work independently

## Common Pitfalls to Avoid

1. **Over-engineering**: Don't create value objects for simple strings
2. **Anemic Domain**: Ensure entities contain business behavior
3. **Leaky Abstractions**: Keep infrastructure concerns out of domain
4. **Large Aggregates**: Keep aggregates focused and small
5. **Synchronous Events**: Use async processing for cross-aggregate events

## Next Steps

1. Start with the Post aggregate as shown in the examples
2. Gradually migrate other aggregates (User, Category, etc.)
3. Implement domain event handling
4. Add comprehensive testing
5. Consider implementing CQRS for read-heavy operations

This approach will give you a robust, maintainable, and scalable classified ads backend that follows DDD principles correctly. 