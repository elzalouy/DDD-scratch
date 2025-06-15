# Classified Ads Backend

A comprehensive NestJS backend for a classified ads platform with advanced features including post moderation, multi-language support, audit logging, notification system, and analytics dashboard.

## 🏗️ Architecture Overview

This backend is designed as a Technical Architect solution that addresses all the specified business requirements:

### Core Features

1. **Post Moderation System** - Admin approval workflow for all new posts
2. **Notification System** - Real-time alerts for post approvals/rejections
3. **Multi-language Support** - i18n for global expansion
4. **Audit Logging** - Complete user action tracking for transparency
5. **Location-based API** - Categorized ads by location and type
6. **Report Management** - User reporting system for abuse/misinformation
7. **Analytics Dashboard** - Usage metrics and growth monitoring
8. **Secure Data Storage** - Scalable PostgreSQL database design

### Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js
- **Queue System**: Bull with Redis
- **Internationalization**: nestjs-i18n
- **API Documentation**: Swagger/OpenAPI
- **Rate Limiting**: @nestjs/throttler
- **Validation**: class-validator & class-transformer

## 📋 Business Requirements Implementation

### 3.2.1 Admin Post Moderation
- ✅ All posts start with `PENDING` status
- ✅ Admin/Moderator approval workflow
- ✅ Rejection with reason tracking
- ✅ Moderation history and audit logs

### 3.2.2 Report Management System
- ✅ User reporting for abuse/misinformation
- ✅ Report categorization (spam, fraud, inappropriate, etc.)
- ✅ Admin review workflow
- ✅ Bulk report processing
- ✅ Report statistics and analytics

### 3.2.3 Analytics Dashboard
- ✅ Posts per day metrics
- ✅ Active user tracking
- ✅ Growth analytics
- ✅ Top categories and locations
- ✅ System health monitoring
- ✅ User retention metrics

### 3.2.4 Secure Data Storage
- ✅ PostgreSQL with proper indexing
- ✅ UUID primary keys for security
- ✅ Encrypted passwords with bcrypt
- ✅ Audit trail for all operations
- ✅ Soft deletes and data retention

### 3.2.5 Notification System
- ✅ Post approval/rejection notifications
- ✅ Report received notifications
- ✅ Queue-based processing with Bull
- ✅ Multiple notification types
- ✅ Read/unread status tracking

### 3.2.6 Multi-language Support
- ✅ nestjs-i18n integration
- ✅ Header, query, and cookie resolvers
- ✅ English and Spanish translations
- ✅ Extensible for additional languages

### 3.2.7 Audit Logging
- ✅ Complete user action tracking
- ✅ IP address and user agent logging
- ✅ Before/after value tracking
- ✅ Entity-specific audit trails
- ✅ Admin activity monitoring

### 3.2.8 Location-based API
- ✅ Hierarchical location structure
- ✅ Category-based filtering
- ✅ Advanced search with multiple filters
- ✅ Geolocation support (lat/lng)
- ✅ Performance-optimized queries

## 🗄️ Database Schema

### Core Entities

1. **Users** - Authentication and user management
2. **Posts** - Classified ads with moderation workflow
3. **Categories** - Hierarchical categorization
4. **Locations** - Hierarchical geographical organization
5. **Reports** - User reporting system
6. **Notifications** - User alert system
7. **AuditLogs** - Complete action tracking

### Key Relationships

- Users → Posts (One-to-Many)
- Categories → Posts (One-to-Many) with hierarchy
- Locations → Posts (One-to-Many) with hierarchy
- Posts → Reports (One-to-Many)
- Users → Reports (One-to-Many)
- Users → Notifications (One-to-Many)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd classified-ads-backend
npm install
```

2. **Environment Configuration**
```bash
# Copy environment template
cp env.example .env
# OR use environment-specific template
cp env.development .env

# For complete configuration guide, see:
# docs/implementation/environment-variables.md
```

3. **Database Setup**
```bash
# Create database
createdb classified_ads

# Run migrations (auto-generated from entities)
npm run start:dev
```

4. **Start the application**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Documentation

### Authentication Endpoints

```
POST /auth/register - User registration
POST /auth/login - User login
POST /auth/logout - User logout
GET /auth/profile - Get current user profile
```

### Posts Management

```
GET /posts - List posts with filters
POST /posts - Create new post
GET /posts/:id - Get post details
PUT /posts/:id - Update post
DELETE /posts/:id - Delete post

# Moderation (Admin/Moderator only)
POST /posts/:id/approve - Approve post
POST /posts/:id/reject - Reject post with reason
GET /posts/pending - Get pending posts for moderation
```

### Reports System

```
POST /reports - Create report
GET /reports - List reports (Admin only)
GET /reports/:id - Get report details
PUT /reports/:id/review - Review report (Admin only)
POST /reports/bulk-review - Bulk review reports
```

### Analytics Dashboard

```
GET /analytics/dashboard - Dashboard statistics
GET /analytics/posts - Posts analytics
GET /analytics/users - Users analytics
GET /analytics/system-health - System health check
```

### Notifications

```
GET /notifications - Get user notifications
PUT /notifications/:id/read - Mark notification as read
PUT /notifications/read-all - Mark all as read
DELETE /notifications/:id - Delete notification
```

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Rate Limiting** to prevent abuse
- **Input Validation** with class-validator
- **SQL Injection Protection** via TypeORM
- **Password Encryption** with bcrypt
- **Role-based Access Control** (User/Moderator/Admin)
- **Audit Logging** for security monitoring

## 🌍 Internationalization

The backend supports multiple languages through nestjs-i18n:

- **Language Detection**: Headers, query params, cookies
- **Fallback Language**: English (en)
- **Supported Languages**: English, Spanish (extensible)
- **Translation Files**: JSON-based in `/src/i18n/`

## 📊 Monitoring & Analytics

### Built-in Analytics

- **User Metrics**: Registration, activity, retention
- **Post Metrics**: Creation, approval rates, categories
- **System Metrics**: Performance, health checks
- **Report Metrics**: Abuse patterns, resolution rates

### Audit Trail

Every action is logged with:
- User identification
- Timestamp
- Action type (CREATE, UPDATE, DELETE, etc.)
- Entity affected
- Before/after values
- IP address and user agent

## 🔧 Configuration

### Environment Variables

For complete environment configuration including all available variables, security best practices, and environment-specific setups, see:

- **[Environment Variables Guide](docs/implementation/environment-variables.md)** - Complete configuration reference
- **[Environment Security Guide](docs/implementation/environment-security.md)** - Security best practices

Quick setup:
```bash
# Copy template and configure
cp env.development .env
# Edit .env with your values
```

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set strong JWT_SECRET
   - Configure production database
   - Set NODE_ENV=production

2. **Database**
   - Run migrations
   - Set up database backups
   - Configure connection pooling

3. **Security**
   - Enable HTTPS
   - Configure CORS
   - Set up rate limiting
   - Review audit logs

4. **Monitoring**
   - Set up health checks
   - Configure logging
   - Monitor performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs` when running
- Review the audit logs for debugging

---

**Built with ❤️ using NestJS and TypeScript**
