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

## Supabase ERP Database Setup

The complete ERP schema is defined in `supabase/create_bookings_table.sql`. Run it once to create all required tables in your Supabase project.

### Recommended setup

1. Create a Supabase project.
2. Add `.env.local` with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Open `supabase/create_bookings_table.sql` in Supabase Studio SQL Editor and execute the script.
4. Or, if you use the Supabase CLI, run:
   ```powershell
   npm install -g supabase
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   .\supabase\setup.ps1
   ```
5. Confirm the tables exist: `common_parties`, `vessels`, `commodities`, `bookings`, `booking_items`, `bills_of_lading`, `container_activities`, `detention_rates`.
6. Start the app:
   ```bash
   npm run dev
   ```

### If you see a table cache error

- Make sure the SQL script has been executed in the same Supabase project as your `NEXT_PUBLIC_SUPABASE_URL`.
- Confirm `public.vessels` exists in the SQL editor or in the database schema.
- If needed, rerun the SQL script once after linking the project.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
