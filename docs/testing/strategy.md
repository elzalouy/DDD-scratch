# 🧪 Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the Classified Ads Backend, following the testing pyramid approach to ensure code quality, reliability, and maintainability.

## 🎯 Testing Objectives

- **Quality Assurance**: Ensure code meets business requirements
- **Regression Prevention**: Catch breaking changes early
- **Documentation**: Tests serve as living documentation
- **Confidence**: Enable safe refactoring and deployments
- **Performance**: Maintain acceptable response times

## 📊 Testing Pyramid

```
           🔺 E2E Tests (5%)
              - User workflows
              - Critical paths
         ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
      🔺 Integration Tests (20%)
        - API endpoints
        - Database operations
        - External services
    ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
🔺 Unit Tests (75%)
  - Domain logic
  - Value objects
  - Services
  - Utilities
```

## 🔬 Unit Testing

### Scope
- Domain entities and value objects
- Application services and handlers
- Utility functions
- Business logic validation

### Framework
- **Jest**: Primary testing framework
- **@testing-library**: For React-like testing utilities
- **Supertest**: For HTTP testing

### Example: Domain Entity Test

```typescript
// tests/unit/domain/notifications/notification-entity.spec.ts
import { NotificationEntity } from '@/domain/notifications/entities/notification.entity';
import { NotificationType } from '@/domain/notifications/value-objects/notification-type.vo';

describe('NotificationEntity', () => {
  let notification: NotificationEntity;

  beforeEach(() => {
    notification = NotificationEntity.create({
      recipientId: 'user-123',
      type: NotificationType.POST_CREATED,
      title: 'Test Notification',
      message: 'Test message',
      channels: [DeliveryChannel.EMAIL],
      priority: NotificationPriority.NORMAL
    });
  });

  describe('creation', () => {
    it('should create notification with valid data', () => {
      expect(notification.recipientId).toBe('user-123');
      expect(notification.status.value).toBe('PENDING');
      expect(notification.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error for invalid recipient ID', () => {
      expect(() => {
        NotificationEntity.create({
          recipientId: 'invalid-id',
          type: NotificationType.POST_CREATED,
          title: 'Test',
          message: 'Test message',
          channels: [DeliveryChannel.EMAIL],
          priority: NotificationPriority.NORMAL
        });
      }).toThrow('Invalid recipient ID format');
    });
  });

  describe('retry logic', () => {
    it('should increment retry count on failure', () => {
      notification.markAsFailed('Connection timeout');
      notification.scheduleRetry();
      
      expect(notification.retryCount).toBe(1);
      expect(notification.status.value).toBe('RETRY');
    });

    it('should not retry after max attempts', () => {
      // Simulate max retries
      for (let i = 0; i < 3; i++) {
        notification.markAsFailed('Connection timeout');
        notification.scheduleRetry();
      }

      notification.markAsFailed('Final failure');
      
      expect(notification.status.value).toBe('FAILED');
      expect(notification.retryCount).toBe(3);
    });
  });

  describe('domain events', () => {
    it('should raise NotificationCreatedEvent on creation', () => {
      const events = notification.getUncommittedEvents();
      
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(NotificationCreatedEvent);
    });
  });
});
```

### Example: Value Object Test

```typescript
// tests/unit/domain/notifications/notification-priority.spec.ts
import { NotificationPriority } from '@/domain/notifications/value-objects/notification-priority.vo';

describe('NotificationPriority', () => {
  describe('creation', () => {
    it('should create valid priority levels', () => {
      const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'];
      
      priorities.forEach(level => {
        const priority = NotificationPriority.create(level);
        expect(priority.value).toBe(level);
      });
    });

    it('should throw error for invalid priority', () => {
      expect(() => {
        NotificationPriority.create('INVALID');
      }).toThrow('Invalid notification priority');
    });
  });

  describe('comparison', () => {
    it('should compare priorities correctly', () => {
      const low = NotificationPriority.LOW;
      const high = NotificationPriority.HIGH;
      const critical = NotificationPriority.CRITICAL;

      expect(critical.isHigherThan(high)).toBe(true);
      expect(high.isHigherThan(low)).toBe(true);
      expect(low.isHigherThan(critical)).toBe(false);
    });
  });

  describe('processing order', () => {
    it('should return correct processing order', () => {
      expect(NotificationPriority.CRITICAL.getProcessingOrder()).toBe(5);
      expect(NotificationPriority.LOW.getProcessingOrder()).toBe(1);
    });
  });
});
```

## 🔗 Integration Testing

