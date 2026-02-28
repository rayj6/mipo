# In-App Purchase Setup – App Store Connect (Mipo)

Your app expects these **Product IDs**. Create them exactly in App Store Connect:

| Plan    | Product ID         | Type                    |
|---------|--------------------|-------------------------|
| WEEKLY  | `com.mipo.weekly`  | Auto-renewable subscription |
| PRO     | `com.mipo.pro.monthly` | Auto-renewable subscription |
| ANNUAL  | `com.mipo.annual`   | Auto-renewable subscription |

---

## 1. Prerequisites

- **Paid Apple Developer Program** membership (In-App Purchase requires it).
- App already created in App Store Connect (you’ve submitted a build).
- **Banking & Tax** and **Paid Apps** agreements signed in App Store Connect.

---

## 2. Create a Subscription Group (for subscriptions)

1. Go to [App Store Connect](https://appstoreconnect.apple.com) → **My Apps**.
2. Select your app **Mipo**.
3. In the left sidebar, open **Monetization** → **Subscriptions** (or **In-App Purchases** → **Subscription Groups** in older UI).
4. Click **+** to create a **Subscription Group**.
5. **Reference name**: e.g. `Mipo Premium`.
6. **Group name** (shown to users): e.g. `Mipo Premium` or `Mipo Plans`.
7. Create the group.

---

## 3. Add subscription products

Inside the subscription group you just created, add three subscriptions.

### 3.1 WEEKLY – `com.mipo.weekly`

1. Click **+** to add a subscription.
2. **Reference name**: `Weekly` (internal only).
3. **Product ID**: **`com.mipo.weekly`** (must match exactly).
4. **Subscription duration**: **1 week**.
5. **Subscription prices**:
   - Click **Add Subscription Price**.
   - Choose territory (e.g. Vietnam, United States).
   - For Vietnam: set price tier that equals ~19,000₫ (e.g. Tier 1 or 2). Apple provides tiers; pick the closest.
   - Add more territories as needed.
6. **Localizations** (optional but recommended):
   - Add at least one localization (e.g. English, Vietnamese) with **Display name** and **Description**.
7. **Review information**: add screenshot if required (sometimes needed for first review).
8. Save.

### 3.2 PRO Monthly – `com.mipo.pro.monthly`

1. In the same subscription group, click **+** again.
2. **Reference name**: `PRO Monthly`.
3. **Product ID**: **`com.mipo.pro.monthly`**.
4. **Subscription duration**: **1 month**.
5. **Subscription prices**: e.g. ~49,000₫ for Vietnam (choose the matching price tier).
6. Add localizations and save.

### 3.3 ANNUAL – `com.mipo.annual`

1. In the same subscription group, click **+** again.
2. **Reference name**: `Annual`.
3. **Product ID**: **`com.mipo.annual`**.
4. **Subscription duration**: **1 year**.
5. **Subscription prices**: e.g. ~399,000₫ for Vietnam.
6. Add localizations and save.

---

## 4. Subscription group settings (optional but useful)

- **Subscription group level**:
  - Set **Service level** (e.g. “Premium access”).
  - You can set **Subscription group display name** and **rank** (order) for each product so WEEKLY, PRO, ANNUAL appear in the order you want.
- **Introductory offers** (optional): free trial or discounted first period.
- **Promotional offers** (optional): for win-back or custom discounts later.

---

## 5. Agreements, tax, and banking

- **App Store Connect** → **Agreements, Tax, and Banking**:
  - **Paid Apps** agreement must be **Active**.
  - **Banking** and **Tax** forms completed.
- Without this, IAP cannot go live.

---

## 6. App Store Connect – link IAP to the app

- In your app’s **App Store** tab (for the version you submit):
  - Under **In-App Purchases** (or **Subscription Groups**), add the subscription group / products to this version so they’re included in the same submission as the build.
- Submit the app (or new version) for review; IAP is reviewed together with the app.

---

## 7. Testing before release

1. **Sandbox testers**:
   - App Store Connect → **Users and Access** → **Sandbox** → **Testers**.
   - Create a Sandbox Apple ID (use a new email, not your real Apple ID).
2. On your iPhone:
   - **Settings** → **App Store** → sign out of your real Apple ID.
   - Do **not** sign in with the Sandbox account in Settings (iOS will prompt for it when you make a purchase in the app).
3. Install your build (TestFlight or development build) and run a purchase:
   - When the payment sheet appears, sign in with the **Sandbox** Apple ID when prompted.
   - Sandbox subscriptions renew quickly (e.g. 1 week ≈ 3 minutes) for testing.

---

## 8. Checklist

- [ ] Paid Developer Program + Banking & Tax & Paid Apps agreements active.
- [ ] Subscription group created (e.g. “Mipo Premium”).
- [ ] Three products created with **exact** Product IDs:
  - `com.mipo.weekly`
  - `com.mipo.pro.monthly`
  - `com.mipo.annual`
- [ ] Duration: 1 week, 1 month, 1 year.
- [ ] Prices set for your territories (e.g. Vietnam).
- [ ] Localizations added (name + description).
- [ ] Subscription group attached to the app version you submit.
- [ ] Sandbox tester created and tested on device.

---

## 9. If your app uses a different bundle ID

Your app’s bundle identifier is **`com.rayj.mipo`**. Product IDs (`com.mipo.weekly`, etc.) do not have to share the bundle ID prefix; they only need to match what is in your code in `src/constants/plans.ts` and `src/services/iapService.ts`. If you ever change product IDs in App Store Connect, update `IAP_PRODUCT_IDS` in `src/constants/plans.ts` to match.

---

## Quick links

- [App Store Connect](https://appstoreconnect.apple.com)
- [Create In-App Purchases (Apple)](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings)
- [Subscriptions (Apple)](https://developer.apple.com/app-store/subscriptions/)
