This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:


You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Supabase

Supabase integration files are available in `src/lib/supabase.ts` and `src/db/supabaseDb.ts`.

1. Copy `.env.example` to `.env.local`.
2. Fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the Supabase project settings.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Enable Anonymous Sign-Ins under Authentication > Providers.

The SQL schema enables Row Level Security so each anonymous user can only access their own categories and transactions. Keep the service-role key out of the browser and out of `.env.local` values prefixed with `NEXT_PUBLIC_`.

### Android push reminders

The application includes Web Push endpoints under `src/app/api/push`. Add the VAPID public key, VAPID private key, Supabase service-role key, and a cron secret to `.env.local`. The private values are server-only. Open Settings in the installed PWA, choose a reminder time, and press `Aktifkan` to register the device. Call `POST /api/push/remind` with `Authorization: Bearer <CRON_SECRET>` every minute from a scheduler to deliver reminders while the app is closed.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
