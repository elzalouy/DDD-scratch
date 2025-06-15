# 🔔 Notifications API Documentation

## Overview

The Notifications API provides endpoints for sending, scheduling, and managing notifications across multiple delivery channels including email, SMS, push notifications, webhooks, and in-app messages.

## Base URL

```
POST /notifications
```

## Authentication

All notification endpoints require authentication via JWT token:

```bash
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Send Notification

Send a single notification to a recipient.

```http
POST /notifications/send
```

#### Request Body

```json
{
  "recipientId": "123e4567-e89b-12d3-a456-426614174000",
  "type": "POST_APPROVED",
  "title": "Your post has been approved!",
  "message": "Your classified ad 'Vintage Camera' has been approved and is now live.",
  "channels": ["EMAIL", "PUSH"],
  "priority": "NORMAL",
  "scheduledAt": "2024-12-31T10:00:00Z",
  "templateId": "post-approval-template",
  "templateVariables": {
    "postTitle": "Vintage Camera",
    "username": "john_doe",
    "expiryDate": "2024-01-31"
  },
  "metadata": {
    "source": "web",
    "campaign": "user-engagement"
  },
  "expiresAt": "2024-02-01T00:00:00Z",
  "maxRetries": 3
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recipientId` | string | ✅ | UUID of the recipient user |
| `type` | string | ✅ | Notification type (see [Types](#notification-types)) |
| `title` | string | ✅ | Notification title (max 100 chars) |
| `message` | string | ✅ | Notification message (max 2000 chars) |
| `channels` | array | ✅ | Delivery channels (see [Channels](#delivery-channels)) |
| `priority` | string | ❌ | Priority level (default: NORMAL) |
| `scheduledAt` | datetime | ❌ | Schedule for future delivery |
| `templateId` | string | ❌ | Template ID for dynamic content |
| `templateVariables` | object | ❌ | Variables for template rendering |
| `metadata` | object | ❌ | Additional metadata |
| `expiresAt` | datetime | ❌ | Notification expiry time |
| `maxRetries` | number | ❌ | Maximum retry attempts (1-10) |

#### Response

```json
{
  "notificationId": "456e7890-e89b-12d3-a456-426614174001",
  "status": "QUEUED",
  "message": "Notification queued successfully",
  "queuedAt": "2024-01-15T10:30:00Z"
}
```

#### Example

```bash
curl -X POST http://localhost:3000/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "recipientId": "123e4567-e89b-12d3-a456-426614174000",
    "type": "POST_APPROVED",
    "title": "Your post has been approved!",
    "message": "Your classified ad is now live.",
    "channels": ["EMAIL", "PUSH"],
    "priority": "NORMAL"
  }'
```

### 2. Send Batch Notifications

Send multiple notifications in a single request.

```http
POST /notifications/batch
```

#### Request Body

```json
{
  "notifications": [
    {
      "recipientId": "user1-uuid",
      "type": "USER_WELCOME",
      "title": "Welcome!",
      "message": "Welcome to our platform",
      "channels": ["EMAIL"]
    },
    {
      "recipientId": "user2-uuid",
      "type": "POST_CREATED",
      "title": "Post Created",
      "message": "Your post is under review",
      "channels": ["EMAIL", "PUSH"]
    }
  ]
}
```

#### Response

```json
{
  "queuedCount": 2,
  "notificationIds": [
    "456e7890-e89b-12d3-a456-426614174001",
    "456e7890-e89b-12d3-a456-426614174002"
  ],
  "queuedAt": "2024-01-15T10:30:00Z"
}
```

### 3. Get Notification Status

Get the current status and delivery attempts of a notification.

```http
GET /notifications/{notificationId}/status
```

#### Response

```json
{
  "notificationId": "456e7890-e89b-12d3-a456-426614174001",
  "status": "SENT",
  "createdAt": "2024-01-15T10:30:00Z",
  "deliveryAttempts": [
    {
      "channel": "EMAIL",
      "attemptedAt": "2024-01-15T10:30:15Z",
      "success": true,
      "externalId": "ses-message-id-123",
      "responseTime": 245
    },
    {
      "channel": "PUSH",
      "attemptedAt": "2024-01-15T10:30:20Z",
      "success": true,
      "externalId": "fcm-message-id-456",
      "responseTime": 180
    }
  ]
}
```

### 4. Get Notification History

Retrieve notification history with filtering and pagination.

```http
GET /notifications/history
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `recipientId` | string | Filter by recipient ID |
| `status` | string | Filter by status |
| `type` | string | Filter by notification type |
| `startDate` | datetime | Filter from date |
| `endDate` | datetime | Filter to date |

#### Response

```json
{
  "notifications": [
    {
      "notificationId": "456e7890-e89b-12d3-a456-426614174001",
      "recipientId": "123e4567-e89b-12d3-a456-426614174000",
      "type": "POST_APPROVED",
      "status": "SENT",
      "title": "Your post has been approved!",
      "createdAt": "2024-01-15T10:30:00Z",
      "sentAt": "2024-01-15T10:30:25Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

### 5. Get Analytics

Get notification analytics and statistics.

```http
GET /notifications/analytics
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | datetime | Analytics start date |
| `endDate` | datetime | Analytics end date |
| `groupBy` | string | Group by period (hour, day, week, month) |

