# Firestore Schema Design

This document outlines the Firestore collection structure that replaces the previous Drizzle/SQLite schema.

## Collections Structure

### 1. Products Collection (`products`)
```
/products/{productId}
```
**Fields:**
- `name` (string) - Product name
- `description` (string, optional) - Product description
- `price` (number) - Base price
- `salePrice` (number, optional) - Sale price if on sale
- `imageUrl` (string, optional) - Main product image URL
- `category` (string) - Product category
- `color` (string) - Product color
- `size` (string) - Product size
- `stockQuantity` (number) - Available stock
- `isFeatured` (boolean) - Whether product is featured
- `createdAt` (timestamp) - Creation timestamp

**Indexes needed:**
- `category` (single field)
- `isFeatured` (single field)
- `category, price` (composite)
- `category, createdAt` (composite)

### 2. Categories Collection (`categories`)
```
/categories/{categoryId}
```
**Fields:**
- `name` (string) - Category name
- `slug` (string) - URL-friendly slug (unique)
- `description` (string, optional) - Category description
- `createdAt` (timestamp) - Creation timestamp

**Indexes needed:**
- `slug` (single field, unique constraint via security rules)

### 3. Cart Items Collection (`cartItems`)
```
/cartItems/{cartItemId}
```
**Fields:**
- `productId` (string) - Reference to product
- `quantity` (number) - Item quantity
- `size` (string) - Selected size
- `color` (string) - Selected color
- `sessionId` (string) - User session identifier
- `createdAt` (timestamp) - Creation timestamp

**Indexes needed:**
- `sessionId` (single field)
- `productId` (single field)
- `sessionId, createdAt` (composite)

### 4. Orders Collection (`orders`)
```
/orders/{orderId}
```
**Fields:**
- `customerName` (string) - Customer full name
- `customerEmail` (string) - Customer email
- `customerPhone` (string) - Customer phone number
- `shippingAddress` (string) - Shipping address
- `totalAmount` (number) - Order total amount
- `status` (string) - Order status (pending, processing, shipped, delivered, cancelled)
- `createdAt` (timestamp) - Creation timestamp

**Subcollection:**
```
/orders/{orderId}/items/{itemId}
```
- `productId` (string) - Reference to product
- `quantity` (number) - Item quantity
- `price` (number) - Item price at time of order
- `size` (string) - Selected size
- `color` (string) - Selected color

**Indexes needed:**
- `status` (single field)
- `customerEmail` (single field)
- `createdAt` (single field)
- `status, createdAt` (composite)

### 5. Users Collection (`users`)
```
/users/{userId}
```
**Fields:**
- `email` (string) - User email (Firebase Auth handles this)
- `name` (string) - User full name
- `role` (string) - User role (user, admin)
- `createdAt` (timestamp) - Creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Note:** Firebase Authentication handles user authentication, so passwords are not stored in Firestore.

### 6. Customers Collection (`customers`)
```
/customers/{customerId}
```
**Fields:**
- `email` (string) - Customer email
- `name` (string) - Customer name
- `phone` (string, optional) - Customer phone
- `address` (map, optional) - Customer address object
- `createdAt` (timestamp) - Creation timestamp
- `updatedAt` (timestamp) - Last update timestamp

**Indexes needed:**
- `email` (single field)

### 7. Analytics Collection (`analytics`)
```
/analytics/{analyticsId}
```
**Fields:**
- `metricName` (string) - Name of the metric
- `value` (number) - Metric value
- `date` (string) - Date in YYYY-MM-DD format
- `createdAt` (timestamp) - Creation timestamp

**Indexes needed:**
- `metricName` (single field)
- `date` (single field)
- `metricName, date` (composite)

## Migration Strategy

### Relational to NoSQL Mapping

1. **Foreign Key References**: Instead of integer foreign keys, we'll use document IDs (strings) as references.

2. **Joins**: Replace SQL joins with:
   - Denormalization where appropriate
   - Multiple queries for related data
   - Subcollections for one-to-many relationships (like order items)

3. **Auto-incrementing IDs**: Firestore uses auto-generated string IDs instead of auto-incrementing integers.

4. **Timestamps**: Use Firestore's `serverTimestamp()` instead of ISO strings where possible.

### Data Consistency

1. **Order Items**: Stored as a subcollection under orders for better data locality and atomic operations.

2. **Sessions**: Firebase Auth handles sessions, so the sessions table is no longer needed.

3. **Cart Items**: Remain as top-level collection but referenced by `sessionId` for anonymous users or `userId` for authenticated users.

### Security Rules

Firestore security rules will enforce:
- Users can only access their own cart items
- Only admins can modify products, categories, and view all orders
- Customers can only view their own orders
- Public read access to products and categories

### Performance Considerations

1. **Composite Indexes**: Created for common query patterns
2. **Denormalization**: Consider storing product name/image with cart items and order items for better performance
3. **Pagination**: Use Firestore's `startAfter()` for pagination instead of OFFSET
4. **Real-time Listeners**: Can be used for cart updates and order status changes