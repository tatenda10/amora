# Amora AI Companion - System Architecture

## Overview
Amora is an AI companion application that allows users to chat with personalized AI companions. The system consists of a React Native mobile app, a React admin panel, and a Node.js backend with OpenAI integration.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                AMORA AI COMPANION                              │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MOBILE APP    │    │   ADMIN PANEL   │    │   BACKEND API   │
│  (React Native) │    │   (React.js)    │    │  (Node.js/Exp)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY LAYER                                │
│  • Authentication (JWT)                                                       │
│  • Rate Limiting                                                              │
│  • CORS Handling                                                              │
│  • Request/Response Logging                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SERVICE LAYER                                    │
│                                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │  Auth Service   │  │ OpenAI Service  │  │ File Upload     │              │
│  │  • Login        │  │  • AI Response  │  │  • Image Proc   │              │
│  │  • JWT Verify   │  │  • Context Mgmt │  │  • Storage      │              │
│  │  • Role Check   │  │  • Prompt Eng   │  │  • Validation   │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Socket Service  │  │ Notification    │  │ Matching        │              │
│  │  • Real-time    │  │  • Push Notif   │  │  • Algorithm    │              │
│  │  • Chat Events  │  │  • Email        │  │  • Scoring      │              │
│  │  • Presence     │  │  • In-app       │  │  • Filters      │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CONTROLLER LAYER                                 │
│                                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Auth Controller │  │ Companion Ctrl  │  │ Conversation    │              │
│  │  • Login/Logout │  │  • CRUD Ops     │  │  • Chat Mgmt    │              │
│  │  • Registration │  │  • Image Upload │  │  • AI Response  │              │
│  │  • User Mgmt    │  │  • Validation   │  │  • Real-time    │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Matching Ctrl   │  │ Notification    │  │ Admin Controller│              │
│  │  • Algorithm    │  │  • CRUD Ops     │  │  • Dashboard    │              │
│  │  • Scoring      │  │  • Delivery     │  │  • Analytics    │              │
│  │  • Filters      │  │  • Templates    │  │  • Settings     │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA ACCESS LAYER                                │
│                                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ MySQL Database  │  │ File Storage    │  │ Redis Cache     │              │
│  │  • Users        │  │  • Images       │  │  • Sessions     │              │
│  │  • Companions   │  • Audio/Video     │  │  • Chat Cache   │              │
│  │  • Messages     │  │  • Documents    │  │  • Rate Limits  │              │
│  │  • Conversations│  │  • Backups      │  │  • Analytics    │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SERVICES                                │
│                                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   OpenAI API    │  │   Cloud Storage │  │   Email Service │              │
│  │  • GPT-4        │  │  • AWS S3       │  │  • SendGrid     │              │
│  │  • DALL-E       │  │  • Google Cloud │  │  • Mailgun      │              │
│  │  • Whisper      │  │  • Azure Blob   │  │  • SMTP         │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Push Notif      │  │ Analytics       │  │ Payment Gateway │              │
│  │  • FCM          │  │  • Google       │  │  • Stripe       │              │
│  │  • APNS         │  │  • Mixpanel     │  │  • PayPal       │              │
│  │  • OneSignal    │  │  • Amplitude    │  │  • Square       │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Applications

#### Mobile App (React Native)
- **Technology**: React Native with Expo
- **Key Features**:
  - User authentication and profile management
  - Companion browsing and selection
  - Real-time chat interface
  - Push notifications
  - Offline support
- **Key Screens**:
  - Splash Screen
  - Onboarding (Basic Info, Preferences)
  - Companion Matching
  - Chat Interface
  - Profile Management

#### Admin Panel (React.js)
- **Technology**: React with Tailwind CSS
- **Key Features**:
  - Companion management (CRUD)
  - User analytics and insights
  - System configuration
  - Content moderation
- **Key Pages**:
  - Dashboard
  - Companion Management
  - Settings
  - Analytics

### 2. Backend Services

#### API Gateway
- **Authentication**: JWT-based with role-based access
- **Rate Limiting**: Per-user and per-endpoint limits
- **CORS**: Configured for mobile and web clients
- **Logging**: Request/response logging for debugging

#### Core Services

**Authentication Service**
- User registration and login
- JWT token generation and validation
- Role-based access control
- Password hashing with bcrypt

**OpenAI Service**
- AI response generation for companions
- Context management and conversation history
- Prompt engineering for personality consistency
- Usage tracking and cost management

**File Upload Service**
- Image processing and optimization
- File validation and security checks
- Cloud storage integration
- CDN delivery

**Socket Service**
- Real-time chat functionality
- User presence tracking
- Typing indicators
- Message delivery status

**Notification Service**
- Push notifications (FCM, APNS)
- Email notifications
- In-app notifications
- Notification preferences

