# 🚀 Deployment Guide

This guide covers deploying the Classified Ads Backend to production environments including Docker, Kubernetes, and cloud platforms.

## 📋 Prerequisites

- **Docker** (v20.10 or higher)
- **Kubernetes** (v1.21 or higher) - for K8s deployment
- **kubectl** configured for your cluster
- **Helm** (v3.0 or higher) - optional
- **Cloud Platform Access** (AWS/GCP/Azure)

## 🐳 Docker Deployment

### Single Container Deployment

#### 1. Build the Image

```bash
# Build production image
docker build -t classified-ads-backend:latest .

# Build with specific tag
docker build -t classified-ads-backend:v1.0.0 .
```

#### 2. Run with Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    image: classified-ads-backend:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_NAME=classified_ads
      - DATABASE_USERNAME=postgres
      - DATABASE_PASSWORD=secretpassword
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: classified_ads
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secretpassword
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### 3. Deploy

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## ☸️ Kubernetes Deployment

### Using Kubernetes Manifests

#### 1. Create Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: classified-ads
```

#### 2. Configuration and Secrets

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: classified-ads
data:
  NODE_ENV: "production"
  DATABASE_HOST: "postgres-service"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "classified_ads"
  REDIS_URL: "redis://redis-service:6379"
  PORT: "3000"

---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: classified-ads
type: Opaque
data:
  DATABASE_USERNAME: cG9zdGdyZXM=  # base64 encoded
  DATABASE_PASSWORD: c2VjcmV0cGFzc3dvcmQ=  # base64 encoded
  JWT_SECRET: c3VwZXItc2VjcmV0LWp3dC1rZXk=  # base64 encoded
```

#### 3. Application Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: classified-ads-backend
  namespace: classified-ads
  labels:
    app: classified-ads-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: classified-ads-backend
  template:
    metadata:
      labels:
        app: classified-ads-backend
    spec:
      containers:
      - name: app
        image: classified-ads-backend:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: classified-ads-backend-service
  namespace: classified-ads
spec:
  selector:
    app: classified-ads-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

#### 4. Database and Redis

```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: classified-ads
spec:
  serviceName: postgres-service
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:14
        env:
        - name: POSTGRES_DB
          value: classified_ads
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_USERNAME
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_PASSWORD
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi

---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: classified-ads
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

#### 5. Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: classified-ads-ingress
  namespace: classified-ads
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.classified-ads.com
    secretName: classified-ads-tls
  rules:
  - host: api.classified-ads.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: classified-ads-backend-service
            port:
              number: 80
```

#### 6. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n classified-ads

# View logs
kubectl logs -f deployment/classified-ads-backend -n classified-ads

# Scale deployment
kubectl scale deployment classified-ads-backend --replicas=5 -n classified-ads
```

### Using Helm Charts

Create a Helm chart for easier management:

```bash
# Create Helm chart
helm create classified-ads-backend

# Install chart
helm install classified-ads ./classified-ads-backend \
  --namespace classified-ads \
  --create-namespace \
  --set image.tag=v1.0.0 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=api.classified-ads.com

# Upgrade
helm upgrade classified-ads ./classified-ads-backend \
  --set image.tag=v1.1.0

# Rollback
helm rollback classified-ads 1
```

## ☁️ Cloud Platform Deployment

### AWS Deployment (EKS)

#### 1. Setup EKS Cluster

```bash
# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Create cluster
eksctl create cluster \
  --name classified-ads-cluster \
  --version 1.21 \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed
```

#### 2. Deploy Application

```bash
# Update kubeconfig
aws eks update-kubeconfig --region us-west-2 --name classified-ads-cluster

# Deploy using kubectl
kubectl apply -f k8s/

# Or use Helm
helm install classified-ads ./helm-chart
```

#### 3. Setup Load Balancer

```yaml
# aws-load-balancer-controller.yaml
apiVersion: v1
kind: Service
metadata:
  name: classified-ads-service
  namespace: classified-ads
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: nlb
    service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: 'true'
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: classified-ads-backend
```

### Google Cloud Platform (GKE)

#### 1. Setup GKE Cluster

```bash
# Create cluster
gcloud container clusters create classified-ads-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 10

