# Environment Variables Documentation

This document provides comprehensive information about all environment variables used in the Classified Ads Backend application across different environments.

## 📋 Quick Setup

1. Copy the appropriate environment file:
   ```bash
   # Development
   cp env.example .env
   # OR copy specific environment
   cp env.development .env
   ```

2. Fill in the required values (marked as empty in the template)
3. Restart your application

## 🌍 Environment Files

| File | Purpose | Description |
|------|---------|-------------|
| `env.example` | Template | Complete template with all variables |
| `env.development` | Development | Local development settings |
| `env.staging` | Staging | Pre-production testing |
| `env.production` | Production | Live production settings |
| `env.test` | Testing | Unit/integration testing |

## 📊 Environment Variable Categories

### 🚀 Application Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ✅ | development | Environment mode (development/staging/production/test) |
| `PORT` | ✅ | 3000 | Application port |
| `APP_NAME` | ❌ | Classified Ads Backend | Application name |
| `APP_VERSION` | ❌ | 1.0.0 | Application version |
| `APP_URL` | ✅ | - | Backend URL (used for callbacks) |
| `FRONTEND_URL` | ✅ | - | Frontend URL (used for CORS and redirects) |

### 🗄️ Database Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_HOST` | ✅ | localhost | PostgreSQL host |
| `DB_PORT` | ✅ | 5432 | PostgreSQL port |
| `DB_USERNAME` | ✅ | - | Database username |
| `DB_PASSWORD` | ✅ | - | Database password |
| `DB_DATABASE` | ✅ | - | Database name |
| `DB_SYNCHRONIZE` | ❌ | false | Auto-sync entities (dev only) |
| `DB_LOGGING` | ❌ | false | Enable SQL logging |
| `DB_MIGRATIONS_RUN` | ❌ | false | Auto-run migrations |

### 🔐 Authentication & Security

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | ✅ | - | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | ❌ | 7d | JWT token expiration |
| `JWT_REFRESH_SECRET` | ✅ | - | Refresh token secret |
| `JWT_REFRESH_EXPIRES_IN` | ❌ | 30d | Refresh token expiration |
| `BCRYPT_SALT_ROUNDS` | ❌ | 10 | Password hashing rounds |
| `SESSION_SECRET` | ✅ | - | Session signing secret |

### 🔥 Firebase Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FIREBASE_PROJECT_ID` | ✅ | - | Firebase project ID |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | ✅ | - | Service account JSON file path |
| `FIREBASE_WEB_API_KEY` | ❌ | - | Firebase web API key |
| `FIREBASE_AUTH_DOMAIN` | ❌ | - | Firebase auth domain |
| `FIREBASE_STORAGE_BUCKET` | ❌ | - | Firebase storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | ❌ | - | FCM sender ID |
| `FIREBASE_APP_ID` | ❌ | - | Firebase app ID |
| `FIREBASE_MEASUREMENT_ID` | ❌ | - | Google Analytics measurement ID |

### ☁️ Google Cloud Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLOUD_PROJECT_ID` | ✅ | - | GCP project ID |
| `GOOGLE_CLOUD_KEY_FILE` | ✅ | - | GCP service account key file |
| `GOOGLE_CLOUD_STORAGE_BUCKET` | ❌ | - | Cloud Storage bucket |
| `GOOGLE_CLOUD_LOCATION` | ❌ | us-central1 | GCP region |

### 🔴 Redis Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_HOST` | ✅ | localhost | Redis host |
| `REDIS_PORT` | ✅ | 6379 | Redis port |
| `REDIS_PASSWORD` | ❌ | - | Redis password |
| `REDIS_DB` | ❌ | 0 | Redis database number |
| `REDIS_URL` | ❌ | - | Complete Redis URL (overrides other Redis settings) |
| `REDIS_MAX_RETRIES` | ❌ | 3 | Connection retry attempts |
| `REDIS_RETRY_DELAY` | ❌ | 3000 | Retry delay in ms |
| `REDIS_KEY_PREFIX` | ❌ | classified_ads: | Key prefix for namespacing |

### 📧 Email Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | ✅ | - | SMTP server host |
| `SMTP_PORT` | ✅ | 587 | SMTP server port |
| `SMTP_SECURE` | ❌ | false | Use TLS/SSL |
| `SMTP_USER` | ✅ | - | SMTP username |
| `SMTP_PASSWORD` | ✅ | - | SMTP password |
| `SMTP_FROM_NAME` | ❌ | Classified Ads | Sender name |
| `SMTP_FROM_EMAIL` | ✅ | - | Sender email |

