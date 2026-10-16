-- Royal Diadem: run once in Supabase > SQL Editor
create table if not exists products(
  id uuid primary key default gen_random_uuid(),
  name text not null, category text not null default 'traditional',
  price numeric, description text, image_url text, video_url text,
  in_stock boolean not null default true, created_at timestamptz default now());
create table if not exists orders(
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  customer_name text, product_id uuid, product_name text, price numeric,
  quantity int default 1, notes text, status text not null default 'new');
alter table products enable row level security;
alter table orders enable row level security;
create policy "public read products" on products for select to anon, authenticated using (true);
create policy "admin write products" on products for all to authenticated using (true) with check (true);
create policy "anyone places order" on orders for insert to anon, authenticated with check (status = 'new');
create policy "admin manage orders" on orders for all to authenticated using (true) with check (true);
insert into storage.buckets(id,name,public) values('product-images','product-images',true) on conflict do nothing;
create policy "admin upload images" on storage.objects for insert to authenticated with check (bucket_id='product-images');
create policy "admin update images" on storage.objects for update to authenticated using (bucket_id='product-images');
create policy "admin delete images" on storage.objects for delete to authenticated using (bucket_id='product-images');
-- Video uploads (max 50MB each)
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-videos','product-videos',true,52428800,array['video/mp4','video/webm','video/quicktime']) on conflict do nothing;
create policy "admin upload videos" on storage.objects for insert to authenticated with check (bucket_id='product-videos');
create policy "admin update videos" on storage.objects for update to authenticated using (bucket_id='product-videos');
create policy "admin delete videos" on storage.objects for delete to authenticated using (bucket_id='product-videos');
