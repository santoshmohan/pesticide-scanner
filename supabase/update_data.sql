-- Enable RLS on all tables
alter table if exists ingredients enable row level security;
alter table if exists products enable row level security;
alter table if exists product_ingredients enable row level security;
alter table if exists issues enable row level security;

-- ingredients: read-only
create policy "Ingredients are readable"
  on ingredients for select
  using (true);

create policy "No insert on ingredients"
  on ingredients for insert
  with check (false);

create policy "No update on ingredients"
  on ingredients for update
  using (false);

create policy "No delete on ingredients"
  on ingredients for delete
  using (false);

-- products: read-only
create policy "Products are readable"
  on products for select
  using (true);

create policy "No insert on products"
  on products for insert
  with check (false);

create policy "No update on products"
  on products for update
  using (false);

create policy "No delete on products"
  on products for delete
  using (false);

    -- product_ingredients: read-only
    create policy "Product ingredients are readable"
    on product_ingredients for select
    using (true);

    create policy "No insert on product_ingredients"
    on product_ingredients for insert
    with check (false);

    create policy "No update on product_ingredients"
    on product_ingredients for update
    using (false);

    create policy "No delete on product_ingredients"
    on product_ingredients for delete
    using (false);

-- issues: disable anon access entirely
create policy "Issues are not accessible to anon"
  on issues for all
  using (false);

-- issues: disable anon access entirely
create policy "Issues are not accessible to anon"
  on issues for all
  using (false);