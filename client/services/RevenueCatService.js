import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// Replace with your actual keys
const API_KEYS = {
    apple: 'appl_...', // iOS Key
    google: 'goog_...' // Android Key
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
            if (offerings.current !== null) {
                return offerings.current;
            }
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
