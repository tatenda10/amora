# RevenueCat Webhook Documentation

## Webhook Endpoint
`POST /api/webhooks/revenuecat`

## What RevenueCat Sends

When a subscription event occurs (purchase, renewal, cancellation, etc.), RevenueCat sends a webhook with the following structure:

### Request Body Structure
```json
{
  "event": {
    "type": "INITIAL_PURCHASE",
    "app_user_id": "user-uuid-here",
    "product_id": "amora_basic:basic",
    "expiration_at_ms": 1735689600000,
    "purchased_at_ms": 1733097600000,
    "entitlements": {
      "active": {
        "basic": {
          "expires_date": "2025-01-01T00:00:00Z",
          "product_identifier": "amora_basic:basic",
          "purchase_date": "2024-12-01T00:00:00Z"
        }
      },
      "all": {}
    },
    "period_type": "NORMAL",
    "price": 9.99,
    "currency": "USD",
    "store": "PLAY_STORE",
    "transaction_id": "GPA.1234-5678-9012",
    "original_transaction_id": "GPA.1234-5678-9012",
    "is_family_share": false,
    "takehome_percentage": 0.7,
    "revenue": 6.99,
    "price_in_purchased_currency": 9.99,
    "subscriber_attributes": {},
    "presented_offering_id": "default",
    "environment": "PRODUCTION",
    "aliases": [],
    "original_app_user_id": "user-uuid-here"
  }
}
```

## Event Types

### Subscription Events
- **`INITIAL_PURCHASE`** - First time purchase of a subscription
- **`RENEWAL`** - Subscription automatically renewed
- **`CANCELLATION`** - User cancelled subscription (but may still have access until expiration)
- **`UNCANCELLATION`** - User reactivated a cancelled subscription
- **`EXPIRATION`** - Subscription expired (no longer active)
- **`BILLING_ISSUE`** - Payment failed, subscription is past due

### Other Events (Currently Ignored)
- `TEST` - Test events
- `NON_RENEWING_PURCHASE` - One-time purchase
- `SUBSCRIPTION_PAUSED` - Subscription paused
- `PRODUCT_CHANGE` - User changed subscription product

## Key Fields We Use

### Currently Extracted:
1. **`type`** - Event type (INITIAL_PURCHASE, RENEWAL, etc.)
2. **`app_user_id`** - Our internal user UUID (must match user ID in our database)
3. **`product_id`** - Product identifier (e.g., "amora_basic:basic", "amora_premium:premium")
4. **`expiration_at_ms`** - Subscription expiration timestamp (milliseconds)
5. **`entitlements`** - Active entitlements object (most reliable way to determine tier)

### Available But Not Currently Used:
- **`purchased_at_ms`** - When the purchase was made
- **`price`** - Product price
- **`currency`** - Currency code (USD, EUR, etc.)
- **`store`** - Store type (APP_STORE, PLAY_STORE, STRIPE)
- **`transaction_id`** - Transaction identifier
- **`environment`** - SANDBOX or PRODUCTION
- **`period_type`** - NORMAL, TRIAL, INTRO

## How We Determine Subscription Tier

### Priority 1: Entitlements (Most Reliable)
```javascript
if (entitlements?.active) {
  if (entitlements.active['premium'] || entitlements.active['pro_access']) {
    tier = 'premium';
  } else if (entitlements.active['basic']) {
    tier = 'basic';
  }
}
```

### Priority 2: Product ID (Fallback)
```javascript
if (product_id?.includes('premium')) {
  tier = 'premium';
} else if (product_id?.includes('basic')) {
  tier = 'basic';
}
```

## Database Update

When a subscription event occurs, we update:
- `subscription_tier` - 'free', 'basic', or 'premium'
- `subscription_status` - 'active', 'cancelled', 'expired', 'past_due'
- `subscription_end_date` - Expiration date/time

## Important Notes

1. **User ID Mapping**: The `app_user_id` in RevenueCat must match our internal user UUID. Make sure RevenueCat is configured with the correct user ID when initializing.

2. **Entitlements Setup**: In RevenueCat dashboard, you need to:
   - Create entitlements: "basic" and "premium" (or "pro_access")
   - Attach products to these entitlements
   - This is more reliable than parsing product IDs

3. **Webhook Security**: Currently using Authorization header. Should implement:
   - Verify against `REVENUECAT_WEBHOOK_SECRET` environment variable
   - Validate webhook signature if RevenueCat provides it

4. **Event Timing**: 
   - `INITIAL_PURCHASE` fires immediately when user purchases
   - `RENEWAL` fires when subscription auto-renews
   - `EXPIRATION` fires when subscription expires
   - `CANCELLATION` fires when user cancels (but access continues until expiration)

## Testing

To test webhooks:
1. Use RevenueCat's webhook testing tool in dashboard
2. Or use a tool like ngrok to expose local server
3. Configure webhook URL in RevenueCat dashboard: `https://your-domain.com/api/webhooks/revenuecat`

## Example Webhook Payloads

### Initial Purchase (Basic)
```json
{
  "event": {
    "type": "INITIAL_PURCHASE",
    "app_user_id": "550e8400-e29b-41d4-a716-446655440000",
    "product_id": "amora_basic:basic",
    "expiration_at_ms": 1735689600000,
    "purchased_at_ms": 1733097600000,
    "entitlements": {
      "active": {
        "basic": {
          "expires_date": "2025-01-01T00:00:00Z",
          "product_identifier": "amora_basic:basic"
        }
      }
    },
    "price": 9.99,
    "currency": "USD",
    "store": "PLAY_STORE",
    "environment": "PRODUCTION"
  }
}
```

### Renewal (Premium)
```json
{
  "event": {
    "type": "RENEWAL",
    "app_user_id": "550e8400-e29b-41d4-a716-446655440000",
    "product_id": "amora_premium:premium",
    "expiration_at_ms": 1738368000000,
    "purchased_at_ms": 1735689600000,
    "entitlements": {
      "active": {
        "premium": {
          "expires_date": "2025-02-01T00:00:00Z",
          "product_identifier": "amora_premium:premium"
        }
      }
    },
    "price": 19.99,
    "currency": "USD",
    "store": "PLAY_STORE",
    "environment": "PRODUCTION"
  }
}
```

### Expiration
```json
{
  "event": {
    "type": "EXPIRATION",
    "app_user_id": "550e8400-e29b-41d4-a716-446655440000",
    "product_id": "amora_basic:basic",
    "expiration_at_ms": 1735689600000,
    "entitlements": {
      "active": {},
      "all": {
        "basic": {
          "expires_date": "2025-01-01T00:00:00Z"
        }
      }
    },
    "environment": "PRODUCTION"
  }
}
```

