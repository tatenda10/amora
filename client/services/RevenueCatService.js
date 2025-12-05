import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// Replace with your actual keys
const API_KEYS = {
    apple: 'appl_YxZXJITtYwsCbQsdcaqgVqlOSUn', // iOS Key
    google: 'goog_CWoGSdjkifWQyCSKwDzFcfCgIcY' // Android Key
};

class RevenueCatService {
    constructor() {
        this.isInitialized = false;
        this.initPromise = null; // Track ongoing initialization
    }

    async init() {
        // If already initialized, return immediately
        if (this.isInitialized) {
            console.log('✅ RevenueCat already initialized, skipping...');
            return;
        }

        // If initialization is in progress, wait for it
        if (this.initPromise) {
            console.log('⏳ RevenueCat initialization in progress, waiting...');
            return this.initPromise;
        }

        // Start initialization
        this.initPromise = (async () => {
            try {
                const apiKey = Platform.OS === 'ios' ? API_KEYS.apple : API_KEYS.google;
                console.log(`🔧 Initializing RevenueCat for ${Platform.OS}...`);
                console.log(`   API Key: ${apiKey.substring(0, 15)}...`);
                
                Purchases.configure({ apiKey });
                
                this.isInitialized = true;
                console.log('✅ RevenueCat initialized successfully');
                
                // Log current customer info to verify connection
                try {
                    const customerInfo = await Purchases.getCustomerInfo();
                    console.log('✅ RevenueCat connection verified');
                    console.log(`   User ID: ${customerInfo.originalAppUserId}`);
                } catch (infoError) {
                    console.log('⚠️ Could not fetch customer info (this is normal on first launch)');
                }
            } catch (error) {
                console.error('❌ Error initializing RevenueCat:', error);
                this.isInitialized = false;
                this.initPromise = null;
                throw error;
            } finally {
                // Clear the promise after initialization completes
                this.initPromise = null;
            }
        })();

        return this.initPromise;
    }

    async getOfferings() {
        try {
            console.log('🔄 Fetching RevenueCat offerings...');
            const offerings = await Purchases.getOfferings();
            
            console.log('\n═══════════════════════════════════════════════════════');
            console.log('📦 REVENUECAT OFFERINGS REPORT');
            console.log('═══════════════════════════════════════════════════════\n');
            
            console.log('📊 Total Offerings Found:', Object.keys(offerings.all || {}).length);
            console.log('🎯 Current Offering:', offerings.current?.identifier || 'None');
            
            // Collect all packages from all offerings
            const allPackages = [];
            
            // Log all offerings and collect packages
            if (offerings.all && Object.keys(offerings.all).length > 0) {
                Object.keys(offerings.all).forEach((offeringKey) => {
                    const offering = offerings.all[offeringKey];
                    console.log(`\n🔍 Offering "${offeringKey}":`);
                    console.log('  - Identifier:', offering.identifier);
                    console.log('  - Server Description:', offering.serverDescription);
                    console.log('  - Available Packages:', offering.availablePackages.length);
                    
                    // Add all packages from this offering to the combined list
                    offering.availablePackages.forEach((pack, index) => {
                        console.log(`\n    📦 Package ${index + 1}:`);
                        console.log('      - Package Identifier:', pack.identifier);
                        console.log('      - Package Type:', pack.packageType);
                        console.log('      - Product ID:', pack.product.identifier);
                        console.log('      - Product Title:', pack.product.title);
                        console.log('      - Product Description:', pack.product.description || 'N/A');
                        console.log('      - Price String:', pack.product.priceString);
                        console.log('      - Price Amount:', pack.product.price);
                        console.log('      - Currency Code:', pack.product.currencyCode);
                        console.log('      - Intro Price:', pack.product.introPrice?.priceString || 'N/A');
                        console.log('      - Subscription Period:', pack.product.subscriptionPeriod || 'N/A');
                        
                        // Check if product is available for purchase
                        const isAvailable = pack.product.identifier && pack.product.price > 0;
                        console.log('      - Available for Purchase:', isAvailable ? '✅ YES' : '❌ NO');
                        
                        // Add to combined list (avoid duplicates by product ID)
                        if (!allPackages.find(p => p.product.identifier === pack.product.identifier)) {
                            console.log(`      ✅ Adding to available packages`);
                            allPackages.push(pack);
                        } else {
                            console.log(`      ⏭️ Skipping duplicate product ID`);
                        }
                    });
                });
            } else {
                console.log('\n⚠️ No offerings found in offerings.all');
            }
            
            console.log('\n═══════════════════════════════════════════════════════');
            console.log(`✅ SUMMARY: ${allPackages.length} Unique Products Available`);
            console.log('═══════════════════════════════════════════════════════\n');
            
            allPackages.forEach((pack, index) => {
                console.log(`📦 Product ${index + 1}:`);
                console.log(`   ID: ${pack.product.identifier}`);
                console.log(`   Title: ${pack.product.title}`);
                console.log(`   Price: ${pack.product.priceString}`);
                console.log(`   Package Type: ${pack.packageType}`);
                console.log('');
            });
            
            // Return a combined offering object with all packages
            if (allPackages.length > 0) {
                // Use current offering as base, but replace packages with combined list
                const baseOffering = offerings.current || Object.values(offerings.all || {})[0];
                if (baseOffering) {
                    console.log('✅ Returning combined offering with all packages\n');
                    return {
                        ...baseOffering,
                        availablePackages: allPackages,
                        identifier: 'combined',
                        serverDescription: 'Combined offering with all packages'
                    };
                }
            }
            
            // Fallback to current offering if no packages found
            if (offerings.current !== null) {
                console.log(`\n✅ Using Current Offering: ${offerings.current.identifier}`);
                console.log(`   Packages: ${offerings.current.availablePackages.length}\n`);
                return offerings.current;
            }
            
            console.log('\n⚠️ WARNING: No offerings available from RevenueCat!');
            console.log('   This could mean:');
            console.log('   1. Products are not configured in RevenueCat dashboard');
            console.log('   2. Products are not published in Google Play Console / App Store');
            console.log('   3. App is not installed from Play Store (for Android testing)\n');
            return null;
        } catch (e) {
            console.error('\n❌ Error fetching offerings:', e);
            console.error('   Error details:', {
                message: e.message,
                code: e.code,
                stack: e.stack
            });
            throw e;
        }
    }

