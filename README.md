# PayPaw

PayPaw is a simple Next.js 15 + TypeScript + Tailwind CSS app for tracking:

- Income
- Bills
- Safe To Spend

Safe To Spend is calculated as:

```ts
totalIncome - totalBills
```

Data is stored in `localStorage` when logged out. When Supabase is configured and the user logs in, PayPaw syncs the same data object to Supabase and keeps localStorage as backup.

Monthly data is stored under the `paypaw-data` key:

```ts
{
  activeMonth: "2026-06",
  months: {
    "2026-06": {
      income: [],
      bills: []
    }
  }
}
```

## Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Supabase Sync

Create this table in Supabase:

```sql
create table budget_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  data jsonb not null,
  updated_at timestamp with time zone default now()
);
```

Add these values to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