### Scope
- API endpoints
- Database operations
- External service integrations
- Repository implementations

### Setup
- **Test Database**: Separate PostgreSQL instance
- **Test Containers**: Docker containers for dependencies
- **Mocking**: External APIs and services

### Example: API Integration Test

```typescript
// tests/integration/notifications/notifications.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { DatabaseService } from '../../../src/infrastructure/database/database.service';

describe('NotificationsController (Integration)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
    
    await app.init();
    await databaseService.runMigrations();
  });

  afterAll(async () => {
    await databaseService.cleanDatabase();
    await app.close();
  });

  beforeEach(async () => {
    await databaseService.clearData();
  });

  describe('POST /notifications/send', () => {
    it('should send notification successfully', async () => {
      const notificationData = {
        recipientId: 'user-123',
        type: 'POST_CREATED',
        title: 'Test Notification',
        message: 'Test message',
        channels: ['EMAIL'],
        priority: 'NORMAL'
      };

      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send(notificationData)
        .expect(201);

      expect(response.body).toHaveProperty('notificationId');
      expect(response.body.status).toBe('QUEUED');
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/notifications/send')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('recipientId must be a UUID');
      expect(response.body.message).toContain('title should not be empty');
    });

    it('should handle invalid notification type', async () => {
      const notificationData = {
        recipientId: 'user-123',
        type: 'INVALID_TYPE',
        title: 'Test',
        message: 'Test message',
        channels: ['EMAIL']
      };

      await request(app.getHttpServer())
        .post('/notifications/send')
        .send(notificationData)
        .expect(400);
    });
  });

  describe('GET /notifications/history', () => {
    beforeEach(async () => {
      // Seed test data
      await databaseService.seedNotifications([
        {
          recipientId: 'user-123',
          type: 'POST_CREATED',
          title: 'Test 1',
          status: 'SENT'
        },
        {
          recipientId: 'user-456',
          type: 'USER_WELCOME',
          title: 'Test 2',
          status: 'PENDING'
        }
      ]);
    });

    it('should return paginated notifications', async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications/history?page=1&limit=10')
        .expect(200);

      expect(response.body.notifications).toHaveLength(2);
      expect(response.body.total).toBe(2);
      expect(response.body.page).toBe(1);
    });

    it('should filter by recipient ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications/history?recipientId=user-123')
        .expect(200);

      expect(response.body.notifications).toHaveLength(1);
      expect(response.body.notifications[0].recipientId).toBe('user-123');
    });
  });
});
```

### Example: Repository Test

```typescript
// tests/integration/infrastructure/repositories/notification.repository.spec.ts
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirestoreNotificationRepository } from '../../../../src/infrastructure/notifications/repositories/firestore-notification.repository';
import { NotificationEntity } from '../../../../src/domain/notifications/entities/notification.entity';

describe('FirestoreNotificationRepository (Integration)', () => {
  let repository: FirestoreNotificationRepository;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433, // Test database port
          database: 'test_db',
          synchronize: true,
        }),
      ],
      providers: [FirestoreNotificationRepository],
    }).compile();

    repository = module.get<FirestoreNotificationRepository>(FirestoreNotificationRepository);
  });

  describe('save', () => {
    it('should save notification to Firestore', async () => {
      const notification = NotificationEntity.create({
        recipientId: 'user-123',
        type: NotificationType.POST_CREATED,
        title: 'Test Notification',
        message: 'Test message',
        channels: [DeliveryChannel.EMAIL],
        priority: NotificationPriority.NORMAL
      });

      const saved = await repository.save(notification);

      expect(saved.id).toBeDefined();
      expect(saved.recipientId).toBe('user-123');
    });
  });

  describe('findById', () => {
    it('should retrieve notification by ID', async () => {
      const notification = NotificationEntity.create({
        recipientId: 'user-456',
        type: NotificationType.USER_WELCOME,
        title: 'Welcome',
        message: 'Welcome message',
        channels: [DeliveryChannel.EMAIL],
        priority: NotificationPriority.NORMAL
      });

      const saved = await repository.save(notification);
      const found = await repository.findById(saved.id);

      expect(found).toBeDefined();
      expect(found.recipientId).toBe('user-456');
    });
  });
});
```

## 🌐 End-to-End Testing

### Scope
- Complete user workflows
- Critical business processes
- Cross-system integration

### Tools
- **Playwright**: Modern browser automation
- **Cypress**: Alternative E2E framework
- **Docker Compose**: Full environment setup

