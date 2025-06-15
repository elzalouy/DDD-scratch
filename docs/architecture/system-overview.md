# 🏗️ System Architecture Overview

## Introduction

The Classified Ads Backend is built using a modern, scalable architecture that follows Domain-Driven Design (DDD) principles, CQRS patterns, and microservices-ready design. This document provides a high-level overview of the system architecture and design decisions.

## 🎯 Architecture Principles

### 1. Domain-Driven Design (DDD)
- **Ubiquitous Language**: Shared vocabulary between business and technical teams
- **Bounded Contexts**: Clear boundaries between different business domains
- **Rich Domain Models**: Business logic encapsulated in domain entities
- **Domain Events**: Decoupled communication between domains

### 2. CQRS (Command Query Responsibility Segregation)
- **Separation of Concerns**: Commands for writes, queries for reads
- **Scalability**: Independent scaling of read and write operations
- **Performance**: Optimized data models for different use cases

### 3. Event-Driven Architecture
- **Loose Coupling**: Components communicate via events
- **Scalability**: Asynchronous processing capabilities
- **Resilience**: Event sourcing and replay capabilities

## 🏛️ High-Level Architecture

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
│  │   (TypeORM)     │ │                 │ │   (Pub/Sub)     ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │  Authentication │ │   File Storage  │ │   Configuration ││
│  │                 │ │                 │ │                 ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Domain Model

### Core Domains

#### 1. **Posts Domain**
- **Entities**: Post (Aggregate Root)
- **Value Objects**: Price, PostStatus, PostContent, Category, Location
- **Business Rules**: Post approval workflow, pricing validation
- **Events**: PostCreated, PostApproved, PostRejected, PostExpired

#### 2. **Users Domain**
- **Entities**: User (Aggregate Root)
- **Value Objects**: Email, UserProfile, UserRole
- **Business Rules**: User registration, profile management
- **Events**: UserRegistered, UserProfileUpdated, UserRoleChanged

#### 3. **Notifications Domain**
- **Entities**: Notification (Aggregate Root)
- **Value Objects**: NotificationType, DeliveryChannel, NotificationContent
- **Business Rules**: Delivery preferences, retry logic
- **Events**: NotificationCreated, NotificationSent, NotificationFailed

#### 4. **Categories Domain**
- **Entities**: Category (Aggregate Root)
- **Value Objects**: CategoryName, CategoryHierarchy
- **Business Rules**: Category tree management

#### 5. **Locations Domain**
- **Entities**: Location (Aggregate Root)
- **Value Objects**: Address, Coordinates, RegionCode
- **Business Rules**: Geographic boundaries, location validation

## 🔄 Data Flow

### Command Flow (Write Operations)
```
Client Request → Controller → Command → Command Handler → Domain Entity → Repository → Database
                                    ↓
                              Domain Events → Event Handlers → External Services
```

### Query Flow (Read Operations)
```
Client Request → Controller → Query → Query Handler → Repository → Database
                                                        ↓
                                               Optimized Read Models
```

## 🚀 Technology Stack

### Backend Framework
- **NestJS**: Enterprise-grade Node.js framework
- **TypeScript**: Type-safe development
- **Express**: HTTP server foundation

### Database & Persistence
- **PostgreSQL**: Primary relational database
- **TypeORM**: Object-relational mapping
- **Firebase Firestore**: NoSQL for notifications
- **Redis**: Caching and session storage

### Messaging & Events
- **Google Cloud Pub/Sub**: Asynchronous messaging
- **Bull Queue**: Job processing
- **Firebase Cloud Messaging**: Push notifications

### Authentication & Security
- **JWT**: Stateless authentication
- **bcryptjs**: Password hashing
- **Passport**: Authentication middleware

### Development & DevOps
- **Docker**: Containerization
- **Kubernetes**: Orchestration
- **ESLint/Prettier**: Code quality
- **Jest**: Testing framework

## 🔒 Security Architecture

### Authentication Flow
```
Client → JWT Token → Auth Guard → Role Guard → Controller → Business Logic
```

### Security Layers
1. **Network Security**: HTTPS, CORS, Rate Limiting
2. **Authentication**: JWT with refresh tokens
3. **Authorization**: Role-based access control (RBAC)
4. **Input Validation**: DTO validation with class-validator
5. **Data Protection**: Password hashing, data encryption

## 📊 Scalability Features

### Horizontal Scaling
- **Stateless Services**: No session state in application
- **Load Balancing**: Multiple service instances
- **Database Sharding**: Partition data across instances

### Performance Optimization
- **Caching Strategy**: Redis for frequently accessed data
- **Connection Pooling**: Efficient database connections
- **Async Processing**: Background jobs for heavy operations
- **Query Optimization**: Indexed queries, pagination

### Monitoring & Observability
- **Health Checks**: Service health endpoints
- **Metrics Collection**: Application and business metrics
- **Distributed Tracing**: Request flow tracking
- **Centralized Logging**: Structured log aggregation

## 🧪 Testing Strategy

### Testing Pyramid
```
                    E2E Tests
                 ─────────────
               Integration Tests
            ─────────────────────
          Unit Tests (Domain Logic)
       ─────────────────────────────
```

### Test Categories
- **Unit Tests**: Domain entities, value objects, services
- **Integration Tests**: API endpoints, database operations
- **E2E Tests**: Complete user workflows
- **Contract Tests**: API contract validation

## 🚀 Deployment Architecture

### Development Environment
```
Developer → Local Docker → Feature Branch → Pull Request → Code Review
```

### Production Pipeline
```
Merge → CI Pipeline → Build → Test → Security Scan → Deploy → Monitor
```

### Infrastructure
- **Container Orchestration**: Kubernetes clusters
- **Service Mesh**: Istio for microservices communication
- **CDN**: CloudFlare for static content
- **Monitoring**: Prometheus + Grafana stack

## 📈 Future Roadmap

### Phase 1: Core Features ✅
- User management
- Post CRUD operations
- Basic notifications

### Phase 2: Advanced Features 🚧
- Advanced search capabilities
- Real-time messaging
- Payment integration

### Phase 3: Scale & Optimize 📋
- Microservices architecture
- Event sourcing
- Advanced analytics

## 🔗 Related Documentation

- [Domain-Driven Design Guide](./ddd-architecture.md)
- [Notification System Architecture](./notification-system.md)
- [API Documentation](../api/)
- [Deployment Guide](../deployment/) 