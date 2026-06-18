# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Caffeine._.iv** — coffee & matcha ordering web app for a medical student seller. Brand name written exactly as "Caffeine._.iv" everywhere in the UI. Drinks delivered in sealed liquid bags (no cups). Orders compiled daily for next-day delivery. Payment via bank transfer + PromptPay QR + slip upload.

**Brand assets:** `icon.jpg` (full logo — mascot dog + brand text, use for navbar/PWA icon/favicon), `banner.jpg` (mascot only — use for hero/empty states/loading). Mascot is a sleepy dog on a coffee IV drip. Always place on white or `#FAF6F0` background.

## Stack

- **Frontend:** React 18 + Tailwind CSS **v4** (via `@tailwindcss/vite`), built with Vite, deployed on Vercel
- **Routing:** React Router v6
- **State:** React Context (CartContext, ShopContext, AuthContext) + useState
- **Backend:** Google Apps Script (GAS) → Google Sheets (data) + Google Drive (images)
- **Auth:** Username + password stored in `admins` Google Sheet — no OAuth
- **Real-time:** Polling via GAS every 15s with request guard on ConfirmPage
- **Charts:** Chart.js + react-chartjs-2
- **QR:** `qrcode.react` for PromptPay QR
- **GAS IDs:** Sheet `1gBqSZdbe8GQ3aOv5i_7nar6VJQ6U35dcjTdqlXHGjmc`, Drive folder `1GyKfyWg2pJXf_HcMlMyN6C_i89ZgcU0S`, Script `1xAUiKqj3sejFtcwkd-Ombpr02jTIa7_IRiu9s2ojXrqVVyMHKsZq9ysA`

## Commands

```bash
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview production build
```

No lint or test scripts exist in `package.json`.

**GAS deployment** (requires `clasp` CLI logged in):
```bash
cd gas && clasp push --force
```
The `.clasp.json` lives inside `gas/`, so clasp must run from that directory. After any `clasp push`, re-deploy the Web App in Apps Script editor (Deploy → Manage deployments → update) — otherwise the live URL still runs old code. Deployment must be configured as **Execute as Me, Anyone can access**.

## Architecture

All data lives in Google Sheets, accessed exclusively through a deployed GAS web app URL (`VITE_GAS_WEBAPP_URL`). There is no traditional API server.

**Data flow:**
- `gas.service.js` → `gasPost(action, data)` / `gasGet(action, params)` → GAS doPost/doGet → Google Sheets
- Every POST includes `"secret": VITE_GAS_SECRET` — GAS rejects mismatched tokens
- GAS response shape: `{ status: "success", data: {...} }` or `{ status: "error", message: "..." }`

**Context provider wrapping order** (in `App.jsx`): `ToastProvider > AuthProvider > ShopProvider > CartProvider > BrowserRouter`

**Context hierarchy:**
- `ShopContext` — polls `getConfig` on mount; if `shop_open=FALSE`, blocks all ordering with overlay
- `CartContext` — backed to `localStorage` (`civ_cart` key), cleared after order confirmed; cart item dedup key: `${id}|${bean}|${sweet}|${milk}` via exported `itemKey()` from `CartContext`
- `AuthContext` — session `{ admin_name, exp }` in `localStorage` (`admin_session` key), `exp` checked by `ProtectedRoute` on each admin load (8-hour session)

**Key design decisions:**
- Phone number is the primary key for loyalty stamps and wallet — no customer login required. Thai mobile format: `0[689]\d{8}`. Use `normalizePhone` (strips `[-\s().]`) + `validatePhone` from `src/utils/phoneNorm.js` before any GAS call
- Order ID format: `CIV-${Date.now()}-${random 4-char uppercase}`
- Slip upload: compress via Canvas API (<500KB) → SHA-256 hash → base64 → GAS → Drive → store URL + hash in Sheet
- Duplicate slip detection: GAS checks `slip_hashes` sheet before writing; returns `DUPLICATE_SLIP` error
- Slip verification API (EasySlip): called in GAS `doPost` during `submitOrder` — if invalid, auto-reject and notify admin
- Fast pass: only activates when `localStorage` has `usual_order` + sufficient wallet balance — skips form + slip
- Wallet: top-up by admin only (manual deposit) — deducted via GAS on order submit
- Language toggle (EN/TH): planned — `civ_lang` key in `localStorage`, simple key lookup from `i18n` object, no library. **Not yet implemented in `src/`.**
- ConfirmPage polling: 15s interval with request guard, hard stop after 2 hours
- Ward grouping banner: polls `getWardGrouping` every 60s on MenuPage
- Gacha: if `is_gacha=TRUE`, seller picks actual drink before changing status to `confirmed`

