# Nails Insanity — e-commerce store

Hand painted press-on nails store for **Nails Insanity**. Built with Next.js 16,
Prisma, Tailwind CSS, and Razorpay. The owner manages her own products and
orders through a built-in admin panel — no products are hard-coded.

- **Storefront:** home, shop, product pages, cart, checkout, policy pages
- **Admin panel** (`/admin`): add/edit/delete products (price, sizes, photos,
  stock), view & manage orders
- **Payments:** Razorpay (India, INR). Runs in a safe **demo mode** until keys
  are added.
- **Order alerts:** free Telegram notification to the owner on every order
- **Shipping:** free across India (v1)

---

## 1. Run it locally

```bash
npm install
npx prisma generate      # generate the database client
npx prisma db push       # create the local SQLite database
npm run dev              # http://localhost:3000
```

The site opens at **http://localhost:3000**. The admin panel is at
**http://localhost:3000/admin** (password is in `.env`).

---

## 2. Environment variables (`.env`)

Copy `.env.example` to `.env` and fill in the values.

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | Database connection. Dev = `file:./dev.db` (SQLite). Prod = your Neon Postgres URL. |
| `ADMIN_PASSWORD` | The password the owner uses to log into `/admin`. **Change this.** |
| `SESSION_SECRET` | A long random string used to sign the admin login cookie. **Change this.** Generate one with `openssl rand -hex 32`. |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (from the Razorpay dashboard). Leave blank for demo mode. |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret. Leave blank for demo mode. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` (this one is used in the browser). |
| `TELEGRAM_BOT_TOKEN` | Bot token for owner order alerts. Leave blank to disable. |
| `TELEGRAM_CHAT_ID` | The owner's Telegram chat id. Leave blank to disable. |

> **Demo mode:** while the Razorpay keys are empty, checkout is *simulated* — an
> order is recorded but no real payment is taken. This lets you test the whole
> flow. As soon as real keys are added, live payments turn on automatically.

---

## 3. How the owner adds products

1. Go to **/admin** and log in with `ADMIN_PASSWORD`.
2. Click **+ Add product**.
3. Enter name, price (₹), description, **sizes** (add each size as a tag),
   **photos** (upload one or more), and **stock** quantity.
4. Toggle **Visible in shop** and (optionally) **Feature on homepage**.
5. Save. The product appears in the shop immediately.

Orders show up under **/admin → Orders**, where the status can be moved through
Pending → Paid → Shipped → Delivered.

---

## 4. Set up Razorpay (accept real payments)

1. Create/verify a Razorpay account at <https://razorpay.com>.
2. Dashboard → **Settings → API Keys → Generate Key**.
3. Copy the **Key ID** and **Key Secret** into `.env`:
   ```
   RAZORPAY_KEY_ID="rzp_live_xxxxxxxx"
   RAZORPAY_KEY_SECRET="xxxxxxxx"
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxxxxxx"
   ```
4. Restart the app. Checkout now takes real payments. Payment signatures are
   verified server-side before an order is marked paid.

---

## 5. Set up Telegram order alerts (free)

1. In Telegram, message **@BotFather**, send `/newbot`, follow the prompts, and
   copy the **bot token** it gives you → `TELEGRAM_BOT_TOKEN`.
2. Send any message to your new bot (so it can message you back).
3. Get your chat id: open
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser and look
   for `"chat":{"id":...}` → that number is `TELEGRAM_CHAT_ID`.
4. Restart the app. The owner now gets a Telegram message on every new order.

---

## 6. Deploy for free (Vercel + Neon Postgres)

The local SQLite database can't run on Vercel (its filesystem is read-only), so
production uses a free hosted Postgres from **Neon**.

1. **Create a Neon database** at <https://neon.tech> (free tier) and copy the
   connection string.
2. **Switch the database provider** in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. Push the schema to Neon:
   ```bash
   DATABASE_URL="<your-neon-url>" npx prisma db push
   ```
4. **Push the code to GitHub**, then import the repo at
   <https://vercel.com/new>.
5. In Vercel → Project → **Settings → Environment Variables**, add every
   variable from section 2 (using the Neon `DATABASE_URL`).
6. Deploy. You get a free `https://<project>.vercel.app` URL.

### Product image uploads on Vercel

In local dev, uploaded photos are saved to `public/uploads`. Vercel's filesystem
is read-only, so for production switch image uploads to **Vercel Blob**:

1. `npm install @vercel/blob`
2. In the Vercel dashboard, enable **Blob** storage (adds a
   `BLOB_READ_WRITE_TOKEN`).
3. In `src/app/api/upload/route.ts`, replace the `writeFile` block with:
   ```ts
   import { put } from "@vercel/blob";
   const blob = await put(name, file, { access: "public" });
   return NextResponse.json({ ok: true, url: blob.url });
   ```

---

## 7. Things to customise before launch

- **Policy text:** the Store Policy, Terms, Shipping & Return, and Contact pages
  contain placeholder text. Replace it with the exact wording from the current
  site. Files:
  - `src/app/store-policy/page.tsx`
  - `src/app/terms/page.tsx`
  - `src/app/shipping-return/page.tsx`
  - `src/app/contact/page.tsx`
- **Logo:** drop the real logo at `public/logo.png` and update
  `src/components/Logo.tsx` (instructions are in that file).
- **Contact details / socials:** edit `src/lib/site.ts`.

---

## Notes for later (international expansion)

The v1 build is India-only by design. When ShipGlobal confirms API access, the
codebase can be extended with region-based currency display and live
international shipping rates without a rebuild — pricing and shipping are already
computed server-side in one place (`src/app/api/checkout/create-order`).

---

## Project structure

```
src/
  app/
    page.tsx                 Home
    shop/                    Product grid
    product/[slug]/          Product detail
    cart/  checkout/         Cart & checkout
    order/[reference]/       Order confirmation
    store-policy/ terms/ ... Policy pages
    contact/
    admin/                   Admin panel (login, dashboard, products, orders)
    api/                     Razorpay, admin auth, product CRUD, upload, orders
  components/                UI + admin components
  lib/                       prisma, auth, razorpay, telegram, products, site
prisma/schema.prisma         Database schema
```
