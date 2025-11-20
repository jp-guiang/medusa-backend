# Dust Loyalty Points Module

A custom loyalty points system for managing "dust" points - customers earn dust and can redeem it for special promo products.

## Overview

The Dust module implements a **loyalty points system** (not a currency) that allows you to:
- Track customer dust balances
- Credit dust to customers (for purchases, promotions, etc.)
- Apply dust points during checkout to pay for products
- Mark products as "dust-only" using metadata
- Automatically deduct dust when orders are placed
- View transaction history

## How It Works

1. **Products**: Mark products as "dust-only" using product metadata (e.g., `{ "dust_only": true, "dust_price": 100 }`)
2. **Checkout**: Customers apply dust points during checkout via API
3. **Payment**: Dust is applied as a payment method (not a currency)
4. **Order**: When order is placed, dust is automatically deducted from customer balance

## Setup

### 1. Generate Migrations

Generate and run database migrations for the dust module:

```bash
npx medusa db:generate dust
npx medusa db:migrate
```

### 2. Mark Products as Dust-Only

When creating products, add metadata to indicate they're dust-only:

```json
{
  "metadata": {
    "dust_only": true,
    "dust_price": 100
  }
}
```

Or via Admin API:
```bash
PATCH /admin/products/:id
{
  "metadata": {
    "dust_only": true,
    "dust_price": 100
  }
}
```

## Usage

### Admin API

#### Credit Dust to Customer
```bash
POST /admin/dust/credit
{
  "customer_id": "cus_123",
  "amount": 100,
  "description": "Welcome bonus"
}
```

#### Debit Dust from Customer
```bash
POST /admin/dust/debit
{
  "customer_id": "cus_123",
  "amount": 50,
  "description": "Manual adjustment"
}
```

#### Get Customer Balance
```bash
GET /admin/dust/balance/:customer_id
```

### Store API

#### Get My Balance
```bash
GET /store/dust/balance
```

#### Get Transaction History
```bash
GET /store/dust/transactions?take=50&skip=0
```

#### Apply Dust to Cart
```bash
POST /store/dust/apply-to-cart
{
  "cart_id": "cart_123",
  "dust_amount": 100
}
```

This validates the customer has enough dust and creates a payment session.

### Programmatic Usage

#### Credit Dust (Workflow)
```typescript
import creditDustWorkflow from "./workflows/credit-dust"

const { result } = await creditDustWorkflow(container).run({
  input: {
    customer_id: "cus_123",
    amount: 100,
    reference_type: "order",
    reference_id: "order_123",
    description: "Dust earned from order"
  }
})
```

#### Apply Dust to Cart (Workflow)
```typescript
import applyDustToCartWorkflow from "./workflows/apply-dust-to-cart"

const { result } = await applyDustToCartWorkflow(container).run({
  input: {
    cart_id: "cart_123",
    customer_id: "cus_123",
    dust_amount: 100
  }
})
```

#### Direct Service Usage
```typescript
const dustService = container.resolve("dust")

// Get balance
const balance = await dustService.getBalance("cus_123")

// Credit dust
await dustService.creditDust("cus_123", 100, "order", "order_123", "Earned from order")

// Debit dust
await dustService.debitDust("cus_123", 50, "order", "order_123", "Spent on order")

// Get transactions
const transactions = await dustService.getTransactionHistory("cus_123", { take: 10 })
```

## Automatic Dust Deduction

When a customer places an order with dust applied, the `order.placed` subscriber automatically:
1. Checks payment sessions for dust payments
2. Validates the customer has sufficient dust balance
3. Deducts the dust amount from the customer's balance
4. Creates a transaction record

## Earning Dust

You can award dust to customers through:
- Admin API: `POST /admin/dust/credit`
- Workflows: `creditDustWorkflow`
- Direct service: `dustService.creditDust()`
- Subscribers: Create subscribers for events like `order.placed` to award dust based on purchase amounts

Example: Award dust when order is placed:
```typescript
// In a subscriber for order.placed
if (order.total > 0) {
  const dustToAward = Math.floor(order.total * 0.01) // 1% of order value
  await dustService.creditDust(
    order.customer_id,
    dustToAward,
    "order",
    order.id,
    `Earned ${dustToAward} dust from order`
  )
}
```

## Frontend Integration

1. **Display Balance**: Show customer's dust balance on their account page
2. **Product Display**: For products with `dust_only: true`, show "Price: 100 dust" instead of currency price
3. **Checkout**: Add a button to "Apply Dust Points" that calls `/store/dust/apply-to-cart`
4. **Cart**: Show applied dust amount in cart summary

## Notes

- Dust balances are stored per customer
- All transactions are logged for audit purposes
- Insufficient balance errors are thrown when trying to debit more than available
- This is a **loyalty points system**, not a currency - products are still priced in your regular currency
- Dust-only products use metadata to indicate they can only be purchased with dust
