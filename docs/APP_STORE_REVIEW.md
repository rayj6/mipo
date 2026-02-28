# App Store Review – Demo Account & Checklist

Apple rejected the first submission for **Guideline 2.1 (demo account)** and **5.1.1 (location purpose string)** and **2.1 (app bug)**. Use this checklist before each submission.

---

## 1. Demo account (required by Apple)

Apple needs a **username and password** to sign in and test all features (including Gallery and Profile).

### In App Store Connect

1. Open [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **Mipo**.
2. Select the version you are submitting (e.g. **1.0**).
3. Scroll to **App Review Information**.
4. Under **Sign-in required**, fill in:
  - **Username**: your demo account **email** (e.g. `demo@yourdomain.com` or a real test account).
  - **Password**: the account password.
5. In **Notes** (optional), you can add:
  - "Demo account has full access. After sign-in, use Profile and Gallery tabs. Create a strip via Home → pick template → background → take photos → generate."

### Create the demo account

- **Before submitting**, create this account on your **production** backend (same API URL used by the production app, e.g. `https://mipoapi.scarlet-technology.com`).
- Use a real email you control; ensure the password is correct and the account can log in.
- Optionally add 1–2 saved strips to that account (via the app) so reviewers can see Gallery content.

---

## 2. Production API URL (fixes “could not create account” bug)

If the app was built **without** a server URL, it used `localhost` and registration failed on Apple’s device.

- **Done in this project**: `eas.json` → `production` now has:
  - `"EXPO_PUBLIC_MIPO_SERVER_URL": "https://mipoapi.scarlet-technology.com"`
- Ensure that URL is your **live** API, reachable from the internet and working (register/login) before you submit.
- Rebuild the production app after changing `eas.json`: `eas build -p ios --profile production`.

---

## 3. Purpose strings (Privacy – 5.1.1)

- **Done in this project**: In `app.json`, the **expo-camera**, **expo-media-library**, and **expo-location** plugins now use **detailed purpose strings** that:
  - Explain how the app uses the permission.
  - Include a concrete example (e.g. “For example, you take photos at an event…”).
- After changing `app.json`, **rebuild** the app; purpose strings are baked into the binary.

---

## 4. Pre-submission checklist

- **Demo account** created on production API and working (login in the app).
- **App Store Connect** → App Review Information: **Username** and **Password** filled in for that demo account.
- **Production build** uses the correct API URL (check `eas.json` → `production` → `env`).
- **Server** at that URL is up and allows register/login from the internet.
- Test **Register** and **Login** on a real device (and preferably on an iPad) before submitting.
- **Purpose strings** in `app.json` are clear and include examples (camera, photo library, location).

---

## 5. If you change the API URL

- Update **eas.json** → **build** → **production** → **env** → **EXPO_PUBLIC_MIPO_SERVER_URL**.
- Run a new production build: `eas build -p ios --profile production`.
- Use the new build for the next submission.

