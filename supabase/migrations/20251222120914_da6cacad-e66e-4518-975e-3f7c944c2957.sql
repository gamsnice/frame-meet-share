-- 1) Add columns (safe to re-run)
alter table public.subscription_tier_config
  add column if not exists price_yearly_cents integer not null default 0,
  add column if not exists currency text not null default 'EUR',
  add column if not exists stripe_price_id text;

-- 2) Enable realtime for this table (may error if already added, that's fine)
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.subscription_tier_config';
  exception
    when others then
      -- ignore if it's already in the publication or publication doesn't exist
      null;
  end;
end $$;

-- 3) Enable RLS + create a public SELECT policy (safe to re-run)
alter table public.subscription_tier_config enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'subscription_tier_config'
      and policyname = 'Public can read tier config'
  ) then
    create policy "Public can read tier config"
      on public.subscription_tier_config
      for select
      using (true);
  end if;
end $$;

-- 4) Set meaningful default yearly prices (EUR) (adjust anytime later in admin UI)
update public.subscription_tier_config
set currency = 'EUR',
    price_yearly_cents =
      case tier
        when 'free' then 0
        when 'starter' then 19900
        when 'pro' then 29900
        when 'premium' then 44900
        when 'enterprise' then 0
        else price_yearly_cents
      end;