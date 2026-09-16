-- Demo schema + seed for pesticide-scanner
-- Safe for student/demo use
-- Run in Supabase SQL Editor

begin;

-- 1) Tables
create table if not exists ingredients (
  id bigint generated always as identity primary key,
  name text not null unique,
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  score_penalty integer not null default 0,
  concerns text
);

create table if not exists products (
  id bigint generated always as identity primary key,
  barcode text not null unique,
  name text not null,
  brand text,
  category text
);

create table if not exists product_ingredients (
  id bigint generated always as identity primary key,
  product_id bigint not null references products(id) on delete cascade,
  ingredient_id bigint not null references ingredients(id) on delete cascade,
  unique (product_id, ingredient_id)
);

create table if not exists issues (
  id bigint generated always as identity primary key,
  barcode text,
  product_name text,
  issue_type text,
  description text,
  email text,
  created_at timestamp default now()
);



-- 2) Demo-friendly permissions
alter table if exists ingredients disable row level security;
alter table if exists products disable row level security;
alter table if exists product_ingredients disable row level security;
alter table issues disable row level security;

-- 3) Clear old demo data
delete from product_ingredients;
delete from products;
delete from ingredients;

-- Optional: reset identity counters for clean demo IDs
alter sequence if exists ingredients_id_seq restart with 1;
alter sequence if exists products_id_seq restart with 1;
alter sequence if exists product_ingredients_id_seq restart with 1;

-- 4) Ingredients
insert into ingredients (name, risk_level, score_penalty, concerns) values
  ('Glyphosate', 'high', 35, 'Possible carcinogenicity concern; environmental toxicity concern'),
  ('Pyrethrin', 'medium', 20, 'May affect aquatic organisms; moderate toxicity concern'),
  ('Citric Acid', 'low', 5, 'Generally lower concern'),
  ('Permethrin', 'high', 30, 'Toxic to aquatic life; possible neurotoxicity concern'),
  ('Malathion', 'high', 35, 'Possible neurotoxicity concern; environmental hazard'),
  ('Neem Oil', 'low', 5, 'Generally considered lower concern when used as directed'),
  ('Boric Acid', 'medium', 15, 'Moderate toxicity concern depending on exposure'),
  ('Spinosad', 'medium', 15, 'Moderate environmental concern; toxic to some pollinators'),
  ('Acetic Acid', 'low', 5, 'Lower concern but may cause irritation'),
  ('Diatomaceous Earth', 'low', 5, 'Low chemical concern; inhalation irritation possible'),
  ('Copper Sulfate', 'medium', 20, 'Moderate aquatic toxicity concern; use carefully');

-- 5) Products
insert into products (barcode, name, brand, category) values
  ('123456789012', 'WeedClear Pro', 'GreenFarm', 'Herbicide'),
  ('987654321098', 'BugShield Home', 'SafeGarden', 'Insecticide'),
  ('111111111111', 'NatureSafe Yard Spray', 'EcoHome', 'Insecticide'),
  ('222222222222', 'Ultra Weed Destroyer', 'FarmMax', 'Herbicide'),
  ('333333333333', 'Pet-Safe Ant Stop', 'HomeCare', 'Insecticide'),
  ('444444444444', 'Garden Fungus Control', 'PureLeaf', 'Fungicide'),
  ('555555555555', 'Organic Bug Mist', 'GreenNest', 'Insecticide'),
  ('666666666666', 'Heavy Duty Lawn Killer', 'AgriPower', 'Herbicide');

-- 6) Product ↔ Ingredient links
insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Glyphosate'
where p.barcode = '123456789012';

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Pyrethrin'
where p.barcode = '987654321098';

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Citric Acid'
where p.barcode = '987654321098';

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Neem Oil'
where p.barcode = '111111111111';

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Citric Acid'
where p.barcode = '111111111111';

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Glyphosate'
where p.barcode = '222222222222';

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Malathion'
where p.barcode = '222222222222';

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Boric Acid'
where p.barcode = '333333333333';

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Diatomaceous Earth'
where p.barcode = '333333333333';

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Copper Sulfate'
where p.barcode = '444444444444';

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Neem Oil'
where p.barcode = '555555555555';

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Spinosad'
where p.barcode = '555555555555';

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Permethrin'
where p.barcode = '666666666666';

insert into product_ingredients (product_id, ingredient_id)
select p.id, i.id
from products p
join ingredients i on i.name = 'Malathion'
where p.barcode = '666666666666';

-- 7) Helpful debug view
create or replace view product_ingredient_report as
select
  p.id as product_id,
  p.barcode,
  p.name as product_name,
  p.brand,
  p.category,
  i.id as ingredient_id,
  i.name as ingredient_name,
  i.risk_level,
  i.score_penalty,
  i.concerns
from product_ingredients pi
join products p on pi.product_id = p.id
join ingredients i on pi.ingredient_id = i.id
order by p.barcode, i.name;

commit;

-- Quick checks you can run after seeding:
-- select * from products order by id;
-- select * from ingredients order by id;
-- select * from product_ingredients order by id;
-- select * from product_ingredient_report;