create table if not exists public.categories (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('INCOME', 'EXPENSE')),
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false
);

create table if not exists public.transactions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount bigint not null check (amount > 0),
  type text not null check (type in ('INCOME', 'EXPENSE')),
  category_id uuid references public.categories(id) on delete set null,
  date timestamptz not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false
);

alter table public.categories enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "Users manage own categories" on public.categories;
drop policy if exists "Users manage own transactions" on public.transactions;

create policy "Users manage own categories" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own transactions" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists categories_user_type_idx on public.categories(user_id, type, is_deleted);
create index if not exists transactions_user_date_idx on public.transactions(user_id, date, is_deleted);
