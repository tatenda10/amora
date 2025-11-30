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
    }

    async init() {
        if (this.isInitialized) return;

        if (Platform.OS === 'ios') {
            Purchases.configure({ apiKey: API_KEYS.apple });
        } else if (Platform.OS === 'android') {
            Purchases.configure({ apiKey: API_KEYS.google });
        }

        this.isInitialized = true;
        console.log('RevenueCat initialized');
    }

    async getOfferings() {
        try {
            const offerings = await Purchases.getOfferings();
            console.log('📦 RevenueCat Offerings (Full):', JSON.stringify(offerings, null, 2));
            console.log('📊 Total Offerings:', Object.keys(offerings.all || {}).length);
            
            // Collect all packages from all offerings
            const allPackages = [];
            
            // Log all offerings and collect packages
            if (offerings.all) {
                Object.keys(offerings.all).forEach((offeringKey) => {
                    const offering = offerings.all[offeringKey];
                    console.log(`\n🔍 Offering "${offeringKey}":`);
                    console.log('  - Identifier:', offering.identifier);
                    console.log('  - Server Description:', offering.serverDescription);
                    console.log('  - Available Packages:', offering.availablePackages.length);
                    
                    // Add all packages from this offering to the combined list
                    offering.availablePackages.forEach((pack, index) => {
                        console.log(`    📦 Package ${index + 1}:`);
                        console.log('      - Identifier:', pack.identifier);
                        console.log('      - Package Type:', pack.packageType);
                        console.log('      - Product ID:', pack.product.identifier);
                        console.log('      - Product Title:', pack.product.title);
                        
                        // Add to combined list (avoid duplicates by product ID, not package identifier)
                        // Both packages might have same identifier ($rc_monthly) but different product IDs
                        if (!allPackages.find(p => p.product.identifier === pack.product.identifier)) {
                            console.log(`      ✅ Adding package: ${pack.product.title}`);
                            allPackages.push(pack);
                        } else {
                            console.log(`      ⏭️ Skipping duplicate: ${pack.product.title} (already exists)`);
                        }
                    });
                });
            }
            
            console.log(`\n✅ Combined Packages from All Offerings: ${allPackages.length}`);
            allPackages.forEach((pack, index) => {
                console.log(`\n📦 Combined Package ${index + 1}:`);
                console.log('  - Identifier:', pack.identifier);
                console.log('  - Package Type:', pack.packageType);
                console.log('  - Product ID:', pack.product.identifier);
                console.log('  - Product Title:', pack.product.title);
                console.log('  - Product Description:', pack.product.description);
                console.log('  - Price:', pack.product.priceString);
                console.log('  - Price Amount:', pack.product.price);
                console.log('  - Currency Code:', pack.product.currencyCode);
            });
            
            // Return a combined offering object with all packages
            if (allPackages.length > 0) {
                // Use current offering as base, but replace packages with combined list
                const baseOffering = offerings.current || Object.values(offerings.all || {})[0];
                if (baseOffering) {
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
                console.log('\n✅ Using Current Offering:', offerings.current.identifier);
                return offerings.current;
            }
            
            console.log('⚠️ No offerings available');
            return null;
        } catch (e) {
            console.error('Error fetching offerings:', e);
            throw e;
        }
    }

    async purchasePackage(pack) {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);
            return customerInfo;
        } catch (e) {
            if (!e.userCancelled) {
                console.error('Error purchasing package:', e);
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
}

export default new RevenueCatService();