#### Alternative Email Services

| Service | Variables |
|---------|-----------|
| **SendGrid** | `SENDGRID_API_KEY` |
| **Mailgun** | `MAILGUN_API_KEY`, `MAILGUN_DOMAIN` |
| **AWS SES** | `SES_ACCESS_KEY_ID`, `SES_SECRET_ACCESS_KEY`, `SES_REGION` |

### 📱 SMS Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TWILIO_ACCOUNT_SID` | ❌ | - | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | ❌ | - | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | ❌ | - | Twilio phone number |
| `TWILIO_MESSAGING_SERVICE_SID` | ❌ | - | Twilio messaging service SID |

#### Alternative SMS Services

| Service | Variables |
|---------|-----------|
| **Nexmo/Vonage** | `NEXMO_API_KEY`, `NEXMO_API_SECRET`, `NEXMO_FROM_NUMBER` |

### 🔔 Push Notifications

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FIREBASE_SERVER_KEY` | ❌ | - | Firebase server key for FCM |
| `VAPID_PUBLIC_KEY` | ❌ | - | VAPID public key for web push |
| `VAPID_PRIVATE_KEY` | ❌ | - | VAPID private key |
| `VAPID_SUBJECT` | ❌ | - | VAPID subject (email or URL) |

#### Apple Push Notifications

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APNS_KEY_ID` | ❌ | - | APNs key ID |
| `APNS_TEAM_ID` | ❌ | - | Apple team ID |
| `APNS_BUNDLE_ID` | ❌ | - | App bundle ID |
| `APNS_KEY_PATH` | ❌ | - | APNs private key file path |
| `APNS_PRODUCTION` | ❌ | false | Use production APNs environment |

### 📁 File Storage

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STORAGE_TYPE` | ❌ | local | Storage type (local/s3) |
| `STORAGE_LOCAL_PATH` | ❌ | ./uploads | Local storage path |
| `STORAGE_MAX_FILE_SIZE` | ❌ | 10485760 | Max file size in bytes (10MB) |
| `STORAGE_ALLOWED_TYPES` | ❌ | image/jpeg,image/png,image/gif,application/pdf | Allowed MIME types |

#### AWS S3 Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | ❌ | - | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | ❌ | - | AWS secret key |
| `AWS_REGION` | ❌ | us-east-1 | AWS region |
| `AWS_S3_BUCKET` | ❌ | - | S3 bucket name |
| `AWS_S3_ACL` | ❌ | public-read | S3 object ACL |

### 🚦 Rate Limiting

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `THROTTLE_TTL` | ❌ | 60000 | Rate limit window in ms |
| `THROTTLE_LIMIT` | ❌ | 100 | Max requests per window |
| `THROTTLE_SKIP_IF` | ❌ | - | Function to skip throttling |
| `THROTTLE_SKIP_SUCCESS_IF` | ❌ | - | Function to skip on success |

### 📊 Monitoring & Logging

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LOG_LEVEL` | ❌ | debug | Log level (error/warn/info/debug) |
| `LOG_FORMAT` | ❌ | combined | Log format |
| `LOG_FILE_PATH` | ❌ | ./logs | Log file directory |
| `LOG_MAX_SIZE` | ❌ | 10m | Max log file size |
| `LOG_MAX_FILES` | ❌ | 5 | Max log files to keep |
| `LOG_DATE_PATTERN` | ❌ | YYYY-MM-DD | Log file date pattern |

#### Error Tracking

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENTRY_DSN` | ❌ | - | Sentry DSN for error tracking |
| `SENTRY_ENVIRONMENT` | ❌ | - | Sentry environment |
| `SENTRY_RELEASE` | ❌ | - | Sentry release version |

#### Application Performance Monitoring

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEW_RELIC_LICENSE_KEY` | ❌ | - | New Relic license key |
| `NEW_RELIC_APP_NAME` | ❌ | - | New Relic app name |
| `DATADOG_API_KEY` | ❌ | - | Datadog API key |

### 💳 Payment Processing

#### Stripe

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STRIPE_PUBLIC_KEY` | ❌ | - | Stripe publishable key |
| `STRIPE_SECRET_KEY` | ❌ | - | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | ❌ | - | Stripe webhook secret |
| `STRIPE_ENDPOINT_SECRET` | ❌ | - | Stripe endpoint secret |

#### PayPal

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PAYPAL_CLIENT_ID` | ❌ | - | PayPal client ID |
| `PAYPAL_CLIENT_SECRET` | ❌ | - | PayPal client secret |
| `PAYPAL_MODE` | ❌ | sandbox | PayPal mode (sandbox/live) |

