-- Add four products and update the Garden Basics product image.
-- Run in the Supabase SQL Editor.

begin;

insert into public.ingredients (name, risk_level, score_penalty, concerns)
values
  (
    'Piperonyl Butoxide',
    'high',
    30,
    'May increase the toxicity of insecticides; potential human and environmental toxicity concerns'
  ),
  (
    'Tau-Fluvalinate',
    'high',
    30,
    'Synthetic pyrethroid insecticide; toxic to aquatic organisms and may harm beneficial insects'
  ),
  (
    'Myclobutanil',
    'medium',
    20,
    'Systemic fungicide; use as directed and avoid unnecessary exposure'
  ),
  (
    'Spinetoram',
    'high',
    30,
    'Insecticide that can harm bees and other non-target insects, and is toxic to aquatic life'
  ),
  (
    'Eucalyptus Oil',
    'low',
    5,
    'May cause irritation; avoid direct exposure to people, pets, and beneficial insects'
  )
on conflict (name) do nothing;

insert into public.products (barcode, name, brand, category, image_url)
values
  (
    '9310428009945',
    'Yates 750ml Ready To Use Pyrethrum Insecticide',
    'Yates',
    'Insecticide',
    '/yates-750ml-ready-to-use-pyrethrum-insecticide.png'
  ),
  (
    '9310522030456',
    'Brunnings Rose Spray RTU 1L',
    'Brunnings',
    'Insecticide',
    '/brunnings-ready-to-use-rose-spray-1L.png'
  ),
  (
    '9310428544248',
    'Yates 200ml Success Ultra Insect Control',
    'Yates',
    'Insecticide',
    '/yates-200ml-success-ultra-insect-control.png'
  ),
  (
    '9310202234587',
    'Multicrop 1L EcoAnt Insect Spray',
    'Multicrop',
    'Insecticide',
    '/multicrop-1L-ecoant-insect-spray.png'
  )
on conflict (barcode) do update
set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  image_url = excluded.image_url;

update public.products
set image_url = '/garden-basics-pyrethrum.png'
where barcode = '9310963001169';

insert into public.product_ingredients (product_id, ingredient_id)
select p.id, i.id
from public.products p
join public.ingredients i
  on i.name in ('Pyrethrin', 'Piperonyl Butoxide')
where p.barcode = '9310428009945'
on conflict (product_id, ingredient_id) do nothing;

insert into public.product_ingredients (product_id, ingredient_id)
select p.id, i.id
from public.products p
join public.ingredients i
  on i.name in ('Tau-Fluvalinate', 'Myclobutanil')
where p.barcode = '9310522030456'
on conflict (product_id, ingredient_id) do nothing;

insert into public.product_ingredients (product_id, ingredient_id)
select p.id, i.id
from public.products p
join public.ingredients i on i.name = 'Spinetoram'
where p.barcode = '9310428544248'
on conflict (product_id, ingredient_id) do nothing;

insert into public.product_ingredients (product_id, ingredient_id)
select p.id, i.id
from public.products p
join public.ingredients i
  on i.name in ('Pyrethrin', 'Eucalyptus Oil')
where p.barcode = '9310202234587'
on conflict (product_id, ingredient_id) do nothing;

commit;
