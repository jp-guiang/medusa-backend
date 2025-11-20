# Setting Up Dust Promo Products

## Step-by-Step Guide

### Step 1: Mark a Product as Dust-Only

You have two options:

#### Option A: Using Admin API (Recommended)

```bash
POST /admin/products/:product_id/dust
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "dust_only": true,
  "dust_price": 100
}
```

**Example:**
```bash
curl -X POST http://localhost:9000/admin/products/prod_123/dust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "dust_only": true,
    "dust_price": 100
  }'
```

#### Option B: Using Admin Widget (After Rebuild)

1. Rebuild the admin panel:
   ```bash
   npm run build
   ```

2. Go to Admin Panel → Products → Select a product
3. Scroll down to find the "Dust Points Settings" widget
4. Check "This product can only be purchased with dust points"
5. Enter the dust price (e.g., 100)
6. Save the product

### Step 2: Verify the Settings

Check that the product is marked as dust-only:

```bash
GET /admin/products/:product_id/dust
```

Or check via store API:

```bash
GET /store/products/:product_id/dust
```

### Step 3: Test in Your Storefront

In your frontend, when displaying products:

1. **Check if product is dust-only:**
   ```javascript
   // Fetch dust settings for a product
   const response = await fetch(`/store/products/${productId}/dust`)
   const { dust_only, dust_price } = await response.json()
   
   if (dust_only) {
     // Display: "Price: 100 dust" instead of currency price
     // Hide regular "Add to Cart" button
     // Show "Purchase with Dust" button instead
   }
   ```

2. **Check customer's dust balance:**
   ```javascript
   const balanceResponse = await fetch('/store/dust/balance')
   const { balance } = await balanceResponse.json()
   
   if (balance < dust_price) {
     // Show message: "Insufficient dust. You have X dust, need Y dust"
   }
   ```

3. **Apply dust to cart during checkout:**
   ```javascript
   // When customer clicks "Purchase with Dust"
   await fetch('/store/dust/apply-to-cart', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       cart_id: cartId,
       dust_amount: dust_price
     })
   })
   ```

### Step 4: Award Dust to Customers

Before customers can purchase dust-only products, they need dust points:

```bash
POST /admin/dust/credit
{
  "customer_id": "cus_123",
  "amount": 500,
  "description": "Welcome bonus"
}
```

## Complete Example Workflow

1. **Admin marks product as dust-only:**
   ```bash
   POST /admin/products/prod_abc123/dust
   { "dust_only": true, "dust_price": 100 }
   ```

2. **Admin awards dust to customer:**
   ```bash
   POST /admin/dust/credit
   { "customer_id": "cus_xyz789", "amount": 500 }
   ```

3. **Customer views product in storefront:**
   - Frontend calls `GET /store/products/prod_abc123/dust`
   - Sees: `{ "dust_only": true, "dust_price": 100 }`
   - Displays: "Price: 100 dust"

4. **Customer adds to cart:**
   - Frontend calls `POST /store/dust/apply-to-cart`
   - System validates customer has enough dust
   - Creates payment session

5. **Customer completes order:**
   - Order is placed
   - Subscriber automatically deducts 100 dust from customer balance
   - Transaction is logged

## Quick Reference

### Admin Endpoints
- `POST /admin/products/:id/dust` - Mark product as dust-only
- `GET /admin/products/:id/dust` - Get dust settings
- `POST /admin/dust/credit` - Award dust to customer
- `POST /admin/dust/debit` - Remove dust from customer
- `GET /admin/dust/balance/:customer_id` - Check customer balance

### Store Endpoints
- `GET /store/products/:id/dust` - Get dust settings (public)
- `GET /store/products/dust?ids=id1,id2` - Get multiple products' settings
- `GET /store/dust/balance` - Get my dust balance
- `GET /store/dust/transactions` - Get my transaction history
- `POST /store/dust/apply-to-cart` - Apply dust to cart

## Notes

- Dust settings are stored in the `dust_product` table (persistent)
- Customer balances are in `dust_balance` table
- All transactions are logged in `dust_transaction` table
- Dust is automatically deducted when orders are placed
- Products can have regular prices AND dust prices (use dust_price when dust_only is true)

