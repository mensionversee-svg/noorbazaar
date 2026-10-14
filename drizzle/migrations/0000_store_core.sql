create type public.app_role as enum ('admin','user');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, email text, created_at timestamptz not null default now());
grant select, insert, update on public.profiles to authenticated; grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "own profile read" on public.profiles for select to authenticated using (auth.uid()=id or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid()=id);
create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid()=user_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, email) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.email) on conflict do nothing;
  insert into public.user_roles(user_id, role) values (new.id, 'user') on conflict do nothing;
  if lower(new.email) in ('mujahidaliraza7@gmail.com','heartlessgirl557@gmail.com') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.products (
  id serial primary key, slug text unique not null, name text not null, brand text not null default '',
  category text not null default 'women', subcategory text not null default '', price integer not null default 0,
  compare_at integer, rating numeric not null default 5, review_count integer not null default 0, stock integer not null default 0,
  sold integer not null default 0, image text not null default '', images text[] not null default '{}', featured boolean not null default false,
  short_description text not null default '', description text not null default '', highlights jsonb not null default '[]',
  specs jsonb not null default '{}', variants jsonb not null default '[]', created_at timestamptz not null default now());
grant select on public.products to anon, authenticated; grant insert, update, delete on public.products to authenticated; grant all on public.products to service_role;
grant usage on sequence public.products_id_seq to authenticated;
alter table public.products enable row level security;
create policy "products public read" on public.products for select using (true);
create policy "products admin write" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.reviews (
  id uuid primary key default gen_random_uuid(), product_id integer not null references public.products(id) on delete cascade,
  user_id uuid, author text not null, city text not null default '', rating integer not null default 5,
  title text not null default '', body text not null default '', verified boolean not null default false, hidden boolean not null default false,
  created_at timestamptz not null default now());
grant select on public.reviews to anon, authenticated; grant insert, update, delete on public.reviews to authenticated; grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "reviews public read" on public.reviews for select using (hidden = false or public.has_role(auth.uid(),'admin'));
create policy "reviews own insert" on public.reviews for insert to authenticated with check (auth.uid()=user_id and hidden=false and verified=false);
create policy "reviews admin update" on public.reviews for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "reviews admin delete" on public.reviews for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.orders (
  id uuid primary key default gen_random_uuid(), order_number serial, user_id uuid, customer_name text not null, phone text not null,
  email text, city text not null, address text not null, notes text, items jsonb not null default '[]',
  subtotal integer not null default 0, discount integer not null default 0, shipping integer not null default 0, total integer not null default 0,
  coupon text, payment_method text not null default 'Cash on Delivery', status text not null default 'pending', created_at timestamptz not null default now());
grant insert on public.orders to anon; grant select, insert, update, delete on public.orders to authenticated; grant all on public.orders to service_role;
grant usage on sequence public.orders_order_number_seq to anon, authenticated;
alter table public.orders enable row level security;
create policy "orders guest insert" on public.orders for insert to anon with check (user_id is null and status='pending');
create policy "orders user insert" on public.orders for insert to authenticated with check ((user_id is null or user_id=auth.uid()) and status='pending');
create policy "orders read" on public.orders for select to authenticated using (user_id=auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "orders admin update" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "orders admin delete" on public.orders for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.site_settings (id integer primary key default 1, data jsonb not null default '{}', updated_at timestamptz not null default now(), constraint single_row check (id=1));
grant select on public.site_settings to anon, authenticated; grant insert, update on public.site_settings to authenticated; grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "settings public read" on public.site_settings for select using (true);
create policy "settings admin insert" on public.site_settings for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "settings admin update" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "product images public read" on storage.objects for select using (bucket_id='product-images');
create policy "product images admin insert" on storage.objects for insert to authenticated with check (bucket_id='product-images' and public.has_role(auth.uid(),'admin'));
create policy "product images admin update" on storage.objects for update to authenticated using (bucket_id='product-images' and public.has_role(auth.uid(),'admin'));
create policy "product images admin delete" on storage.objects for delete to authenticated using (bucket_id='product-images' and public.has_role(auth.uid(),'admin'));