    async purchasePackage(pack) {
        try {
            // Validate package before purchase
            if (!pack || !pack.product) {
                throw new Error('Invalid package: Product information is missing');
            }

            // Check if product is available
            if (!pack.product.identifier) {
                throw new Error('Product not available: Missing product identifier');
            }

            // Validate product has price
            if (!pack.product.price || pack.product.price <= 0) {
                throw new Error(`Product not available: Invalid price for ${pack.product.identifier}`);
            }

            console.log('\n🛒 ATTEMPTING PURCHASE');
            console.log('═══════════════════════════════════════════════════════');
            console.log('Package Identifier:', pack.identifier);
            console.log('Product ID:', pack.product.identifier);
            console.log('Product Title:', pack.product.title);
            console.log('Price:', pack.product.priceString);
            console.log('Package Type:', pack.packageType);
            console.log('═══════════════════════════════════════════════════════\n');

            const { customerInfo } = await Purchases.purchasePackage(pack);
            console.log('✅ Purchase successful!');
            return customerInfo;
        } catch (e) {
            if (!e.userCancelled) {
                console.error('\n❌ PURCHASE ERROR');
                console.error('═══════════════════════════════════════════════════════');
                console.error('Error Code:', e.code);
                console.error('Readable Error Code:', e.readableErrorCode);
                console.error('Error Message:', e.message);
                console.error('Underlying Error:', e.underlyingErrorMessage);
                console.error('Full Error:', JSON.stringify(e, null, 2));
                console.error('═══════════════════════════════════════════════════════\n');

                // Re-throw with original error for proper handling
                throw e;
            }
            throw e;
        }
    }

    async restorePurchases() {
        try {
            const customerInfo = await Purchases.restorePurchases();
            return customerInfo;
        } catch (e) {
            console.error('Error restoring purchases:', e);
            throw e;
        }
    }

    async getCustomerInfo() {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            return customerInfo;
        } catch (e) {
            console.error('Error getting customer info:', e);
            throw e;
        }
    }

    // Check if user has a specific entitlement
    isPro(customerInfo) {
        return customerInfo?.entitlements?.active?.['pro_access'] !== undefined;
    }

    // Get subscription tier from customer info
    getSubscriptionTier(customerInfo) {
        if (!customerInfo || !customerInfo.entitlements) {
            return 'free';
        }

        const activeEntitlements = customerInfo.entitlements.active || {};
        
        // Check for premium entitlement
        if (activeEntitlements['premium'] || activeEntitlements['pro_access']) {
            return 'premium';
        }
        
        // Check for basic entitlement
        if (activeEntitlements['basic']) {
            return 'basic';
        }

        return 'free';
    }

    // Get all active entitlements
    getActiveEntitlements(customerInfo) {
        if (!customerInfo || !customerInfo.entitlements) {
            return {};
        }

        return customerInfo.entitlements.active || {};
    }

    // Check if subscription is active
    isSubscriptionActive(customerInfo) {
        const tier = this.getSubscriptionTier(customerInfo);
        return tier === 'premium' || tier === 'basic';
    }

    // Log in user with our internal user ID
    // This ensures webhooks contain our UUID instead of anonymous ID
    // Also fetches any purchases linked to this user ID (cross-device support)
    async logIn(userId) {
        try {
            if (!userId) {
                console.warn('⚠️ Cannot log in to RevenueCat: No user ID provided');
                return;
            }

            console.log(`🔐 Logging in to RevenueCat with user ID: ${userId}`);
            const { customerInfo } = await Purchases.logIn(userId);
            
            console.log('✅ RevenueCat login successful');
            console.log(`   User ID: ${customerInfo.originalAppUserId}`);
            
            // Check if user has active subscriptions (could be from another device)
            const activeEntitlements = this.getActiveEntitlements(customerInfo);
            const subscriptionTier = this.getSubscriptionTier(customerInfo);
            
            if (Object.keys(activeEntitlements).length > 0) {
                console.log(`   📦 Found active subscriptions: ${Object.keys(activeEntitlements).join(', ')}`);
                console.log(`   🎫 Subscription tier: ${subscriptionTier}`);
                console.log(`   💡 If this is a new device, subscriptions were fetched from RevenueCat servers`);
            } else {
                console.log(`   ℹ️  No active subscriptions found`);
            }
            
            return customerInfo;
        } catch (error) {
            console.error('❌ Error logging in to RevenueCat:', error);
            throw error;
        }
    }

    // Log out user (when user logs out of app)
    async logOut() {
        try {
            console.log('🔐 Logging out from RevenueCat');
            const { customerInfo } = await Purchases.logOut();
            console.log('✅ RevenueCat logout successful');
            return customerInfo;
        } catch (error) {
            console.error('❌ Error logging out from RevenueCat:', error);
            throw error;
        }
    }
}

export default new RevenueCatService();
