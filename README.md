# Payment Link Platform - Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A robust backend service for a Payment Link Platform that enables merchants to create products and generate secure, shareable payment links for accepting Mobile Money (MoMo/OM) payments.

---

## 1. Project Overview

This backend service powers a **Payment Link Platform** that allows merchants to create products and generate secure, shareable payment links for accepting Mobile Money (MoMo or OM) payments.

### Core Responsibilities

The backend is responsible for:

- **Merchant Authentication & Authorization** - Secure user management with role-based access control 
- **Product & Payment Link Management** - CRUD operations for products with automatic payment link generation
- **Payment Processing** - For payment initialization and status tracking
- **Transaction Persistence** - Complete audit trail of all payment transactions
- **Receipt Generation** - Automated PDF receipt generation for successful payments
- **File Storage** - Cloud-based storage for product images and receipts via Cloudinary

### Architecture

The system follows a **RESTful API architecture** with:

- **Protected Endpoints** - Merchant dashboard operations requiring JWT authentication
- **Public Endpoints** - Payment pages accessible without authentication
- **Single Source of Truth** - Centralized payment state and transaction history management

The API is designed to be consumed by:
- Next.js frontend applications
- Third-party integrations

---

## 2. Tech Stack

### Backend Framework

**NestJS (Node.js + TypeScript)**
- Scalable, modular, and maintainable backend architecture
- Dependency Injection for clean code organization
- Built-in support for Guards, Interceptors, and Middleware

### Database

**PostgreSQL 16**
Relational database storing:
- Merchants
- Products
- Payments/Transactions
- Receipts

### ORM

**Prisma ORM v7**

### Authentication & Security

**JWT (JSON Web Tokens)**
- Stateless merchant authentication
- Protected route access via Guards


### File Storage

**Cloudinary**
- Product image storage and optimization
- PDF receipt storage and delivery
- CDN-backed file serving

### Email Service

**Nodemailer**
- Asynchronous email delivery for payment confirmations
- Non-blocking email processing
- Receipt email notifications

### API Design

**RESTful APIs**
- Clear separation between:
  - **Public endpoints** - Payment pages and product viewing
  - **Protected endpoints** - Merchant dashboard and admin operations
- Standard HTTP methods and status codes
---

## 3. How to Run the Project Locally

### Prerequisites

- **Node.js** (v20 or higher)
- **Docker** and **Docker Compose** installed and running on your machine
- **npm** package manager

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd payment-link-backend
```

### Step 2: Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration (for local development)
# Note: Docker Compose uses its own DATABASE_URL internally
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/payment_link?schema=public

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Payment API Configuration
PAYMENTBASE_URL=https://api-stage.xyz.com
PAYMENT_CLIENT_KEY=your-payment-client-key
PAYMENT_CLIENT_SECRET=your-payment-client-secret

# Cloudinary Configuration
CLOUD_NAME=your-cloudinary-cloud-name
API_KEY=your-cloudinary-api-key
API_SECRET=your-cloudinary-api-secret

# Email Configuration (Nodemailer)
MAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASS=your-email-password-or-app-password

# Application Base URL
APP_BASE_URL=http://localhost:4000
```

**Important Notes:**
- For values containing special characters (like `$`), wrap them in single quotes: `PAYMENT_CLIENT_SECRET='your$secret$here'`

### Step 3: Start Docker

Ensure Docker Desktop (or Docker Engine) is running on your machine:

```bash
# Verify Docker is running
docker --version
docker compose version
```

### Step 4: Build and Start Services

```bash
# Build and start all services (PostgreSQL, migrations, and app)
docker compose up --build

# Or run in detached mode (background)
docker compose up --build -d
```

This command will:
1. Build the NestJS application Docker image
2. Start PostgreSQL database container
3. Run database migrations automatically
4. Start the NestJS application

### Step 5: Verify Services are Running

```bash
# Check container status
docker compose ps

# View application logs
docker compose logs -f app

# View database logs
docker compose logs -f postgres
```

The application will be available at: **http://localhost:4000**

### Step 6: Create Default Admin User

Run the seed script to create a default admin user:

```bash
# From inside the Docker container
docker compose exec app npm run prisma:seed

# Or using Prisma CLI directly
docker compose exec app npx prisma db seed
```

**Default Admin Credentials:**
- Email: `admin@admin.com`
- Password: `Waterboy10`
- Role: `ADMIN`

**Note:** The seed script is idempotent - running it multiple times is safe. It will skip creation if the admin already exists.

### Additional Docker Commands

```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes database data)
docker compose down -v


# Access Prisma Studio (Database GUI)
docker compose --profile tools up prisma-studio
# Then open: http://localhost:5555

# Execute commands inside the app container
docker compose exec app <command>
# Example: docker compose exec app npm run prisma:studio
```

### Running Without Docker (Local Development)

If you prefer to run locally without Docker:

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run database migrations (requires local PostgreSQL)
npm run prisma:migrate

