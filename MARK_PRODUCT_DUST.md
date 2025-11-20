# How to Mark a Product as Dust-Only via API

## Step 1: Get Your Admin Token

First, you need to authenticate. Log in to the Medusa Admin panel and get your admin token, or use the auth endpoint:

```bash
POST http://localhost:9000/admin/auth/token
{
  "email": "your-admin-email@example.com",
  "password": "your-password"
}
```

This returns a token you'll use in the Authorization header.

## Step 2: Get a Product ID

List products to find the ID:

```bash
GET http://localhost:9000/admin/products
Authorization: Bearer YOUR_ADMIN_TOKEN
```

Or get a specific product by handle:

```bash
GET http://localhost:9000/admin/products?handle=your-product-handle
Authorization: Bearer YOUR_ADMIN_TOKEN
```

## Step 3: Mark Product as Dust-Only

### Using cURL:

```bash
curl -X POST http://localhost:9000/admin/products/PRODUCT_ID/dust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "dust_only": true,
    "dust_price": 100
  }'
```

### Using JavaScript/Fetch:

```javascript
const productId = "prod_123" // Your product ID
const adminToken = "your_admin_token"

const response = await fetch(`http://localhost:9000/admin/products/${productId}/dust`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    dust_only: true,
    dust_price: 100
  })
})

const result = await response.json()
console.log(result)
```

### Using Postman/Insomnia:

1. **Method:** POST
2. **URL:** `http://localhost:9000/admin/products/PRODUCT_ID/dust`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_ADMIN_TOKEN`
4. **Body (JSON):**
   ```json
   {
     "dust_only": true,
     "dust_price": 100
   }
   ```

## Step 4: Verify It Worked

Check the product settings:

```bash
GET http://localhost:9000/admin/products/PRODUCT_ID/dust
Authorization: Bearer YOUR_ADMIN_TOKEN
```

Or via store API (public):

```bash
GET http://localhost:9000/store/products/PRODUCT_ID/dust
```

Both should return:
```json
{
  "dust_only": true,
  "dust_price": 100
}
```

## Example: Complete Workflow

```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:9000/admin/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }' | jq -r '.access_token')

# 2. List products to find ID
curl http://localhost:9000/admin/products \
  -H "Authorization: Bearer $TOKEN" | jq '.products[0].id'

# 3. Mark product as dust-only (replace PRODUCT_ID)
curl -X POST http://localhost:9000/admin/products/PRODUCT_ID/dust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "dust_only": true,
    "dust_price": 100
  }'

# 4. Verify
curl http://localhost:9000/store/products/PRODUCT_ID/dust
```

## Notes

- Replace `PRODUCT_ID` with your actual product ID (e.g., `prod_01H...`)
- Replace `YOUR_ADMIN_TOKEN` with your actual admin token
- `dust_price` is required when `dust_only` is `true`
- The product will now be accessible via `/store/products/:id/dust` endpoint

