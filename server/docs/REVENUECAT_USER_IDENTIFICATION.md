# RevenueCat User Identification Guide

## How We Identify Users in Webhooks

### The Problem
RevenueCat webhooks need to know which user in our database made a purchase. By default, RevenueCat uses anonymous IDs like `$RCAnonymousID:96683beb5320449c8f222413c30a72f6`, which don't match our internal user UUIDs.

### The Solution
We use `Purchases.logIn(userId)` to set our internal user UUID as the RevenueCat app user ID. This ensures webhooks contain our UUID instead of anonymous IDs.

## Implementation

### 1. Client-Side (React Native)

#### When User Logs In
We call `Purchases.logIn(userId)` with our internal user UUID:

```javascript
// In AuthContext.js
await revenueCatService.logIn(result.user.id);
```

This happens:
- ✅ When user signs in with email
- ✅ When user signs in with Google
- ✅ When app checks auth state and user is already logged in

#### When User Logs Out
We call `Purchases.logOut()` to clear the user ID:

```javascript
// In AuthContext.js
await revenueCatService.logOut();
```

### 2. Server-Side (Webhook Handler)

#### Webhook Receives `app_user_id`
The webhook payload contains:
```json
{
  "event": {
    "app_user_id": "550e8400-e29b-41d4-a716-446655440000",  // Our UUID (if logged in)
    // OR
    "app_user_id": "$RCAnonymousID:96683beb5320449c8f222413c30a72f6"  // Anonymous (if not logged in)
  }
}
```

#### Database Update
We use `app_user_id` to update the user:
```sql
UPDATE users 
SET subscription_tier = ?, 
    subscription_status = ?, 
    subscription_end_date = ? 
WHERE id = ?  -- app_user_id from webhook
```

## User ID Flow

### ✅ Correct Flow (User Logged In)
1. User logs into app → `Purchases.logIn(userUUID)` called
2. User purchases subscription → RevenueCat stores `userUUID` as `app_user_id`
3. Webhook fires → Contains `app_user_id: "userUUID"`
4. Server updates → Finds user by UUID and updates subscription

### ❌ Problem Flow (User Not Logged In)
1. User not logged in → RevenueCat uses anonymous ID
2. User purchases subscription → RevenueCat stores `$RCAnonymousID:xxx` as `app_user_id`
3. Webhook fires → Contains `app_user_id: "$RCAnonymousID:xxx"`
4. Server cannot update → No user found with anonymous ID

## Handling Anonymous IDs

### Detection
The webhook handler checks if `app_user_id` starts with `$RCAnonymousID:`:

```javascript
if (app_user_id && app_user_id.startsWith('$RCAnonymousID:')) {
  // Handle anonymous ID
}
```

### Fallback Options
1. **Check Aliases**: RevenueCat may have aliases array with previous user IDs
2. **Check original_app_user_id**: May contain the first user ID used
3. **Log Warning**: Alert that user needs to log in to link purchase

### Recovery
If a purchase was made with an anonymous ID:
1. User logs into app → `Purchases.logIn(userUUID)` called
2. RevenueCat links anonymous purchase to user UUID
3. Future webhooks will contain the correct UUID
4. User's subscription will be properly linked

## Important Notes

1. **User Must Be Logged In**: For webhooks to work correctly, users must be logged in when making purchases
2. **Anonymous Purchases**: If a user purchases while anonymous, they need to log in later to link the purchase
3. **RevenueCat Linking**: RevenueCat automatically links anonymous purchases to user IDs when `logIn()` is called
4. **Webhook Retries**: RevenueCat will retry webhooks, so if user logs in later, the webhook will fire again with correct ID

## Testing

### Test User Identification
1. Log in to app → Check console for "RevenueCat login successful"
2. Make a test purchase → Check webhook logs for correct `app_user_id`
3. Verify database → Check that `subscription_tier` was updated correctly

### Test Anonymous ID Handling
1. Don't log in → Make purchase (if possible in sandbox)
2. Check webhook → Should see anonymous ID warning
3. Log in → RevenueCat should link purchase to user
4. Check webhook again → Should see correct UUID

## Code Locations

- **Client Login**: `client/context/AuthContext.js` - Sets RevenueCat user ID on login
- **Client Service**: `client/services/RevenueCatService.js` - `logIn()` and `logOut()` methods
- **Webhook Handler**: `server/controllers/payments/revenueCatController.js` - Processes webhooks and updates users