## Routes

**Customer:**
```
/ (MenuPage)  →  /checkout  →  /payment  →  /confirm/:orderId
/history   — localStorage-backed order history
/stamps    — stamp checker by phone
/wallet    — prepaid balance by phone
/feedback  — anonymous feedback
/calendar  — customer-visible calendar (blocked/exam dates from config)
```

**Admin (username/password protected via ProtectedRoute):**
```
/admin/login  →  /admin/dashboard
                     ├── /admin/orders/:id   — SlipVerifier, status control, drop-off upload
                     ├── /admin/menu         — CRUD, specialty toggle
                     ├── /admin/calendar     — open/close, exam/leave dates
                     ├── /admin/stock        — ingredient inventory
                     └── /admin/batch        — packing sorter + volume calculator
```

## Design System

**Font:** `'Plus Jakarta Sans', 'Sarabun', sans-serif` — single stack, Sarabun covers Thai.

**Typography:**

| Role | Size | Weight |
|---|---|---|
| Page title | 22–24px | 700 |
| Section heading | 17–18px | 600 |
| Body | 15px | 400 |
| Caption / label | 13px | 400–500 |
| Button | 15px | 600 |

**Color tokens:**

| Token | Value |
|---|---|
| Page background | `#FAF6F0` |
| Card / surface | `#FFFFFF` |
| Muted surface | `#F5EDE3` |
| Primary | `#7C3A1E` |
| Primary hover | `#A0522D` |
| Text | `#2C1A0E` |
| Text muted | `#8C6A52` |
| Border | `#E8D5C0` |
| Success | `#2E7D32` |
| Destructive | `#C0392B` |

**Shape & spacing:**

| Token | Value |
|---|---|
| Card radius | `1.25rem` |
| Button radius | `9999px` (pill) |
| Input radius | `0.875rem` |
| Page horizontal padding | `1rem` |
| Card padding | `1rem` |
| Section gap | `1.5rem` |
| Transition | `150ms ease-out` |

**Shadows:**
```css
--shadow-card:   0 2px 12px rgba(44, 26, 14, 0.07);
--shadow-sheet:  0 -4px 24px rgba(44, 26, 14, 0.10);
--shadow-button: 0 2px 8px rgba(124, 58, 30, 0.25);
```

**Component patterns:** bottom tab bar (Menu / Orders / Stamps / Profile), pill buttons, horizontal-scroll category chips, white cards with `shadow-card`. Content max-width `480px` centered on desktop.

**UI rules:** responsive-first (≥320px), touch targets ≥44px. No emojis, no filler microcopy. Icons via `lucide-react` with text labels. Airy spacing — content never touches screen edges.

**Styling convention:** All components use React inline `style={{}}` objects exclusively — zero Tailwind className usage exists in the codebase. Tailwind v4 is imported only for its preflight/reset and to make CSS custom properties available globally. Reference tokens via `var(--color-primary)` in inline style objects, not via Tailwind utility classes.

## localStorage Keys

| Key | Owner | Contents |
|---|---|---|
| `civ_cart` | CartContext | `CartItem[]` — persisted cart state |
| `admin_session` | AuthContext | `{ admin_name, exp }` — 8-hour admin session |
| `usual_order` | Fast pass | customer's saved order JSON + phone |
| `civ_lang` | i18n | `"th"` or `"en"` — planned, not yet in source |
| `civ_history` | HistoryPage | `OrderSummary[]` — client-side order history |

## Utils & Services

**`src/utils/helpers.js`:** `formatPrice(thb)`, `formatDate(dateStr)`, `formatDateTime(dateTimeStr)`, `generateOrderId()`, `compressImage(file, maxBytes?)`, `getTodayStr()`, `isCutoffPassed(cutoffDatetime)`