#### Response

```json
{
  "totalNotifications": 1250,
  "successRate": 98.5,
  "averageDeliveryTime": 2.3,
  "channelBreakdown": {
    "EMAIL": 650,
    "PUSH": 400,
    "SMS": 150,
    "IN_APP": 50
  },
  "typeBreakdown": {
    "POST_APPROVED": 400,
    "USER_WELCOME": 300,
    "POST_CREATED": 250,
    "SECURITY_ALERT": 150,
    "PROMOTIONAL": 150
  },
  "statusBreakdown": {
    "SENT": 1231,
    "FAILED": 19
  },
  "timeline": [
    {
      "date": "2024-01-15",
      "sent": 125,
      "failed": 2
    }
  ]
}
```

### 6. Health Check

Check the health status of the notification system.

```http
GET /notifications/health
```

#### Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "firestore": true,
    "pubsub": true,
    "firebase": true,
    "redis": true
  },
  "metrics": {
    "queueDepth": 5,
    "processingRate": 150.5,
    "errorRate": 0.02
  }
}
```

## Reference

### Notification Types

| Type | Description |
|------|-------------|
| `POST_CREATED` | Post has been created |
| `POST_APPROVED` | Post has been approved |
| `POST_REJECTED` | Post has been rejected |
| `POST_EXPIRED` | Post has expired |
| `USER_WELCOME` | Welcome new user |
| `USER_VERIFICATION` | Email verification |
| `PASSWORD_RESET` | Password reset request |
| `SYSTEM_MAINTENANCE` | System maintenance notice |
| `PROMOTIONAL` | Promotional content |
| `SECURITY_ALERT` | Security-related alert |

### Delivery Channels

| Channel | Description | Rate Limit |
|---------|-------------|------------|
| `EMAIL` | Email notifications | 10,000/hour |
| `SMS` | Text message notifications | 1,000/hour |
| `PUSH` | Push notifications | 50,000/hour |
| `WEBHOOK` | HTTP webhook delivery | 5,000/hour |
| `IN_APP` | In-application notifications | 100,000/hour |

### Priority Levels

| Priority | Description | Processing Order |
|----------|-------------|------------------|
| `LOW` | Low priority | 1 |
| `NORMAL` | Normal priority | 2 |
| `HIGH` | High priority | 3 |
| `URGENT` | Urgent notifications | 4 |
| `CRITICAL` | Critical alerts | 5 |

### Notification Status

| Status | Description |
|--------|-------------|
| `PENDING` | Queued for processing |
| `SCHEDULED` | Scheduled for future delivery |
| `PROCESSING` | Currently being processed |
| `SENT` | Successfully delivered |
| `FAILED` | Failed to deliver |
| `RETRY` | Queued for retry |
| `EXPIRED` | Expired before delivery |
| `CANCELLED` | Cancelled by user |

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "recipientId must be a UUID",
    "title should not be empty"
  ],
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 429 Too Many Requests

```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded",
  "error": "Too Many Requests",
  "retryAfter": 60
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /notifications/send` | 100 requests | 1 minute |
| `POST /notifications/batch` | 10 requests | 1 minute |
| `GET /notifications/*` | 1000 requests | 1 minute |

## SDK Examples

### JavaScript/TypeScript

```typescript
import { NotificationClient } from 'classified-ads-sdk';

const client = new NotificationClient({
  baseURL: 'http://localhost:3000',
  apiKey: 'your-api-key'
});

// Send notification
const notification = await client.notifications.send({
  recipientId: 'user-uuid',
  type: 'POST_APPROVED',
  title: 'Your post has been approved!',
  message: 'Your classified ad is now live.',
  channels: ['EMAIL', 'PUSH']
});

console.log('Notification ID:', notification.notificationId);
```

### Python

```python
from classified_ads_sdk import NotificationClient

client = NotificationClient(
    base_url='http://localhost:3000',
    api_key='your-api-key'
)

# Send notification
notification = client.notifications.send(
    recipient_id='user-uuid',
    type='POST_APPROVED',
    title='Your post has been approved!',
    message='Your classified ad is now live.',
    channels=['EMAIL', 'PUSH']
)

print(f"Notification ID: {notification.notification_id}")
```

## Webhooks

### Notification Status Updates

You can configure webhooks to receive real-time updates about notification status:

```json
{
  "eventType": "notification.sent",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "notificationId": "456e7890-e89b-12d3-a456-426614174001",
    "recipientId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "SENT",
    "channel": "EMAIL",
    "deliveryTime": 2.5
  }
}
```

## Testing

Use the notification system's test mode for development:

```bash
# Enable test mode
NOTIFICATION_TEST_MODE=true

# Test notifications won't be delivered but will be processed
curl -X POST http://localhost:3000/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Test-Mode: true" \
  -d '{ ... }'
``` 