### 🔗 Social Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | ❌ | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ❌ | - | Google OAuth client secret |
| `FACEBOOK_APP_ID` | ❌ | - | Facebook app ID |
| `FACEBOOK_APP_SECRET` | ❌ | - | Facebook app secret |
| `TWITTER_CONSUMER_KEY` | ❌ | - | Twitter consumer key |
| `TWITTER_CONSUMER_SECRET` | ❌ | - | Twitter consumer secret |
| `GITHUB_CLIENT_ID` | ❌ | - | GitHub client ID |
| `GITHUB_CLIENT_SECRET` | ❌ | - | GitHub client secret |

### 🌍 Geolocation Services

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MAPBOX_ACCESS_TOKEN` | ❌ | - | Mapbox access token |
| `GOOGLE_MAPS_API_KEY` | ❌ | - | Google Maps API key |
| `OPENCAGE_API_KEY` | ❌ | - | OpenCage geocoding API key |

### 🔍 Search Services

#### Elasticsearch

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ELASTICSEARCH_URL` | ❌ | - | Elasticsearch URL |
| `ELASTICSEARCH_USERNAME` | ❌ | - | Elasticsearch username |
| `ELASTICSEARCH_PASSWORD` | ❌ | - | Elasticsearch password |
| `ELASTICSEARCH_INDEX_PREFIX` | ❌ | classified_ads | Index prefix |

#### Algolia

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ALGOLIA_APP_ID` | ❌ | - | Algolia application ID |
| `ALGOLIA_API_KEY` | ❌ | - | Algolia API key |
| `ALGOLIA_SEARCH_KEY` | ❌ | - | Algolia search-only key |

### 📋 Caching

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CACHE_TTL` | ❌ | 3600 | Cache TTL in seconds |
| `CACHE_MAX_ITEMS` | ❌ | 1000 | Max cached items |
| `CACHE_STORE` | ❌ | memory | Cache store (memory/redis) |

### 🪝 Webhook Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WEBHOOK_SECRET` | ❌ | - | Webhook signing secret |
| `WEBHOOK_TIMEOUT` | ❌ | 5000 | Webhook timeout in ms |
| `WEBHOOK_MAX_RETRIES` | ❌ | 3 | Max webhook retry attempts |

### 🛡️ Content Moderation

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ❌ | - | OpenAI API key for content moderation |
| `PERSPECTIVE_API_KEY` | ❌ | - | Google Perspective API key |
| `AKISMET_API_KEY` | ❌ | - | Akismet API key for spam detection |

### 🌐 Internationalization

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DEFAULT_LANGUAGE` | ❌ | en | Default language code |
| `SUPPORTED_LANGUAGES` | ❌ | en,es,fr,de | Supported language codes |
| `TIMEZONE` | ❌ | UTC | Default timezone |

### 👨‍💼 Admin Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ADMIN_EMAIL` | ✅ | - | Default admin email |
| `ADMIN_PASSWORD` | ✅ | - | Default admin password |
| `ADMIN_FIRST_NAME` | ❌ | System | Admin first name |
| `ADMIN_LAST_NAME` | ❌ | Administrator | Admin last name |

### 💾 Backup Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BACKUP_ENABLED` | ❌ | false | Enable automated backups |
| `BACKUP_SCHEDULE` | ❌ | 0 2 * * * | Backup cron schedule |
| `BACKUP_RETENTION_DAYS` | ❌ | 30 | Backup retention period |
| `BACKUP_STORAGE_PATH` | ❌ | ./backups | Backup storage path |

### 🔔 Notification System

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NOTIFICATION_QUEUE_CONCURRENCY` | ❌ | 5 | Queue processing concurrency |
| `NOTIFICATION_RATE_LIMIT_PER_MINUTE` | ❌ | 1000 | Rate limit for notifications |
| `NOTIFICATION_RETRY_ATTEMPTS` | ❌ | 3 | Max retry attempts |
| `NOTIFICATION_RETRY_DELAY` | ❌ | 5000 | Retry delay in ms |
| `NOTIFICATION_BATCH_SIZE` | ❌ | 100 | Batch processing size |

#### Notification Channels

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_EMAIL_NOTIFICATIONS` | ❌ | true | Enable email notifications |
| `ENABLE_SMS_NOTIFICATIONS` | ❌ | true | Enable SMS notifications |
| `ENABLE_PUSH_NOTIFICATIONS` | ❌ | true | Enable push notifications |
| `ENABLE_WEBHOOK_NOTIFICATIONS` | ❌ | true | Enable webhook notifications |
| `ENABLE_IN_APP_NOTIFICATIONS` | ❌ | true | Enable in-app notifications |

