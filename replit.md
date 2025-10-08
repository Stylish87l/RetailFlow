# RetailFlow POS - Multi-Tenant SaaS Point of Sale System

## Overview

RetailFlow POS is a modern, full-stack multi-tenant SaaS Point of Sale system designed for retail shops. The application follows a modular architecture with clear separation between frontend (`/client`) and backend (`/server`) code, with shared schemas and utilities in the `/shared` directory.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state, React Context for auth/tenant state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: JWT-based tokens with bcrypt for password hashing
- **API Design**: RESTful endpoints with role-based access control

### Multi-Tenant Architecture
- **Tenant Isolation**: Shop data separated by tenant ID in database queries
- **Subdomain/Shop ID Logic**: Tenants identified through shop credentials
- **Custom Branding**: Per-tenant themes with custom colors and logos
- **Dynamic Theming**: CSS custom properties updated based on tenant configuration

## Key Components

### Authentication & Authorization
- JWT access tokens with 24-hour expiration
- Role-based access control (Admin, Cashier, Sales Attendant, Staff)
- Protected routes and API endpoints based on user roles
- Secure password hashing with bcrypt

### Database Schema
- **Tenants**: Shop information, branding, and configuration
- **Users**: Staff accounts with role assignments and tenant associations
- **Products**: Inventory items with categories, pricing, and stock levels
- **Transactions**: Sales records with payment methods and line items
- **Returns**: Return processing with audit trails
- **Cash Handovers**: End-of-shift cash counting and reconciliation

### Point of Sale System
- Touch-friendly product grid for tablet use
- Real-time cart management with quantity updates
- Multiple payment methods (Cash, Card, Mobile Money)
- Split payment support
- Receipt generation and reprinting capabilities

### Inventory Management
- Multi-outlet inventory tracking per tenant
- Product categories and search functionality
- Stock level monitoring with low-stock alerts
- Barcode scanning integration (QuaggaJS/ZXing planned)

### Role-Based Features
- **Admin**: Full system access, user management, settings
- **Cashier**: POS operations, payments, returns, cash handover
- **Sales Attendant**: Product selection, cart building
- **Staff**: Basic dashboard access

## Data Flow

1. **Authentication Flow**: User credentials → JWT token → Role-based route access
2. **Transaction Flow**: Product selection → Cart building → Payment processing → Receipt generation
3. **Tenant Flow**: Login with shop ID → Tenant context loading → Theme application
4. **Data Synchronization**: Real-time updates via TanStack Query with automatic cache invalidation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database queries and migrations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI component primitives
- **wouter**: Lightweight React router
- **zod**: Runtime type validation and schema parsing

### Development Tools
- **Vite**: Build tool with hot module replacement
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

### Planned Integrations
- **QuaggaJS/ZXing**: Barcode scanning functionality
- **Receipt Printer APIs**: Hardware integration for receipt printing

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend development
- Express server with tsx for TypeScript execution
- Replit-specific plugins for development experience

### Production Build
- Frontend: Vite build to static assets in `/dist/public`
- Backend: ESBuild bundle to `/dist/index.js`
- Database: Drizzle migrations applied via `db:push` command

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- JWT secret configuration for token signing
- Multi-tenant routing and subdomain handling

### Hosting Considerations
- Static asset serving for production builds
- PostgreSQL database provisioning (Neon serverless)
- Environment variable management for secrets
- Subdomain or path-based tenant routing configuration

## Notable Architectural Decisions

### Database ORM Choice
**Problem**: Need for type-safe database operations with PostgreSQL
**Solution**: Drizzle ORM chosen over Prisma for better performance and smaller bundle size
**Benefits**: Full TypeScript support, efficient query generation, migration management

### Authentication Strategy
**Problem**: Secure multi-tenant authentication
**Solution**: JWT tokens with role-based access control
**Benefits**: Stateless authentication, role-based UI rendering, secure API access

### UI Component Strategy
**Problem**: Consistent, accessible UI components
**Solution**: Radix UI primitives with shadcn/ui styling system
**Benefits**: Accessibility compliance, consistent design system, customizable theming

### State Management Approach
**Problem**: Complex client state with server synchronization
**Solution**: TanStack Query for server state, React Context for client state
**Benefits**: Automatic caching, background updates, optimistic updates