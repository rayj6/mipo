/**
 * Plan IDs for Apple IAP (configure in App Store Connect).
 * Use these when calling react-native-iap / purchase flow.
 */
export const IAP_PRODUCT_IDS = {
  WEEKLY: 'com.mipo.weekly',
  PRO_MONTHLY: 'com.mipo.pro.monthly',
  ANNUAL: 'com.mipo.annual',
} as const;

export type PlanId = 'FREE' | 'WEEKLY' | 'PRO' | 'ANNUAL';

export interface Plan {
  id: PlanId;
  name: string;
  nameVi: string;
  price: string;
  priceShort: string;
  audience: string;
  features: string[];
  /** Apple IAP product ID (null for FREE) */
  productId: string | null;
  /** Highlight as popular etc. */
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'FREE (Basic)',
    nameVi: 'FREE (Cơ bản)',
    price: '0đ',
    priceShort: '0đ',
    audience: 'Người dùng mới, trải nghiệm thử',
    productId: null,
    features: [
      '5GB lưu trữ ảnh',
      'Truy cập 20% kho template cơ bản',
      'Thay phông nền: tối đa 3 lượt/ngày',
      'Có dán watermark nhỏ của app',
    ],
  },
  {
    id: 'WEEKLY',
    name: 'WEEKLY (Events)',
    nameVi: 'WEEKLY (Sự kiện)',
    price: '19.000đ / Tuần',
    priceShort: '19.000đ',
    audience: 'Khách đi đám cưới, tiệc tùng, du lịch cuối tuần',
    productId: IAP_PRODUCT_IDS.WEEKLY,
    features: [
      'Mở khóa toàn bộ template trong 7 ngày',
      'Tải lên phông nền riêng: Không giới hạn',
      'Xuất ảnh chất lượng cao, không watermark',
    ],
  },
  {
    id: 'PRO',
    name: 'PRO (Monthly)',
    nameVi: 'PRO (Tháng)',
    price: '49.000đ / Tháng',
    priceShort: '49.000đ',
    audience: 'Gen Z, người yêu thích sống ảo thường xuyên',
    productId: IAP_PRODUCT_IDS.PRO_MONTHLY,
    highlight: true,
    features: [
      '20GB lưu trữ ảnh',
      'Toàn bộ kho template VIP & Trending',
      'Ưu tiên xử lý AI (render ảnh nhanh hơn)',
      'Lưu trữ ảnh gốc (RAW) để chỉnh sửa lại sau',
    ],
  },
  {
    id: 'ANNUAL',
    name: 'ANNUAL (Save)',
    nameVi: 'ANNUAL (Tiết kiệm)',
    price: '399.000đ / Năm',
    priceShort: '399.000đ',
    audience: 'Fan cứng, nhiếp ảnh gia tự do, KOL nhỏ',
    productId: IAP_PRODUCT_IDS.ANNUAL,
    features: [
      'Tất cả tính năng gói PRO',
      'Tiết kiệm ~35% so với mua theo tháng',
      'Nhận các bộ template "Limited Edition" mỗi quý',
    ],
  },
];