**Matching Service**
- Companion recommendation algorithm
- User preference matching
- Scoring and ranking
- Filter management

### 3. Data Layer

#### Database Schema (MySQL)
```sql
-- Core Tables
users (id, username, email, password_hash, role, created_at, updated_at)
companions (id, name, age, gender, personality, traits, interests, backstory, profile_image_url, gallery_images, created_at, updated_at)
conversations (id, user_id, companion_id, title, created_at, updated_at)
messages (id, conversation_id, sender_type, sender_id, content, message_type, is_read, created_at, updated_at)

-- Supporting Tables
notifications (id, user_id, conversation_id, type, title, message, is_read, created_at)
companion_selections (id, user_id, companion_id, selection_reason, created_at)
system_users (id, username, password, role, is_active, last_login, created_at)
```

#### File Storage
- **Local Storage**: Development environment
- **Cloud Storage**: Production (AWS S3, Google Cloud Storage)
- **CDN**: Fast delivery of static assets
- **Backup**: Automated backup strategies

### 4. External Integrations

#### OpenAI Integration
- **Models**: GPT-4 for text generation
- **Features**: 
  - Context-aware conversations
  - Personality consistency
  - Multi-turn dialogue
  - Usage optimization

#### Push Notifications
- **Firebase Cloud Messaging (FCM)**: Android
- **Apple Push Notification Service (APNS)**: iOS
- **OneSignal**: Cross-platform notifications

#### Analytics
- **Google Analytics**: User behavior tracking
- **Mixpanel**: Event tracking and funnels
- **Amplitude**: User journey analysis

### 5. Security Architecture

#### Authentication & Authorization
- JWT tokens with refresh mechanism
- Role-based access control (RBAC)
- API key management for external services
- Session management

#### Data Security
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

#### Infrastructure Security
- HTTPS/TLS encryption
- Rate limiting and DDoS protection
- File upload security
- Environment variable management

### 6. Deployment Architecture

#### Development Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local Dev     │    │   Local MySQL   │    │   Local Redis   │
│   (React Native)│    │   Database      │    │   Cache         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              LOCAL BACKEND                                    │
│  • Node.js/Express                                                            │
│  • Hot reloading                                                              │
│  • Debug logging                                                              │
│  • Local file storage                                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Production Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Cloud     │    │   Load Balancer │    │   Auto Scaling  │
│   Frontend      │    │   (NGINX)       │    │   Groups        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PRODUCTION BACKEND                               │
│  • Multiple Node.js instances                                                │
│  • Redis cluster for caching                                                 │
│  • MySQL master-slave replication                                            │
│  • Cloud storage (S3/GCS)                                                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7. Performance Optimization

#### Caching Strategy
- **Redis**: Session storage, chat cache, rate limiting
- **CDN**: Static assets, images, videos
- **Database**: Query optimization, indexing
- **Application**: Response caching, memoization

#### Scalability
- **Horizontal Scaling**: Multiple server instances
- **Load Balancing**: Traffic distribution
- **Database**: Read replicas, connection pooling
- **Microservices**: Service decomposition (future)

### 8. Monitoring & Observability

#### Logging
- **Application Logs**: Winston/Log4js
- **Access Logs**: NGINX/Apache
- **Error Tracking**: Sentry
- **Performance**: New Relic/Datadog

#### Metrics
- **System Metrics**: CPU, memory, disk usage
- **Application Metrics**: Response times, error rates
- **Business Metrics**: User engagement, conversion rates
- **AI Metrics**: OpenAI usage, cost tracking

### 9. Development Workflow

#### Version Control
- **Git**: Feature branches, pull requests
- **CI/CD**: Automated testing and deployment
- **Code Quality**: ESLint, Prettier, SonarQube

#### Testing Strategy
- **Unit Tests**: Jest for backend, React Testing Library for frontend
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Cypress for web, Detox for mobile
- **Performance Tests**: Load testing with Artillery

## Technology Stack Summary

### Frontend
- **Mobile**: React Native, Expo, React Navigation
- **Admin**: React.js, Tailwind CSS, React Router
- **State Management**: Context API, Redux (if needed)

### Backend
- **Runtime**: Node.js, Express.js
- **Database**: MySQL with mysql2
- **Cache**: Redis
- **File Storage**: Multer, Cloud Storage
- **Real-time**: Socket.IO

### AI & External Services
- **AI**: OpenAI GPT-4
- **Notifications**: FCM, APNS
- **Analytics**: Google Analytics, Mixpanel
- **Storage**: AWS S3/Google Cloud Storage

### DevOps & Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes (future)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, New Relic
- **Hosting**: AWS/GCP/Azure

This architecture provides a scalable, secure, and maintainable foundation for the Amora AI Companion application, with clear separation of concerns and modern development practices. 