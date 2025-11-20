# Medusa Backend Handover Documentation

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Server](#running-the-server)
6. [Admin Panel Setup](#admin-panel-setup)
7. [Dust Promo Products System](#dust-promo-products-system)
8. [Storefront Integration](#storefront-integration)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up the Medusa backend, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Redis** (optional, but recommended for production)
- **Yarn** or **npm** package manager
- **Git**

### Verify Installation

```bash
node --version  # Should be v18+
postgres --version  # Should be v14+
yarn --version  # or npm --version
```

---

## Initial Setup

This Medusa backend was built following [Medusa's official documentation](https://docs.medusajs.com) and best practices. The setup process follows Medusa's recommended project structure and module system.

### 1. Project Structure

This project follows Medusa v2's architecture:
- **Custom Modules**: `src/modules/dust/` - Custom loyalty points module
- **API Routes**: `src/api/` - Custom store and admin endpoints
- **Workflows**: `src/workflows/` - Business logic workflows
- **Subscribers**: `src/subscribers/` - Event handlers
- **Admin Extensions**: `src/admin/widgets/` - Custom admin UI components

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd medusa-backend

# Install dependencies
yarn install
# or
npm install
```

### 3. Understanding the Build Process

Medusa uses a two-step build process:

**Development Mode** (recommended for development):
```bash
yarn dev
# or
npm run dev
```

This command:
- Compiles TypeScript to JavaScript
- Builds the admin panel automatically
- Enables hot-reloading
- Starts both backend server and admin panel

**Production Build**:
```bash
# Build for production
yarn build
# or
npm run build

# Then start the server
yarn start
# or
npm start
```

The build process creates:
- `.medusa/server/` - Compiled backend code
- `.medusa/admin/` - Built admin panel assets
- `public/admin/` - Admin panel static files

### 4. Medusa Configuration

The project configuration is in `medusa-config.ts`, which follows Medusa's configuration pattern:

```typescript
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // ... other config
  },
  modules: [
    {
      resolve: "./src/modules/dust", // Custom dust module
    },
  ],
})
```

This configuration registers our custom `dust` module, making it available throughout the application.

### 5. Key Medusa Concepts Used

- **Modules**: Custom `dust` module for loyalty points (see [Medusa Modules docs](https://docs.medusajs.com/learn/fundamentals/modules))
- **API Routes**: File-based routing for custom endpoints (see [API Routes docs](https://docs.medusajs.com/learn/fundamentals/api-routes))
- **Workflows**: Business logic orchestration (see [Workflows docs](https://docs.medusajs.com/learn/fundamentals/workflows))
- **Subscribers**: Event-driven handlers (see [Subscribers docs](https://docs.medusajs.com/learn/fundamentals/events-and-subscribers))
- **Admin Extensions**: Custom React widgets (see [Admin Extensions docs](https://docs.medusajs.com/learn/fundamentals/admin))

---

## Environment Configuration

### 1. Create `.env` File

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgres://username:password@localhost:5432/medusa_db

# Server
NODE_ENV=development
PORT=9000

# CORS
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:7001
AUTH_CORS=http://localhost:9000

# Security
JWT_SECRET=your_jwt_secret_here
COOKIE_SECRET=your_cookie_secret_here

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### 2. Generate Security Secrets

If you need to generate new secrets:

```bash
# Generate JWT_SECRET (64 character hex string)
openssl rand -hex 32

# Generate COOKIE_SECRET (64 character hex string)
openssl rand -hex 32
```

---

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE medusa_db;

# Exit psql
\q
```

### 2. Run Migrations

The dust module requires database migrations to be run:

```bash
# Generate migrations for dust module
npx medusa db:generate dust

# Run all migrations
npx medusa db:migrate
```

This will create the following tables:
- `dust_balance` - Stores customer dust balances
- `dust_transaction` - Stores dust transaction history
- `dust_product` - Stores product dust settings

### 3. Seed Database (Optional)

```bash
npx medusa exec ./src/scripts/seed.ts
```

---

## Running the Server

### Development Mode

```bash
yarn dev
# or
npm run dev
```

This will:
- Start the backend server on `http://localhost:9000`
- Start the admin panel on `http://localhost:7001`
- Enable hot-reloading for code changes

### Production Mode

```bash
# Build first
yarn build

# Start server
yarn start
# or
npm start
```

### Verify Server is Running

```bash
# Check health endpoint
curl http://localhost:9000/health
```

---

## Admin Panel Setup

### 1. Access Admin Panel

Navigate to: `http://localhost:7001`

### 2. Create Admin User

If no admin user exists, create one:

```bash
npx medusa user -e admin@example.com -p password123
```

### 3. Login

Use the credentials created above to log in to the admin panel.

---

## Dust Promo Products System

The dust system is a loyalty points system that allows customers to earn "dust" points and use them to purchase special promo products that can only be bought with dust.

### Overview

- **Dust Balance**: Each customer has a dust balance tracked in the `dust_balance` table
- **Dust Transactions**: All dust credits/debits are logged in `dust_transaction` table
- **Dust Products**: Products can be marked as "dust-only" with a specific dust price
- **Payment**: Dust is applied as a payment method during checkout

### Setting Up Dust Promo Products

#### Method 1: Using Admin API (Recommended)

```bash
POST /admin/products/:product_id/dust
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "dust_only": true,
  "dust_price": 100
}
```

**Example using cURL:**

```bash
curl -X POST http://localhost:9000/admin/products/prod_123/dust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "dust_only": true,
    "dust_price": 100
  }'
```

#### Method 2: Using Admin Panel Widget

1. Navigate to **Products** → Select a product
2. Scroll down to find the **"Dust Points Settings"** widget
3. Check **"This product can only be purchased with dust points"**
4. Enter the **Dust Price** (e.g., 100)
5. Click **"Save Dust Settings"**

**Note:** You may need to rebuild the admin panel for the widget to appear:

```bash
yarn build
```

### Building the Admin Widget

The dust product widget was built following [Medusa's Admin Extensions documentation](https://docs.medusajs.com/learn/fundamentals/admin). Here's how it was created:

#### 1. Widget Structure

The widget is located at `src/admin/widgets/dust-product-widget.tsx` and follows Medusa's widget pattern:

```typescript
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label } from "@medusajs/ui"
import { useState, useEffect } from "react"

const DustProductWidget = () => {
  // Widget implementation
  // ...
}

export const config = defineWidgetConfig({
  zone: "product.details.after", // Injects widget after product details
})

export default DustProductWidget
```

#### 2. Widget Configuration

The widget uses `defineWidgetConfig` to specify where it appears:
- **Zone**: `product.details.after` - Places the widget after the product details section
- This follows Medusa's [widget zones documentation](https://docs.medusajs.com/resources/guides/admin/widgets)

#### 3. Widget Functionality

The widget implements:
- **State Management**: Uses React hooks (`useState`, `useEffect`) to manage form state
- **Product ID Detection**: Extracts product ID from the current URL path
- **API Integration**: Calls `/admin/products/:id/dust` endpoints to load and save settings
- **UI Components**: Uses Medusa UI components (`Container`, `Heading`, `Button`, `Input`, `Label`)

#### 4. API Integration

The widget communicates with our custom API endpoint:

```typescript
// Load existing settings
const response = await fetch(`/admin/products/${productId}/dust`, {
  credentials: "include",
})

// Save settings
await fetch(`/admin/products/${productId}/dust`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    dust_only: isDustOnly,
    dust_price: parseInt(dustPrice),
  }),
})
```

#### 5. How It Works

1. **Widget Registration**: Medusa automatically discovers widgets in `src/admin/widgets/`
2. **Zone Injection**: The widget is injected into the `product.details.after` zone
3. **Product Context**: Widget extracts product ID from the current route
4. **Data Loading**: On mount, fetches existing dust settings for the product
5. **User Interaction**: Admin can toggle dust-only and set dust price
6. **Data Persistence**: Saves settings via POST request to our custom endpoint

#### 6. Widget Discovery and Injection

Medusa automatically discovers and injects widgets into the admin panel:

1. **Automatic Discovery**: Medusa scans `src/admin/widgets/` directory for widget files
2. **Zone Matching**: Widgets are matched to their configured zones (e.g., `product.details.after`)
3. **React Component Rendering**: Widgets are rendered as React components in the admin panel
4. **No Manual Registration**: No need to manually register widgets - Medusa handles this automatically

#### 7. How the Widget Appears in Admin Panel

When you navigate to a product detail page in the admin panel:

1. **Product Page Loads**: Admin navigates to Products → Select a product
2. **Widget Zone Detection**: Medusa detects the `product.details.after` zone
3. **Widget Rendering**: The Dust Product Widget is automatically rendered after the product details section
4. **Widget Initialization**: Widget extracts product ID from URL and loads existing dust settings
5. **User Interaction**: Admin can interact with the widget to set dust settings
6. **Data Persistence**: Changes are saved via API call to `/admin/products/:id/dust`

**Visual Location**: The widget appears as a new section below the product details, before other product-related sections.

#### 8. Building and Deploying

To make the widget available:

```bash
# Development: Widget hot-reloads automatically
yarn dev
# Widget changes are reflected immediately without rebuild

# Production: Must rebuild admin panel
yarn build
# Widget is compiled and included in admin bundle
```

The widget is automatically included in the admin build process. During development, changes to widget files trigger hot-reload. See [Medusa Admin Extensions docs](https://docs.medusajs.com/learn/fundamentals/admin) for more details on widget development.

### Awarding Dust to Customers

Before customers can purchase dust-only products, they need dust points:

```bash
POST /admin/dust/credit
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "customer_id": "cus_123",
  "amount": 500,
  "description": "Welcome bonus"
}
```

### Verifying Dust Settings

Check if a product is configured correctly:

```bash
GET /admin/products/:product_id/dust
Authorization: Bearer YOUR_ADMIN_TOKEN
```

Or via store API (public):

```bash
GET /store/products/:product_id/dust
```

### How It Works

1. **Product Setup**: Admin marks product as dust-only with a dust price
2. **Customer Balance**: Customer receives dust points (via admin credit, purchase, promotion, etc.)
3. **Storefront Display**: Storefront checks if product is dust-only and displays dust price
4. **Checkout**: Customer applies dust points during checkout
5. **Order Placement**: When order is placed, dust is automatically deducted from customer balance
6. **Transaction Log**: All dust transactions are logged for audit purposes

---

## Storefront Integration

### 1. Check if Product is Dust-Only

When displaying products, check if they're dust-only:

```javascript
// Fetch dust settings for a product
const response = await fetch(`/store/products/${productId}/dust`)
const { dust_only, dust_price } = await response.json()

if (dust_only) {
  // Display dust price instead of currency price
  // Hide regular "Add to Cart" button
  // Show "Purchase with Dust" button instead
}
```

**Example Response:**
```json
{
  "dust_only": true,
  "dust_price": 100
}
```

### 2. Display Dust Price

```javascript
// In your product component
{product.dust?.dust_only ? (
  <div>
    <span className="price">Price: {product.dust.dust_price} dust</span>
    <button onClick={handlePurchaseWithDust}>
      Purchase with Dust
    </button>
  </div>
) : (
  <div>
    <span className="price">${product.variants[0].calculated_price}</span>
    <button onClick={handleAddToCart}>Add to Cart</button>
  </div>
)}
```

### 3. Check Customer Dust Balance

```javascript
// Get customer's dust balance
const balanceResponse = await fetch('/store/dust/balance', {
  credentials: 'include' // Include auth cookies
})
const { balance } = await balanceResponse.json()

// Display balance to customer
console.log(`You have ${balance} dust points`)
```

### 4. Apply Dust to Cart

When customer clicks "Purchase with Dust":

```javascript
const applyDustToCart = async (cartId, dustAmount) => {
  try {
    const response = await fetch('/store/dust/apply-to-cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        cart_id: cartId,
        dust_amount: dustAmount,
      }),
    })

    if (response.ok) {
      // Dust applied successfully
      // Proceed to checkout
    } else {
      const error = await response.json()
      // Handle error (e.g., insufficient balance)
      alert(`Error: ${error.message}`)
    }
  } catch (error) {
    console.error('Failed to apply dust:', error)
  }
}
```

### 5. Complete Checkout Flow

```javascript
// 1. Check if product is dust-only
const dustSettings = await fetch(`/store/products/${productId}/dust`).then(r => r.json())

if (dustSettings.dust_only) {
  // 2. Check customer balance
  const balance = await fetch('/store/dust/balance', { credentials: 'include' }).then(r => r.json())
  
  if (balance.balance < dustSettings.dust_price) {
    alert(`Insufficient dust. You have ${balance.balance}, need ${dustSettings.dust_price}`)
    return
  }
  
  // 3. Add product to cart
  await addToCart(productId)
  
  // 4. Apply dust to cart
  await applyDustToCart(cartId, dustSettings.dust_price)
  
  // 5. Complete checkout
  await completeCheckout()
}
```

### 6. Fetch Multiple Products with Dust Settings

For product listing pages:

```javascript
// Option 1: Fetch dust settings for multiple products
const productIds = products.map(p => p.id).join(',')
const dustSettingsResponse = await fetch(`/store/products/dust?ids=${productIds}`)
const { products: dustSettingsMap } = await dustSettingsResponse.json()

// Option 2: Use the extended products endpoint
const productsResponse = await fetch('/store/products-with-metadata')
const { products } = await productsResponse.json()
// Each product will have a 'dust' object with dust_only and dust_price
```

---

## API Reference

### Admin Endpoints

#### Get Customer Dust Balance
```http
GET /admin/dust/balance/:customer_id
Authorization: Bearer YOUR_ADMIN_TOKEN
```

#### Credit Dust to Customer
```http
POST /admin/dust/credit
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "customer_id": "cus_123",
  "amount": 100,
  "description": "Welcome bonus"
}
```

#### Debit Dust from Customer
```http
POST /admin/dust/debit
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "customer_id": "cus_123",
  "amount": 50,
  "description": "Manual adjustment"
}
```

#### Set Product Dust Settings
```http
POST /admin/products/:id/dust
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "dust_only": true,
  "dust_price": 100
}
```

#### Get Product Dust Settings
```http
GET /admin/products/:id/dust
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Store Endpoints

#### Get My Dust Balance
```http
GET /store/dust/balance
Credentials: include
```

#### Get My Transaction History
```http
GET /store/dust/transactions?take=50&skip=0
Credentials: include
```

#### Get Product Dust Settings
```http
GET /store/products/:id/dust
```

#### Get Multiple Products Dust Settings
```http
GET /store/products/dust?ids=prod_1,prod_2,prod_3
```

#### Apply Dust to Cart
```http
POST /store/dust/apply-to-cart
Content-Type: application/json
Credentials: include

{
  "cart_id": "cart_123",
  "dust_amount": 100
}
```

#### Extended Product Endpoint (with dust settings)
```http
GET /store/products/:id
```

Returns product with `dust` object:
```json
{
  "product": {
    "id": "prod_123",
    "title": "Dust Test",
    "dust": {
      "dust_only": true,
      "dust_price": 100
    }
  }
}
```

---

## Troubleshooting

### Database Connection Issues

**Error:** `KnexTimeoutError: Timeout acquiring a connection`

**Solution:**
1. Verify PostgreSQL is running: `brew services list`
2. Check database URL in `.env` file
3. Verify database exists: `psql -l | grep medusa_db`

### Migration Errors

**Error:** `Cannot define field(s) "created_at,updated_at"`

**Solution:** These fields are automatically managed by Medusa. Remove them from model definitions.

**Error:** `_utils.model.text(...).required is not a function`

**Solution:** Medusa v2 doesn't use `.required()`. Remove it from model definitions.

### Admin Widget Not Appearing

**Issue:** Dust settings widget doesn't show in admin panel

**Solution:**
1. Rebuild admin: `yarn build`
2. Restart dev server: `yarn dev`
3. Clear browser cache
4. Check browser console for errors

### Dust Settings Not Saving

**Issue:** Dust settings aren't persisting

**Solution:**
1. Verify migrations ran: `npx medusa db:migrate`
2. Check `dust_product` table exists: `psql medusa_db -c "\d dust_product"`
3. Verify API endpoint is working: `curl http://localhost:9000/admin/products/:id/dust`

### Storefront Can't Access Dust Settings

**Issue:** Storefront gets 404 or empty response

**Solution:**
1. Verify endpoint exists: `curl http://localhost:9000/store/products/:id/dust`
2. Check CORS settings in `.env`
3. Verify product ID is correct
4. Check server logs for errors

### Dust Not Deducted After Order

**Issue:** Dust balance doesn't decrease after order placement

**Solution:**
1. Check subscriber is registered: Verify `src/subscribers/order-placed-dust.ts` exists
2. Check order has `customer_id`
3. Verify dust was applied to cart before checkout
4. Check server logs for subscriber errors

---

## Additional Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Medusa Admin Extensions](https://docs.medusajs.com/learn/fundamentals/admin)
- [Medusa API Routes](https://docs.medusajs.com/learn/fundamentals/api-routes)
- [Medusa Modules](https://docs.medusajs.com/learn/fundamentals/modules)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs: `yarn dev` output
3. Check database: `psql medusa_db`
4. Review API responses in browser Network tab

---

## Files Created and Modified

This section lists all files that were created or modified to implement the dust promo products system.

### Created Files

#### Module Files
- `src/modules/dust/index.ts` - Dust module definition and export
- `src/modules/dust/service.ts` - Dust module service with business logic
- `src/modules/dust/models/dust-balance.ts` - Customer dust balance model
- `src/modules/dust/models/dust-transaction.ts` - Dust transaction history model
- `src/modules/dust/models/dust-product.ts` - Product dust settings model
- `src/modules/dust/migrations/Migration20251119231148.ts` - Database migration for dust tables
- `src/modules/dust/README.md` - Module documentation

#### Workflow Files
- `src/workflows/credit-dust.ts` - Workflow to credit dust to customers
- `src/workflows/debit-dust.ts` - Workflow to debit dust from customers
- `src/workflows/apply-dust-to-cart.ts` - Workflow to apply dust points to cart

#### API Route Files - Admin
- `src/api/admin/dust/credit/route.ts` - Admin endpoint to credit dust
- `src/api/admin/dust/debit/route.ts` - Admin endpoint to debit dust
- `src/api/admin/dust/balance/[customer_id]/route.ts` - Admin endpoint to get customer balance
- `src/api/admin/products/[id]/dust/route.ts` - Admin endpoint to get/set product dust settings

#### API Route Files - Store
- `src/api/store/dust/balance/route.ts` - Store endpoint to get customer's own balance
- `src/api/store/dust/transactions/route.ts` - Store endpoint to get transaction history
- `src/api/store/dust/apply-to-cart/route.ts` - Store endpoint to apply dust to cart
- `src/api/store/dust/products/route.ts` - Store endpoint to get dust settings for products
- `src/api/store/products/[id]/dust/route.ts` - Store endpoint to get product dust settings
- `src/api/store/products/dust/route.ts` - Store endpoint to get multiple products' dust settings
- `src/api/store/products/[id]/route.ts` - Extended product endpoint with dust settings
- `src/api/store/products-with-metadata/route.ts` - Modified to include dust settings

#### Subscriber Files
- `src/subscribers/order-placed-dust.ts` - Subscriber to deduct dust when order is placed

#### Admin Widget Files
- `src/admin/widgets/dust-product-widget.tsx` - Admin widget for managing product dust settings

### Modified Files

#### Configuration Files
- `medusa-config.ts` - Added dust module to modules array

#### Documentation Files
- `HANDOVER.md` - This handover documentation (created)
- `README.md` - Updated with project information (if modified)

### File Structure Summary

```
src/
├── modules/
│   └── dust/                    # Custom dust module
│       ├── index.ts
│       ├── service.ts
│       ├── models/
│       │   ├── dust-balance.ts
│       │   ├── dust-transaction.ts
│       │   └── dust-product.ts
│       ├── migrations/
│       │   └── Migration20251119231148.ts
│       └── README.md
├── workflows/
│   ├── credit-dust.ts
│   ├── debit-dust.ts
│   └── apply-dust-to-cart.ts
├── api/
│   ├── admin/
│   │   ├── dust/
│   │   │   ├── credit/route.ts
│   │   │   ├── debit/route.ts
│   │   │   └── balance/[customer_id]/route.ts
│   │   └── products/[id]/dust/route.ts
│   └── store/
│       ├── dust/
│       │   ├── balance/route.ts
│       │   ├── transactions/route.ts
│       │   ├── apply-to-cart/route.ts
│       │   └── products/route.ts
│       └── products/
│           ├── [id]/route.ts          # Extended endpoint
│           ├── [id]/dust/route.ts
│           ├── dust/route.ts
│           └── products-with-metadata/route.ts  # Modified
├── subscribers/
│   └── order-placed-dust.ts
└── admin/
    └── widgets/
        └── dust-product-widget.tsx

medusa-config.ts                    # Modified
```

### Database Tables Created

The migrations create the following tables:
- `dust_balance` - Stores customer dust balances
- `dust_transaction` - Stores dust transaction history
- `dust_product` - Stores product dust settings (links products to dust configuration)

---

**Last Updated:** November 2025
**Version:** 1.0.0

