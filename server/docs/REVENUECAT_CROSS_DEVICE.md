# RevenueCat Cross-Device Subscription Syncing

## The Problem

When a user makes a purchase on one device and then logs in on a different device, we need to ensure their subscription is available on the new device.

## How It Works

### Scenario 1: Purchase on Device A, Login on Device A ✅
1. User installs app on Device A
2. User makes purchase (anonymous or logged in)
3. User logs in on Device A
4. `Purchases.logIn(userUUID)` transfers anonymous purchase to userUUID
5. Subscription is available immediately

### Scenario 2: Purchase on Device A, Login on Device B ✅
1. User installs app on Device A
2. User makes purchase → **Must be logged in** (so purchase is linked to userUUID)
3. User installs app on Device B
4. User logs in on Device B with same userUUID
5. `Purchases.logIn(userUUID)` **fetches purchases from RevenueCat servers**
6. App detects active subscription and syncs with backend
7. Subscription is available on Device B

### Scenario 3: Anonymous Purchase on Device A, Login on Device B ❌
1. User installs app on Device A
2. User makes purchase **while anonymous** (not logged in)
3. User installs app on Device B
4. User logs in on Device B
5. RevenueCat doesn't know about the anonymous purchase on Device A
6. Subscription is **not** available on Device B

**Solution**: User must log in on Device A first to link the purchase, then it will be available on Device B.

## Implementation

### Automatic Syncing on Login

When a user logs in, we:

1. **Call `Purchases.logIn(userUUID)`**
   - Fetches purchases linked to this userUUID from RevenueCat servers
   - Transfers any anonymous purchases from current device

2. **Check for Active Subscriptions**
   ```javascript
   const subscriptionTier = revenueCatService.getSubscriptionTier(customerInfo);
   if (subscriptionTier !== 'free') {
     // User has active subscription
   }
   ```

3. **Sync with Backend**
   - Calls `/api/subscription/sync` endpoint
   - Updates database with subscription tier and status
   - Refreshes user data in app

### Code Flow

```
User Logs In
    ↓
Purchases.logIn(userUUID)
    ↓
RevenueCat fetches purchases from servers
    ↓
Check if subscriptionTier !== 'free'
    ↓
If yes: Call /api/subscription/sync
    ↓
Backend updates user subscription
    ↓
App refreshes user data
    ↓
User sees subscription active ✅
```

## Key Points

1. **Purchases Must Be Linked to User ID**
   - If purchase is made while logged in, it's automatically linked
   - If purchase is made anonymously, user must log in on that device to link it

2. **RevenueCat Stores Purchases on Servers**
   - When `logIn()` is called, RevenueCat fetches all purchases for that userUUID
   - This works across devices because purchases are stored on RevenueCat's servers

3. **Automatic Syncing**
   - Happens on every login
   - No manual "restore purchases" needed (though we have that option too)
   - Backend is automatically updated

## Testing Cross-Device Scenarios

### Test 1: Same Device
1. Install app on Device A
2. Make purchase (logged in)
3. Verify subscription active
4. Log out and log back in
5. Verify subscription still active ✅

### Test 2: Different Device (Logged In Purchase)
1. Install app on Device A
2. Log in
3. Make purchase
4. Install app on Device B
5. Log in with same account
6. Verify subscription active ✅

### Test 3: Different Device (Anonymous Purchase)
1. Install app on Device A
2. Make purchase (not logged in)
3. Install app on Device B
4. Log in
5. Subscription NOT available ❌
6. Log in on Device A
7. Subscription now linked ✅
8. Log in on Device B again
9. Subscription now available ✅

## Best Practices

1. **Always Log In Before Purchase**
   - Encourage users to create account before purchasing
   - This ensures purchases are linked to user ID immediately

2. **Call `logIn()` Early**
   - Call it right after account creation
   - Call it on every login
   - This ensures purchases are always linked

3. **Handle Edge Cases**
   - Provide "Restore Purchases" button for users who purchased anonymously
   - Show clear messaging about account requirements for cross-device access

## Code Locations

- **Login Sync**: `client/context/AuthContext.js` - Automatically syncs on login
- **RevenueCat Service**: `client/services/RevenueCatService.js` - `logIn()` method
- **Backend Sync**: `server/controllers/payments/subscriptionController.js` - `syncSubscription()` endpoint

