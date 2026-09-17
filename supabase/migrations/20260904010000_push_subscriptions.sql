create table if not exists public.push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  reminder_time time not null default '20:00',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create index if not exists push_subscriptions_reminder_idx on public.push_subscriptions(enabled, reminder_time);