### 🔗 API Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `API_VERSION` | ❌ | v1 | API version |
| `API_PREFIX` | ❌ | api | API prefix |
| `API_GLOBAL_PREFIX` | ❌ | api/v1 | Global API prefix |

### 🌐 CORS Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CORS_ORIGIN` | ✅ | - | Allowed origins (comma-separated) |
| `CORS_METHODS` | ❌ | GET,HEAD,PUT,PATCH,POST,DELETE | Allowed methods |
| `CORS_ALLOWED_HEADERS` | ❌ | Content-Type,Accept,Authorization | Allowed headers |
| `CORS_CREDENTIALS` | ❌ | true | Allow credentials |

### 🏥 Health Checks

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HEALTH_CHECK_ENABLED` | ❌ | true | Enable health checks |
| `HEALTH_CHECK_DATABASE_TIMEOUT` | ❌ | 1000 | DB health check timeout |
| `HEALTH_CHECK_REDIS_TIMEOUT` | ❌ | 1000 | Redis health check timeout |
| `HEALTH_CHECK_EXTERNAL_TIMEOUT` | ❌ | 5000 | External service timeout |

### 🚩 Feature Flags

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FEATURE_POST_MODERATION` | ❌ | true | Enable post moderation |
| `FEATURE_USER_VERIFICATION` | ❌ | true | Enable user verification |
| `FEATURE_PREMIUM_LISTINGS` | ❌ | true | Enable premium listings |
| `FEATURE_ANALYTICS_DASHBOARD` | ❌ | true | Enable analytics dashboard |
| `FEATURE_BULK_OPERATIONS` | ❌ | true | Enable bulk operations |
| `FEATURE_EXPORT_DATA` | ❌ | true | Enable data export |

## 🔒 Security Best Practices

### Required Secrets (MUST be set in production)

1. **JWT_SECRET** - Use a strong, random 256-bit key
2. **JWT_REFRESH_SECRET** - Different from JWT_SECRET
3. **SESSION_SECRET** - Random string for session signing
4. **DB_PASSWORD** - Strong database password
5. **REDIS_PASSWORD** - Redis authentication (if enabled)

### Environment-Specific Recommendations

#### Development
- Use `.env.development` with safe test values
- Keep secrets in local environment or `.env.local`
- Enable verbose logging and debugging

#### Staging
- Mirror production setup but with test data
- Use separate Firebase/GCP projects
- Enable monitoring but with lower retention

#### Production
- **NEVER** commit production secrets to git
- Use environment variables or secret management systems
- Enable all monitoring and logging
- Use strong passwords and rotate regularly
- Enable backups and disaster recovery

## 🚀 Quick Start Examples

### Minimal Development Setup

```bash
# Required for basic functionality
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=classified_ads_dev
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

### Production Checklist

- [ ] All required variables set
- [ ] Strong, unique secrets generated
- [ ] Database credentials secured
- [ ] Firebase/GCP projects configured
- [ ] Email/SMS services set up
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented
- [ ] SSL/TLS certificates configured

## 🔧 Troubleshooting

### Common Issues

1. **Firebase Connection Failed**
   - Check `FIREBASE_PROJECT_ID` and `FIREBASE_SERVICE_ACCOUNT_PATH`
   - Verify service account has proper permissions

2. **Database Connection Error**
   - Verify `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`
   - Check if database exists and is accessible

3. **Redis Connection Failed**
   - Check `REDIS_HOST` and `REDIS_PORT`
   - Verify Redis server is running

4. **Email/SMS Not Working**
   - Verify SMTP or service provider credentials
   - Check rate limits and quotas

### Environment Loading Issues

```bash
# Check if environment file is loaded
node -e "console.log(process.env.NODE_ENV)"

# Verify specific variable
node -e "console.log(process.env.JWT_SECRET ? 'Set' : 'Not Set')"
```

## 📞 Support

For questions about environment configuration:
1. Check this documentation first
2. Review the example files
3. Check application logs for specific error messages
4. Contact the development team with specific issues

---

*Last updated: $(date)* 