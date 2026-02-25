import { Platform, Alert } from 'react-native';
import { IAP_PRODUCT_IDS, type PlanId } from '../constants/plans';

/**
 * Apple In-App Purchase service.
 * Requires react-native-iap and a development build (does not work in Expo Go).
 * Configure product IDs in App Store Connect to match IAP_PRODUCT_IDS.
 */
let iapModule: typeof import('react-native-iap') | null = null;

try {
  iapModule = require('react-native-iap');
} catch {
  // Not available in Expo Go or when react-native-iap is not installed
}

const PRODUCT_ID_MAP: Record<string, string> = {
  WEEKLY: IAP_PRODUCT_IDS.WEEKLY,
  PRO: IAP_PRODUCT_IDS.PRO_MONTHLY,
  ANNUAL: IAP_PRODUCT_IDS.ANNUAL,
};

export async function isIAPAvailable(): Promise<boolean> {
  return iapModule != null && Platform.OS === 'ios';
}

export async function purchasePlan(planId: PlanId): Promise<{ success: boolean; error?: string }> {
  if (planId === 'FREE') {
    return { success: false, error: 'No purchase required' };
  }

  if (!iapModule) {
    Alert.alert(
      'In-App Purchase',
      'Thanh toán trong app chỉ khả dụng trên bản build thật (iOS). Vui lòng cài từ TestFlight hoặc App Store.',
      [{ text: 'OK' }]
    );
    return { success: false, error: 'IAP not available' };
  }

  const productId = PRODUCT_ID_MAP[planId];
  if (!productId) {
    return { success: false, error: 'Invalid plan' };
  }

  try {
    if (typeof iapModule.initConnection === 'function') await iapModule.initConnection();
    const getProducts = iapModule.getProducts ?? iapModule.fetchProducts;
    const products = getProducts ? await getProducts({ skus: [productId] }) : [];
    if (!products || products.length === 0) {
      if (typeof iapModule.endConnection === 'function') await iapModule.endConnection();
      Alert.alert('Lỗi', 'Không tìm thấy sản phẩm. Vui lòng thử lại sau.');
      return { success: false, error: 'Product not found' };
    }

    const requestPurchase = iapModule.requestPurchase ?? iapModule.requestSubscription;
    const result = requestPurchase
      ? await requestPurchase({ sku: productId } as { sku: string })
      : null;
    if (typeof iapModule.endConnection === 'function') await iapModule.endConnection();

    if (result && typeof result === 'object' && 'transactionId' in result) {
      return { success: true };
    }
    return { success: false, error: 'Purchase was cancelled or failed' };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Purchase failed';
    if (message.includes('cancel') || message.includes('user')) {
      return { success: false, error: 'Cancelled' };
    }
    Alert.alert('Thanh toán', message);
    return { success: false, error: message };
  }
}