### Example: E2E Test

```typescript
// tests/e2e/notification-workflow.spec.ts
import { test, expect } from '@playwright/test';
import { ApiHelper } from '../helpers/api-helper';

test.describe('Notification Workflow', () => {
  let apiHelper: ApiHelper;

  test.beforeEach(async ({ page }) => {
    apiHelper = new ApiHelper(page);
    await apiHelper.setupTestEnvironment();
  });

  test('should send notification from post creation to user notification', async ({ page }) => {
    // 1. Create user
    const user = await apiHelper.createUser({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    });

    // 2. Login user
    const authToken = await apiHelper.loginUser(user.email, 'password123');

    // 3. Create post
    const post = await apiHelper.createPost({
      title: 'Vintage Camera',
      description: 'Beautiful vintage camera',
      price: 299.99
    }, authToken);

    // 4. Verify notification was sent
    const notifications = await apiHelper.getNotifications(user.id, authToken);
    
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('POST_CREATED');
    expect(notifications[0].status).toBe('SENT');

    // 5. Check notification delivery
    const deliveryAttempts = await apiHelper.getDeliveryAttempts(notifications[0].id, authToken);
    
    expect(deliveryAttempts).toContainEqual(
      expect.objectContaining({
        channel: 'EMAIL',
        success: true
      })
    );
  });

  test('should handle notification retry on failure', async ({ page }) => {
    // Simulate external service failure
    await apiHelper.mockExternalServiceFailure('email-service');

    const user = await apiHelper.createUser({
      email: 'retry@example.com',
      firstName: 'Retry',
      lastName: 'User'
    });

    const authToken = await apiHelper.loginUser(user.email, 'password123');

    // Create post that will trigger notification
    await apiHelper.createPost({
      title: 'Test Post',
      description: 'Test description',
      price: 100
    }, authToken);

    // Wait for retry mechanism
    await page.waitForTimeout(5000);

    const notifications = await apiHelper.getNotifications(user.id, authToken);
    const notification = notifications[0];

    expect(notification.status).toBe('RETRY');
    expect(notification.retryCount).toBeGreaterThan(0);

    // Restore service and wait for successful retry
    await apiHelper.restoreExternalService('email-service');
    await page.waitForTimeout(10000);

    const updatedNotifications = await apiHelper.getNotifications(user.id, authToken);
    expect(updatedNotifications[0].status).toBe('SENT');
  });
});
```

## 📈 Performance Testing

### Load Testing with Artillery

```yaml
# tests/performance/load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm-up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 120
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Send notifications"
    weight: 70
    flow:
      - post:
          url: "/notifications/send"
          headers:
            Authorization: "Bearer {{ auth_token }}"
          json:
            recipientId: "{{ $randomUUID }}"
            type: "POST_CREATED"
            title: "Performance Test"
            message: "Load testing notification"
            channels: ["EMAIL"]
            priority: "NORMAL"

  - name: "Get notification history"
    weight: 30
    flow:
      - get:
          url: "/notifications/history"
          headers:
            Authorization: "Bearer {{ auth_token }}"
```

### Stress Testing

```typescript
// tests/performance/stress-test.spec.ts
import { performance } from 'perf_hooks';
import { ApiHelper } from '../helpers/api-helper';

describe('Stress Testing', () => {
  let apiHelper: ApiHelper;

  beforeAll(() => {
    apiHelper = new ApiHelper();
  });

  test('should handle concurrent notification requests', async () => {
    const concurrentRequests = 100;
    const promises = [];

    const startTime = performance.now();

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        apiHelper.sendNotification({
          recipientId: `user-${i}`,
          type: 'STRESS_TEST',
          title: `Stress Test ${i}`,
          message: 'Concurrent load testing',
          channels: ['EMAIL'],
          priority: 'NORMAL'
        })
      );
    }

    const results = await Promise.allSettled(promises);
    const endTime = performance.now();

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    const avgResponseTime = (endTime - startTime) / concurrentRequests;

    expect(successful).toBeGreaterThan(95); // 95% success rate
    expect(avgResponseTime).toBeLessThan(1000); // Under 1 second average
    
    console.log(`Stress Test Results:
      - Concurrent Requests: ${concurrentRequests}
      - Successful: ${successful}
      - Failed: ${failed}
      - Average Response Time: ${avgResponseTime.toFixed(2)}ms
    `);
  });
});
```

