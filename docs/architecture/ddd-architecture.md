# Domain-Driven Design Architecture for Classified Ads Backend

## Architecture Overview

This classified ads backend follows a strict Domain-Driven Design (DDD) architecture with clean separation of concerns across four main layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │  REST APIs      │ │   GraphQL       │ │   WebSockets    ││
│  │  (Controllers)  │ │   (Resolvers)   │ │   (Gateways)    ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   Commands      │ │     Queries     │ │   Application   ││
│  │   (CQRS)        │ │    (CQRS)       │ │   Services      ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   Aggregates    │ │  Value Objects  │ │ Domain Services ││
│  │   (Entities)    │ │                 │ │                 ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ Domain Events   │ │  Repositories   │ │  Domain Rules   ││
│  │                 │ │  (Interfaces)   │ │                 ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   Persistence   │ │ External APIs   │ │   Messaging     ││
│  │   (TypeORM)     │ │                 │ │   (Bull/Redis)  ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │  Authentication │ │   File Storage  │ │   Configuration ││
│  │                 │ │                 │ │                 ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app.module.ts                    # Main application module
├── main.ts                          # Application bootstrap
│
├── domain/                          # 🔵 DOMAIN LAYER (Core Business Logic)
│   ├── domain.module.ts
│   ├── shared/                      # Shared domain concepts
│   │   ├── entities/
│   │   │   └── base-entity.ts       # Base aggregate root
│   │   └── value-objects/
│   │       ├── base-id.vo.ts        # Type-safe IDs
│   │       └── email.vo.ts          # Email value object
│   │
│   ├── users/                       # User Aggregate
│   │   ├── entities/
│   │   │   └── user.entity.ts       # User aggregate root
│   │   ├── value-objects/
│   │   │   ├── user-profile.vo.ts   # User profile information
│   │   │   └── user-role.vo.ts      # Role-based access control
│   │   ├── events/
│   │   │   ├── user-registered.event.ts
│   │   │   ├── user-profile-updated.event.ts
│   │   │   └── user-role-changed.event.ts
│   │   ├── repositories/
│   │   │   └── user.repository.interface.ts
│   │   └── services/               # Domain services (if needed)
│   │
│   ├── posts/                      # Post Aggregate
│   │   ├── entities/
│   │   │   └── post.entity.ts      # Post aggregate root
│   │   ├── value-objects/
│   │   │   ├── price.vo.ts         # Money/Price with currency
│   │   │   ├── post-status.vo.ts   # Status with transitions
│   │   │   └── post-content.vo.ts  # Title/Description validation
│   │   ├── events/
│   │   │   ├── post-created.event.ts
│   │   │   ├── post-approved.event.ts
│   │   │   └── post-rejected.event.ts
│   │   ├── repositories/
│   │   │   └── post.repository.interface.ts
│   │   └── services/
│   │
│   ├── categories/                 # Category Aggregate
│   └── locations/                  # Location Aggregate
│
├── application/                    # 🟡 APPLICATION LAYER (Use Cases)
│   ├── application.module.ts
│   ├── shared/
│   │   ├── dto/                    # Data Transfer Objects
│   │   └── services/               # Application services
│   │
│   ├── posts/
│   │   ├── commands/               # Write operations (CQRS)
│   │   │   ├── create-post/
│   │   │   │   ├── create-post.command.ts
│   │   │   │   └── create-post.handler.ts
│   │   │   ├── update-post/
│   │   │   ├── delete-post/
│   │   │   ├── approve-post/
│   │   │   └── reject-post/
│   │   ├── queries/                # Read operations (CQRS)
│   │   │   ├── get-posts/
│   │   │   │   ├── get-posts.query.ts
│   │   │   │   └── get-posts.handler.ts
│   │   │   ├── get-post-by-id/
│   │   │   └── search-posts/
│   │   └── dto/
│   │       ├── create-post.dto.ts
│   │       └── post-response.dto.ts
│   │
│   ├── users/
│   ├── categories/
│   └── locations/
│
├── infrastructure/                 # 🔴 INFRASTRUCTURE LAYER (External Concerns)
│   ├── infrastructure.module.ts
│   ├── config/
│   │   ├── database.config.ts      # Database configuration
│   │   ├── i18n.config.ts          # Internationalization
│   │   └── i18n/                   # Translation files
│   │
│   ├── persistence/
│   │   └── typeorm/
│   │       ├── entities/           # TypeORM entities (separate from domain)
│   │       ├── repositories/       # Repository implementations
│   │       └── migrations/         # Database migrations
│   │
│   ├── external-services/          # Third-party integrations
│   ├── messaging/                  # Event handling, queues
│   └── common/                     # Infrastructure utilities
│       ├── guards/
│       ├── filters/
│       ├── interceptors/
│       └── decorators/
│
└── presentation/                   # 🟢 PRESENTATION LAYER (API Interface)
    ├── presentation.module.ts
    └── rest/
        ├── posts/
        │   ├── controllers/
        │   │   └── posts.controller.ts
        │   └── dto/
        │       ├── create-post-request.dto.ts
        │       └── post-response.dto.ts
        ├── users/
        ├── categories/
        └── locations/