# Get credentials
gcloud container clusters get-credentials classified-ads-cluster --zone us-central1-a
```

#### 2. Deploy Application

```bash
# Deploy
kubectl apply -f k8s/

# Setup ingress with Google Cloud Load Balancer
kubectl apply -f gcp-ingress.yaml
```

### Azure (AKS)

#### 1. Setup AKS Cluster

```bash
# Create resource group
az group create --name classified-ads-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group classified-ads-rg \
  --name classified-ads-cluster \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group classified-ads-rg --name classified-ads-cluster
```

## 🔧 Configuration Management

### Environment Variables

Create environment-specific configuration files:

```bash
# Production environment
cat > .env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_HOST=prod-postgres.example.com
DATABASE_PORT=5432
DATABASE_NAME=classified_ads_prod
DATABASE_USERNAME=app_user
DATABASE_PASSWORD=secure_password
JWT_SECRET=production-jwt-secret-key
REDIS_URL=redis://prod-redis.example.com:6379
NOTIFICATION_FIREBASE_PROJECT_ID=prod-firebase-project
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
EOF
```

### Configuration Management with ConfigMaps

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-prod
  namespace: classified-ads
data:
  config.yaml: |
    database:
      host: prod-postgres.example.com
      port: 5432
      name: classified_ads_prod
      ssl: true
      poolSize: 20
    
    redis:
      url: redis://prod-redis.example.com:6379
      ttl: 3600
    
    notification:
      firebase:
        projectId: prod-firebase-project
      rateLimit:
        email: 10000
        sms: 1000
        push: 50000
    
    security:
      cors:
        origin: ["https://classified-ads.com"]
      rateLimit:
        windowMs: 900000
        maxRequests: 1000
```

## 📊 Monitoring and Observability

### Health Checks

```typescript
// health-check endpoint
@Get('/health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  };
}
```

### Prometheus Metrics

```yaml
# monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'classified-ads-backend'
      static_configs:
      - targets: ['classified-ads-backend-service:80']
      metrics_path: '/metrics'
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Classified Ads Backend",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

## 🔒 Security

### SSL/TLS Configuration

```nginx
# nginx-ssl.conf
server {
    listen 443 ssl http2;
    server_name api.classified-ads.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: classified-ads-network-policy
  namespace: classified-ads
spec:
  podSelector:
    matchLabels:
      app: classified-ads-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

## 🚀 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: [v*]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build Docker image
      run: |
        docker build -t classified-ads-backend:${{ github.sha }} .
        docker tag classified-ads-backend:${{ github.sha }} classified-ads-backend:latest
    
    - name: Push to registry
      run: |
        echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
        docker push classified-ads-backend:${{ github.sha }}
        docker push classified-ads-backend:latest
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/classified-ads-backend app=classified-ads-backend:${{ github.sha }} -n classified-ads
        kubectl rollout status deployment/classified-ads-backend -n classified-ads
```

## 📈 Scaling

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: classified-ads-hpa
  namespace: classified-ads
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: classified-ads-backend
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Vertical Pod Autoscaler

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: classified-ads-vpa
  namespace: classified-ads
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: classified-ads-backend
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: app
      maxAllowed:
        cpu: 2
        memory: 4Gi
      minAllowed:
        cpu: 100m
        memory: 128Mi
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Pod Crashes

```bash
# Check pod status
kubectl get pods -n classified-ads

# Check logs
kubectl logs -f pod-name -n classified-ads

# Describe pod for events
kubectl describe pod pod-name -n classified-ads
```

#### 2. Database Connection Issues

```bash
# Test database connectivity
kubectl run -it --rm debug --image=postgres:14 --restart=Never -- psql -h postgres-service -U postgres -d classified_ads
```

#### 3. Memory Issues

```bash
# Check resource usage
kubectl top pods -n classified-ads

# Check resource limits
kubectl describe pod pod-name -n classified-ads
```

## 📋 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Health checks responding
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Security policies applied
- [ ] Performance testing completed
- [ ] Documentation updated
- [ ] Team notified

## 🔗 Related Documentation

- [System Architecture Overview](../architecture/system-overview.md)
- [Monitoring Setup](./monitoring.md)
- [Kubernetes Configuration](./kubernetes.md)
- [Security Guidelines](../security/README.md) 