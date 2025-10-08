# RetailFlow POS

A modern, full-stack multi-tenant SaaS Point of Sale system designed for retail shops. Built with React, TypeScript, Express, and PostgreSQL.

## Features

### Point of Sale
- Touch-friendly product grid optimized for tablet use
- Real-time cart management with quantity updates
- Multiple payment methods (Cash, Card, Mobile Money)
- Split payment support
- Receipt generation and reprinting

### Inventory Management
- Multi-outlet inventory tracking per tenant
- Product categories and search functionality
- Stock level monitoring with low-stock alerts
- Barcode scanning support (planned: QuaggaJS/ZXing integration)

### Multi-Tenant Architecture
- Complete tenant isolation with shop-based data separation
- Custom branding with per-tenant themes and colors
- Dynamic theming using CSS custom properties
- Subdomain/Shop ID based tenant identification

### User Management & Security
- JWT-based authentication with 24-hour token expiration
- Role-based access control (Admin, Cashier, Sales Attendant, Staff)
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### Business Operations
- Cash handover and end-of-shift reconciliation
- Returns processing with audit trails
- Sales reports and analytics dashboard
- Real-time KPI tracking (sales, transactions, stock alerts)

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI with shadcn/ui design system
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query for server state
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: JWT tokens with bcrypt

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (or use the included in-memory storage for development)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# DATABASE_URL is automatically configured in Replit
# For local development, create a .env file:
DATABASE_URL=your_postgresql_connection_string
```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Demo Credentials

The application comes with pre-configured demo data for testing:

- **Shop ID**: `demo`
- **Username**: `admin`
- **Password**: `admin123`

### Database Setup

Push the database schema to your PostgreSQL database:
```bash
npm run db:push
```

For development without a database connection, the application automatically falls back to in-memory storage with demo data.

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, Tenant)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and configurations
│   │   ├── pages/         # Page components
│   │   └── index.css      # Global styles and theme
├── server/                # Backend Express application
│   ├── db.ts             # Database connection setup
│   ├── index.ts          # Express server entry point
│   ├── routes.ts         # API route definitions
│   └── storage.ts        # Storage layer (DB + In-memory)
├── shared/               # Shared code between frontend and backend
│   └── schema.ts         # Database schema and types
└── README.md            # This file
```

## Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run db:push` - Push database schema to PostgreSQL
- `npm run db:push -- --force` - Force push database schema (use with caution)

## Role-Based Features

### Admin
- Full system access
- User management
- System settings and configuration
- All POS and inventory operations

### Cashier
- POS operations
- Payment processing
- Returns handling
- Cash handover

### Sales Attendant
- Product selection
- Cart building
- Assist with sales

### Staff
- Basic dashboard access
- View-only permissions

## Architecture Highlights

- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Shared Schema**: Single source of truth for data models in `shared/schema.ts`
- **Automatic Validation**: Zod schemas for runtime type checking
- **Optimistic Updates**: TanStack Query for seamless UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessible**: Built on Radix UI primitives for WCAG compliance

## Contributing

This project follows modern web development best practices:
- Component-driven development
- Type-safe API contracts
- Separation of concerns
- Clean code principles

## License

All rights reserved.