## 🔧 Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  displayName: 'Classified Ads Backend',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: [
    '<rootDir>/tests/unit/**/*.spec.ts',
    '<rootDir>/tests/integration/**/*.spec.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/**/*.module.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testTimeout: 10000
};
```

### Test Setup File

```typescript
// tests/setup.ts
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Setup test database
  await setupTestDatabase();
  
  // Setup mock services
  await setupMockServices();
});

afterAll(async () => {
  // Cleanup
  await cleanupTestDatabase();
});

// Mock external services
jest.mock('@/infrastructure/external/email-service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({ success: true, messageId: 'mock-id' })
  }))
}));
```

## 📊 Test Metrics and Reporting

### Coverage Reports

```bash
# Generate coverage report
npm run test:cov

# View coverage in browser
npm run test:cov:open
```

### Test Reports

```typescript
// tests/reporters/custom-reporter.js
class CustomTestReporter {
  onTestResult(test, testResult) {
    const { testFilePath, testResults } = testResult;
    
    // Log test results
    console.log(`Test File: ${testFilePath}`);
    console.log(`Tests: ${testResults.length}`);
    console.log(`Passed: ${testResults.filter(t => t.status === 'passed').length}`);
    console.log(`Failed: ${testResults.filter(t => t.status === 'failed').length}`);
  }
}

module.exports = CustomTestReporter;
```

## 🚀 Continuous Integration

### GitHub Actions Test Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test_db

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
```

## 📝 Test Documentation

### Test Naming Conventions

```typescript
// Good test naming
describe('NotificationEntity', () => {
  describe('when creating a new notification', () => {
    it('should set status to PENDING by default', () => {
      // Test implementation
    });
    
    it('should throw error when recipientId is invalid', () => {
      // Test implementation
    });
  });
  
  describe('when marking notification as sent', () => {
    it('should update status to SENT', () => {
      // Test implementation
    });
    
    it('should set sentAt timestamp', () => {
      // Test implementation
    });
  });
});
```

### Test Data Builders

```typescript
// tests/builders/notification-builder.ts
export class NotificationBuilder {
  private data: Partial<NotificationData> = {};

  static create(): NotificationBuilder {
    return new NotificationBuilder();
  }

  withRecipient(recipientId: string): NotificationBuilder {
    this.data.recipientId = recipientId;
    return this;
  }

  withType(type: NotificationType): NotificationBuilder {
    this.data.type = type;
    return this;
  }

  withTitle(title: string): NotificationBuilder {
    this.data.title = title;
    return this;
  }

  build(): NotificationEntity {
    const defaultData = {
      recipientId: 'default-user-id',
      type: NotificationType.POST_CREATED,
      title: 'Default Title',
      message: 'Default message',
      channels: [DeliveryChannel.EMAIL],
      priority: NotificationPriority.NORMAL
    };

    return NotificationEntity.create({ ...defaultData, ...this.data });
  }
}

// Usage in tests
const notification = NotificationBuilder
  .create()
  .withRecipient('user-123')
  .withType(NotificationType.USER_WELCOME)
  .withTitle('Welcome!')
  .build();
```

## 🎯 Testing Best Practices

### 1. Test Structure (AAA Pattern)
```typescript
it('should calculate total price with tax', () => {
  // Arrange
  const price = 100;
  const taxRate = 0.1;
  
  // Act
  const total = calculateTotalPrice(price, taxRate);
  
  // Assert
  expect(total).toBe(110);
});
```

### 2. Test Independence
```typescript
// Good - Each test is independent
beforeEach(() => {
  notification = NotificationBuilder.create().build();
});

// Bad - Tests depend on each other
let sharedNotification: NotificationEntity;
```

### 3. Clear Assertions
```typescript
// Good - Specific assertions
expect(notification.status.value).toBe('SENT');
expect(notification.sentAt).toBeInstanceOf(Date);

// Bad - Generic assertions
expect(notification).toBeTruthy();
```

## 📋 Testing Checklist

### For Each Feature
- [ ] Unit tests for domain logic
- [ ] Integration tests for API endpoints
- [ ] Repository tests for data operations
- [ ] Error handling tests
- [ ] Edge case testing
- [ ] Performance impact assessment

### Before Release
- [ ] All tests passing
- [ ] Coverage thresholds met (80%+)
- [ ] E2E tests for critical paths
- [ ] Performance tests completed
- [ ] Security testing performed
- [ ] Documentation updated

## 🔗 Related Documentation

- [Quick Start Guide](../implementation/quick-start.md)
- [API Documentation](../api/)
- [System Architecture](../architecture/system-overview.md)
- [Deployment Guide](../deployment/) 