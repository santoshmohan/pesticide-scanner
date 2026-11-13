-- Add OCP Eco-Oil Organic Insect Spray Ready To Use
-- Run in the Supabase SQL Editor.

begin;

insert into public.ingredients (name, risk_level, score_penalty, concerns)
values (
  'Botanical Oil',
  'low',
  5,
  'Botanical oil-based insecticide; follow label directions and avoid spraying directly on beneficial insects'
)
on conflict (name) do nothing;

insert into public.products (barcode, name, brand, category, image_url)
values (
  '9336099000487',
  'OCP Eco-Oil Organic Insecticide Miticide Ready To Use 750ml',
  'OCP',
  'Insecticide',
  '/ocp_eco-oil_ready_to_use_organic_insecticide_miticide_750ml.png'
)
on conflict (barcode) do update
set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  image_url = excluded.image_url;

insert into public.product_ingredients (product_id, ingredient_id)
select p.id, i.id
from public.products p
join public.ingredients i on i.name = 'Botanical Oil'
where p.barcode = '9336099000487'
on conflict (product_id, ingredient_id) do nothing;

commit;
