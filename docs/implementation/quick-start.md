# 🚀 Quick Start Guide

Get the Classified Ads Backend up and running in minutes!

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Redis** (optional, for caching)
- **Git**

## 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd classified-ads-backend

# Install dependencies
npm install

# or with yarn
yarn install
```

## 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=classified_ads_dev
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Application
PORT=3000
NODE_ENV=development

# Notification System (if using Firebase)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

## 3. Database Setup

```bash
# Create database
createdb classified_ads_dev

# Run migrations
npm run migration:run

# Seed data (optional)
npm run seed
```

## 4. Start the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3000`

## 5. API Documentation

Once the application is running, you can access:

- **Swagger UI**: `http://localhost:3000/api`
- **API Documentation**: `http://localhost:3000/api-json`

## 6. Test the API

### Create a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create a Post
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Vintage Camera for Sale",
    "description": "Beautiful vintage camera in excellent condition",
    "price": 299.99,
    "currency": "USD",
    "categoryId": "electronics",
    "location": "New York, NY"
  }'
```

### Send a Notification
```bash
curl -X POST http://localhost:3000/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "recipientId": "user-uuid",
    "type": "POST_CREATED",
    "title": "Post Created Successfully",
    "message": "Your classified ad has been created and is under review.",
    "channels": ["EMAIL"]
  }'
```

## 7. Development Tools

### Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Testing
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### Database Operations
```bash
# Generate migration
npm run migration:generate -- -n CreateUserTable

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Show migrations
npm run migration:show
```

## 8. Docker Setup (Optional)

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build
```bash
# Build image
docker build -t classified-ads-backend .

# Run container
docker run -p 3000:3000 --env-file .env classified-ads-backend
```

## 9. Common Issues & Solutions

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check if database exists
psql -l | grep classified_ads_dev
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run start:dev
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

## 10. Next Steps

Once you have the application running:

1. **Explore the API**: Use Swagger UI to test endpoints
2. **Read the Architecture**: Check [System Architecture Overview](../architecture/system-overview.md)
3. **Understand DDD**: Review [DDD Architecture Guide](../architecture/ddd-architecture.md)
4. **Set up Notifications**: Follow [Notification System Setup](./notification-setup.md)
5. **Write Tests**: See [Testing Strategy](../testing/strategy.md)

## 🆘 Need Help?

- **Check the logs**: Look for error messages in the console
- **Review documentation**: Each module has detailed documentation
- **Check issues**: Look for similar issues in the repository
- **Ask for help**: Create an issue with detailed information

## 📚 Additional Resources

- [System Architecture Overview](../architecture/system-overview.md)
- [API Documentation](../api/)
- [Deployment Guide](../deployment/)
- [Testing Documentation](../testing/)

Happy coding! 🎉 