# Start development server
npm run start:dev
```

**Note:** You'll need a local PostgreSQL instance running and configured in your `.env` file.

---

## 4. Assumptions Made

### Product & Payment Link Management

- **One Payment Link per Product** - Each product automatically generates a unique payment link during creation. The link is immutable and tied to the product's lifecycle.

### Payment Processing

- **Product Quantity Handling** - Quantity validation and price calculations are performed server-side to prevent frontend manipulation and ensure accurate payment amounts.
- **Payment Status Tracking** - Payment status is tracked via polling mechanism since webhook endpoints are not available from the payment provider API.

### Receipt Management

- **Receipt Generation Timing** - Receipts are generated only when payment status changes to "confirmed". No receipts are created for pending, failed, or cancelled payments.
- **Receipt Storage** - All generated receipts are stored in Cloudinary for later review by administrators and merchants.

### File Storage

- **Cloudinary for All Files** - Product images and PDF receipts are stored on Cloudinary rather than in the database. This approach:
  - Prevents database bloat from large binary data
  - Leverages CDN for faster file delivery
  - Provides automatic image optimization

### Email Notifications

- **Asynchronous Email Delivery** - Email sending for payment confirmations is asynchronous and non-blocking. Email failures do not impact the payment processing flow or slow down API responses.

### User & Product Management

- **User Restriction System** - Merchants who misuse the platform can be restricted/blocked, preventing them from logging in or accessing the system.
- **Product Deactivation** - Products can be deactivated by administrators, preventing further payments while preserving historical data.

### Admin Creation

- **Built-in Seed Script** - Admin users are created using a dedicated seed script rather than through the API registration endpoint. This approach:
  - **Security** - Prevents unauthorized admin account creation through public registration endpoints
  - **Consistency** - Ensures admin accounts are created with proper role assignment and validation
  - **Documentation** - Provides a clear, documented way to bootstrap the system with initial admin access
  - **Audit Trail** - Creates a traceable method for initial admin setup that can be logged and reviewed 

### Security & Access Control

- **Role-Based Access Control (RBAC)** - API endpoints are protected with role-based guards:
  - **ADMIN** - Full system access including user management and analytics
  - **MERCHANT** - Access limited to their own products and transactions
- **JWT Token Authentication** - All protected endpoints require valid JWT tokens in the Authorization header.

### Data Integrity

- **Cascade Deletion** - Related records (products, payments, receipts) are properly cleaned up when parent entities are deleted to maintain referential integrity.

---

## 5. Limitations & Possible Improvements

#### Exception Handling
- **Current State:** Basic exception handling with standard NestJS exception filters
- **Improvement:** Implement comprehensive error handling middleware with:
  - Structured error responses
  - Error logging and monitoring integration

#### Email Validation
- **Current State:** Email validation occurs during registration
- **Improvement:** Implement email verification flow:
  - Send verification email upon registration
  - Require email confirmation before account activation
  - Prevent invalid or disposable email addresses

#### KYC (Know Your Customer) Implementation
- **Current Limitation:** No identity verification system in place
- **Improvement:** Add KYC verification to:
  - Prevent platform misuse and scams
  - Comply with financial regulations
  - Build trust with payment providers
  - Reduce fraudulent transactions

#### Webhook Support
- **Current Limitation:** Payment status tracking relies on polling mechanism
- **Reason:** The payment provider API does not expose webhook registration endpoints
- **Impact:** Less real-time payment status updates and increased API calls
- **Future Improvement:** If webhooks become available, implement webhook handlers for instant payment status updates

### Recommended Improvements

#### Background Job Processing

Background jobs can significantly improve system performance and user experience:

**1. Email Queue Processing**
- **Purpose:** Decouple email sending from API responses
- **Implementation:** Use Bull/BullMQ with Redis
- **Benefits:**
  - Faster API response times
  - Retry failed emails automatically
  - Better email delivery reliability
  - Rate limiting for email providers


**2. Receipt Generation Queue**
- **Purpose:** Generate receipts asynchronously for confirmed payments
- **Implementation:** Background job triggered on payment confirmation
- **Benefits:**
  - Non-blocking payment confirmation flow
  - Better error handling for PDF generation
  - Ability to retry failed generations
  - Improved scalability


#### Additional Improvements

**1. Rate Limiting:**
 Implement rate limiting on API endpoints to prevent abuse

**2. Caching Layer:** Add Redis caching for frequently accessed data:
  - Product details
  - Dashboard statistics

**3. API Documentation**
- Integrate Swagger/OpenAPI documentation
- Auto-generate API docs from decorators
- Interactive API testing interface

**4. Testing Coverage:**
- Increase unit test coverage
- Add integration tests for payment flows
- End-to-end testing for critical user journeys
- Load testing for scalability

**5. Security Enhancements**
- Implement CORS policies more restrictively
- Security headers (Helmet.js)

**6. Payment Provider Abstraction:**
Support multiple payment providers simultaneously

**8. Audit Logging**
- Comprehensive audit trail for all operations
- Track user actions, payment changes, admin operations

---


### Database Access

**From Host Machine:**
- Host: `localhost`
- Port: `5434` 
- Database: `payment_link`
- Username: `postgres`
- Password: `postgres`

**Connection String:**
```
postgresql://postgres:postgres@localhost:5434/payment_link
```

---

## License

This project is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