**`src/utils/phoneNorm.js`:** `normalizePhone(phone)` (strips `[-\s().]`), `validatePhone(phone)` — call both before any GAS call with a phone number

**`src/utils/slipHash.js`:** `hashBase64(base64String)` — async SHA-256 of slip image before upload

**`src/utils/promptpay.js`:** `generatePromptPayPayload(phoneOrTaxId, amountThb)` — generates PromptPay EMV QR string with CRC16; phone `0812345678` → `0066812345678` internally

**`src/services/gas.service.js`:** `gasGet(action, params?)` / `gasPost(action, data)` — all GAS calls go through these two functions. `gasGetCached(action, params, onUpdate)` — SWR wrapper: fires IDB cache hit immediately (calls `onUpdate(cached)` if cached), then fetches fresh from GAS and calls `onUpdate(freshData)` again; returns the network Promise. Cache key is the action name alone for zero-param calls (e.g., `'getMenu'`), or `action?param=value` for parameterized calls. Use for stable, display-heavy data (menu, config, ingredients, slots, batch). Use plain `gasGet` for real-time polling (order status, today's orders) and user-specific lookups (customer by phone).

**IDB cache invalidation:** after a successful POST write, call `idbDelete(actionName)` with the matching GET action's cache key — `'getMenu'` after `saveMenuItem`, `'getConfig'` after `updateConfig`, `'getIngredients'` after `updateStock`. Import `idbDelete` from `src/services/idb.service.js`.

**`src/services/auth.service.js`:** `adminLogin(username, password)`, `adminLogout()`, `getAdminSession()` — session validation lives here; `getAdminSession()` auto-removes expired entries

## Hook APIs

**`useShop()`** returns: `{ shopOpen, announcement, stampThreshold, gachaActive, promptpayNumber, deliveryLocations, blockedDates, loaded, refetchConfig }`. `promptpayNumber` falls back to `VITE_PROMPTPAY_NUMBER` if the Sheet field is empty. `deliveryLocations` is a `string[]` (empty = free-text fallback). `blockedDates` is a `string[]` of `YYYY-MM-DD` strings.

**`useCart()`** returns: `{ items, addItem(item), removeItem(key), updateQty(key, qty), updateItem(oldKey, newData), clearCart(), total, count, itemKey }`. `updateItem` replaces the item at `oldKey` with `newData`; if `newData` matches an existing key, quantities are merged. Import `itemKey` directly from `CartContext` when you need it outside the hook.

**`useToast()`** returns: `{ show(message, type?, duration?) }` from `src/components/Toast.jsx`. `type`: `'info'` (default) | `'success'` | `'error'`. Default duration 3000ms. Toast renders above bottom tab bar.

**Component note:** `src/components/order/StatusBadge.jsx` duplicates `src/components/StatusBadge.jsx` — use the top-level one.

## Data Gotchas

- Boolean fields from Sheets can be `true`/`false` or `"TRUE"`/`"FALSE"` string. Check both: `typeof val === 'boolean' ? val : String(val).toUpperCase() === 'TRUE'`
- `orders.items` arrives as JSON string from GAS — parse with: `typeof o.items === 'string' ? JSON.parse(o.items) : o.items`
- Date strings from Sheets are `YYYY-MM-DD` — parse as `new Date(date + 'T00:00:00')` to avoid timezone shift

## Environment Variables

```env
VITE_GAS_WEBAPP_URL=          # Deployed GAS web app URL
VITE_GAS_SECRET=              # Token checked by GAS on every request
VITE_PROMPTPAY_NUMBER=        # PromptPay phone/tax ID for QR generation
VITE_SLIP_VERIFY_API_KEY=     # EasySlip API key (optional)
```

GAS Script Properties (set in Apps Script → Project Settings):
- `GAS_SECRET` — same as VITE_GAS_SECRET
- `ADMIN_EMAIL` — receives new-order notification emails
- `SLIP_VERIFY_API_KEY` — EasySlip key (optional)

## GAS Actions Reference

**POST actions (no secret):** `login`, `setAdminPassword` (first-run only, blocked once any admin exists)

**POST actions (require secret):** `submitOrder`, `updateStatus`, `uploadDropoffPhoto`, `saveMenuItem`, `uploadMenuImage`, `updateConfig`, `updateStock`, `submitFeedback`, `topUpWallet`, `changePassword`, `requestDeliverySlot`

**GET actions:** `getMenu`, `getOrders&date=`, `getOrderStatus&order_id=`, `getConfig`, `getDeliverySlots&from=`, `getCustomer&phone=`, `getIngredients`, `getBatchSummary&date=`, `calcBatchVolumes&date=`, `getWardGrouping&date=`

**Key GAS functions in `gas/Code.gs`:**

| Function | Purpose |
|---|---|
| `doPost(e)` | Validate secret → route to action handler |
| `doGet(e)` | Route GET actions, return JSON |
| `saveToDrive(base64, filename)` | Save image, set public view, return URL |
| `checkDuplicateSlip(hash)` | Check `slip_hashes` sheet |
| `sendOrderNotification(order)` | `MailApp.sendEmail()` to admin on new order |
| `getWardGrouping(date)` | Aggregate active orders by location |
| `getBatchSummary(date)` | Group orders by location for packing |
| `calcBatchVolumes(date)` | Sum ingredient requirements from day's orders |
| `updateCustomerStamps(phone, delta)` | Increment/decrement stamps |
| `deductWallet(phone, amount)` | Deduct from customer wallet balance |
| `requestDeliverySlot_(data)` | Append slot request to `slot_requests` sheet (auto-creates sheet if missing) |

## Order Status Flow

`pending` → `confirmed` → `preparing` → `delivering` → `delivered` (or `rejected` from `confirmed`)

| Status | Color |
|---|---|
| `pending` | Amber |
| `confirmed` | Blue |
| `preparing` | Purple |
| `delivering` | Orange |
| `delivered` | Green (`#2E7D32`) |
| `rejected` | Red (`#C0392B`) |

## Google Sheets Schema

10 sheets: `admins`, `orders`, `customers`, `menu`, `delivery_slots`, `ingredients`, `feedback`, `config`, `slip_hashes`, `slot_requests`

- `orders`: `order_id`, `created_at`, `delivery_date`, `delivery_slot`, `delivery_location`, `customer_name`, `customer_phone`, `alt_contact`, `items` (JSON), `total_thb`, `note`, `is_gift`, `gift_message`, `is_beta_tester`, `is_fast_pass`, `is_gacha`, `slip_url`, `slip_hash`, `status`, `dropoff_photo_url`, `wallet_used_thb`
- `customers`: `phone` (PK), `name`, `stamps`, `wallet_thb`, `usual_order` (JSON), `last_location`, `total_orders`, `registered_at`
- `menu`: `item_id`, `name`, `name_th`, `base_price_thb`, `category`, `description`, `image_url`, `available`, `is_specialty_week`, `bean_options` (JSON), `milk_options` (JSON), `oat_surcharge_thb`, `ingredients_used` (JSON array of ingredient IDs)
- `delivery_slots`: `date`, `slot_id`, `slot_label`, `cut_off_datetime`, `capacity`, `booked`, `active`
- `config`: `shop_open`, `announcement`, `promptpay_number`, `stamp_threshold`, `gacha_active`, `delivery_locations` (JSON array string), `blocked_dates` (JSON array of YYYY-MM-DD strings)
- `slip_hashes`: `hash`, `order_id`, `created_at`
- `slot_requests`: `phone`, `preferred_date`, `preferred_time`, `created_at` — auto-created on first `requestDeliverySlot` call; admin reads directly in Sheets

## PWA

No service worker — GAS polling requires network. Minimal manifest only.

**`public/manifest.json`:**
```json
{
  "name": "CaffeineIV",
  "short_name": "CaffeineIV",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAF6F0",
  "theme_color": "#7C3A1E",
  "icons": [{ "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }]
}
```

**`index.html` meta tags:**
```html
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="CaffeineIV" />
<meta name="theme-color" content="#7C3A1E" />
```

iOS: no install prompt — user taps Share → "Add to Home Screen". No push notifications below iOS 16.4.

## Skills

Project-specific slash commands available in Claude Code:

| Skill | Trigger | What it does |
|---|---|---|
| `/gas-deploy` | deploy GAS, push backend | `clasp push --force` from `gas/`, checks live URL, reports if manual re-deploy needed |
| `/update-progress` | update progress, record status | Reads git log, updates `## Project Status` section in CLAUDE.md |
| `/commit-deploy` | commit and deploy, ship it, push everything | Stages + commits changes, pushes to origin/master (triggers Vercel), and runs `clasp push` if `gas/Code.gs` changed |

## Project Status

_Last updated: 2026-06-17_

### Done
- Full customer ordering flow: menu → checkout → payment (PromptPay QR + slip upload) → confirm page with 15s polling
- Admin dashboard: order list by date, status flow, slip viewer, drop-off photo upload
- Menu manager: CRUD, image upload to Drive, specialty-week toggle
- Admin calendar: shop open/close, exam/leave/blocked dates
- Stock/ingredient inventory page
- Batch packing sorter + volume calculator
- Ward grouping banner on MenuPage (polls every 60s)
- Config editor: all config fields (shop_open, announcement, promptpay_number, stamp_threshold, gacha_active, delivery_locations, blocked_dates)
- Loyalty: stamp checker page, wallet balance page (routes exist but tabs hidden from nav)
- Fast pass (saves usual_order to localStorage, skips form when wallet sufficient)
- Gacha mode (admin picks drink before confirming order)
- Wallet top-up via GAS action (admin-side only, no dedicated UI page)
- Order history (localStorage-backed, shown on HistoryPage)
- Customer calendar page (blocked/exam dates from config)
- Anonymous feedback page
- GAS backend: all actions, EasySlip slip verification, duplicate slip detection, email notifications on new order
- Sheet-based admin auth (username + password, 8-hour session, ProtectedRoute)
- Bottom sheet animations: CartDrawer + DrinkCustomizer slide-up on open, slide-down on dismiss
- Toast slide-in animation + prefers-reduced-motion support
- IndexedDB SWR cache (`src/services/idb.service.js` + `gasGetCached` in `gas.service.js`): menu, config, slots, ingredients, batch data served from cache instantly on repeat visits; write-path invalidation on saveMenuItem / updateConfig / updateStock
- Fixed /admin/batch crash: `getBatchSummary` GAS now returns `[{location, orders}]` array (was plain object); `BatchPage` normalizes stale IDB-cached object shape for graceful migration
- Bean surcharge pricing: `(+N)` notation in bean_options names parsed automatically; surcharge added to unit price in DrinkCustomizer; chips show clean label + `+฿N` badge
- Renamed "Bean" section to "Coffee Type" in DrinkCustomizer
- PWA install banner on MenuPage: Android triggers native prompt, iOS shows Share → Add to Home Screen toast; auto-hides when already installed or dismissed
- Cart item editing: pencil button in CartDrawer reopens DrinkCustomizer pre-filled with existing selections
- Add-on fields: DrinkCustomizer note replaced with structured add-on textarea + price input; add-on price baked into unit price; displayed separately in CartDrawer
- No-slots request form: when no delivery slots available at checkout, customers can submit phone/date/time preference saved to `slot_requests` sheet (auto-created on first submission via GAS)
- `itemKey` extended to include `add_on` field for correct cart dedup; `updateItem` added to CartContext

### In Progress
- _(nothing actively in flight)_

### Pending / Known Gaps
- Stamps and Wallet tabs hidden from bottom nav (routes still exist at /stamps and /wallet — re-add to Navbar.jsx to restore)
- Language toggle (EN/TH): `civ_lang` localStorage key defined, i18n planned, not yet implemented in any component
- No admin UI for wallet top-up (GAS `topUpWallet` action exists but no frontend page)
- No admin UI for password change (GAS `changePassword` action exists but no frontend)
- No admin UI to view/act on slot requests (data lands in `slot_requests` sheet — admin reads it directly in Sheets)
- EasySlip verification is optional — if `SLIP_VERIFY_API_KEY` is unset, slip check is skipped silently
- No push notifications (PWA limitation on iOS below 16.4; no service worker by design)
- GAS deploy requires manual re-deploy in Apps Script editor after every `clasp push` — `clasp deploy` is blocked by Google domain policy; @HEAD URL does not work for public web app access
- Americano/Latte item descriptions in Sheet still say "price adjusted at checkout" — stale after bean surcharge automation was added