```

## Key DDD Patterns Implemented

### 1. Aggregates & Entities

**Aggregates** are the core building blocks that maintain consistency boundaries:

- **User Aggregate**: Manages user profile, authentication, and permissions
- **Post Aggregate**: Manages classified ads with content, pricing, and moderation
- **Category Aggregate**: Manages ad categories and hierarchies
- **Location Aggregate**: Manages geographic locations

Each aggregate has:
- A single **Aggregate Root** (main entity)
- **Rich behavior** instead of anemic models
- **Domain events** for important business changes
- **Invariant protection** through encapsulation

### 2. Value Objects

Value objects encapsulate business rules and provide type safety:

- `BaseId`: Type-safe UUIDs for entities
- `Email`: Validated email addresses
- `Price`: Money with currency and formatting
- `PostStatus`: Status with valid transitions
- `PostContent`: Validated title/description
- `UserProfile`: Personal information
- `UserRole`: Role-based permissions

### 3. Domain Events

Events capture important business occurrences:

- `UserRegisteredEvent`: When a user signs up
- `PostCreatedEvent`: When a post is published
- `PostApprovedEvent`: When a moderator approves
- `PostRejectedEvent`: When a moderator rejects

### 4. CQRS (Command Query Responsibility Segregation)

**Commands** (Write Operations):
- `CreatePostCommand`: Create new classified ad
- `UpdatePostCommand`: Modify existing ad
- `ApprovePostCommand`: Moderator approval
- `RejectPostCommand`: Moderator rejection

**Queries** (Read Operations):
- `GetPostsQuery`: List posts with filters
- `GetPostByIdQuery`: Get specific post
- `SearchPostsQuery`: Full-text search

### 5. Repository Pattern

Repository interfaces are defined in the domain layer:
```typescript
interface PostRepository {
  save(post: Post): Promise<void>;
  findById(id: PostId): Promise<Post | null>;
  findByCriteria(criteria: SearchCriteria): Promise<Post[]>;
}
```

Implementations are in the infrastructure layer:
```typescript
class TypeormPostRepository implements PostRepository {
  // TypeORM-specific implementation
}
```

## Business Rules & Constraints

### Post Management
- Posts start as DRAFT → PENDING → APPROVED/REJECTED
- Only pending posts can be approved
- Only approved posts are visible to public
- Posts expire after 30 days (configurable)
- Users can only edit their own posts
- Moderators can approve/reject any post

### User Management  
- Email addresses must be unique
- Users start with USER role
- Only ADMIN can change user roles
- Users must verify email before posting
- Inactive users cannot perform actions

### Pricing
- Supports multiple currencies (USD, EUR, GBP, CAD, AUD)
- Zero price indicates "negotiable"
- Price validation prevents negative amounts
- Currency conversion handled by domain service

### Content Validation
- Title: 1-100 characters, no spam patterns
- Description: 10-5000 characters, no spam patterns
- Images: Maximum 10 per post
- Automatic spam detection and filtering

## Architecture Benefits

### 1. **Separation of Concerns**
- Business logic isolated in domain layer
- Infrastructure details separated
- Clear dependency direction (inward)

### 2. **Testability**
- Domain logic unit testable without dependencies
- Application services integration testable
- Infrastructure components mockable

### 3. **Maintainability**
- Business rules centralized in domain
- Changes to external systems don't affect core logic
- Clear module boundaries

### 4. **Scalability**
- CQRS enables read/write optimization
- Event-driven architecture supports async processing
- Microservice extraction possible along aggregate boundaries

### 5. **Team Collaboration**
- Clear ownership boundaries
- Domain experts can focus on business logic
- Infrastructure teams work independently

## Next Steps for Implementation

1. **Complete Domain Model**: Finish Category and Location aggregates
2. **Repository Implementations**: Create TypeORM repository classes
3. **Command/Query Handlers**: Implement all use cases
4. **Event Handling**: Set up domain event dispatching
5. **API Controllers**: Create REST endpoints
6. **Authentication**: Implement JWT-based auth
7. **Validation**: Add comprehensive input validation
8. **Testing**: Unit tests for domain, integration tests for application
9. **Documentation**: API documentation with Swagger
10. **Monitoring**: Add logging, metrics, and health checks

## Development Guidelines

### Domain Layer Rules
- No infrastructure dependencies
- Rich behavior over anemic models
- Immutable value objects
- Domain events for important changes
- Repository interfaces only

### Application Layer Rules
- Orchestrate domain objects
- Handle cross-aggregate operations
- Implement use cases
- Depend on domain abstractions
- Transform between layers

### Infrastructure Layer Rules
- Implement domain contracts
- Handle external concerns
- Configuration and setup
- No business logic
- Depend only on domain interfaces

### Presentation Layer Rules
- Thin controllers
- Input validation and transformation
- HTTP-specific concerns only
- Delegate to application layer
- API documentation

This architecture provides a solid foundation for a scalable, maintainable classified ads system that can evolve with changing business requirements while maintaining clean separation of concerns. 