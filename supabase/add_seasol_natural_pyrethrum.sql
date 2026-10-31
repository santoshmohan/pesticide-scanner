-- Add Seasol EarthCare Natural Pyrethrum Insect Spray
-- Run in the Supabase SQL Editor.

begin;

insert into public.ingredients (name, risk_level, score_penalty, concerns)
values (
  'Pyrethrum',
  'high',
  30,
  'Highly toxic to aquatic life and beneficial insects'
)
on conflict (name) do nothing;

insert into public.products (barcode, name, brand, category, image_url)
values (
  '9320124232530',
  'Seasol EarthCare 1L Natural Pyrethrum Insect Spray',
  'Seasol',
  'Insecticide',
  '/Seasol_Earthcare_1L_Natural_Pyrethrum_Insect_Spray.png'
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
join public.ingredients i on i.name = 'Pyrethrum'
where p.barcode = '9320124232530'
on conflict (product_id, ingredient_id) do nothing;

commit;
