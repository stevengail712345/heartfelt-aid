-- Testimonies: remove name clashes with campaigns
UPDATE public.testimonies SET person_name = 'Iryna Kovalenko',
  body = replace(body, 'Sofiya', 'Yaryna')
WHERE person_name = 'Iryna Melnyk';

UPDATE public.testimonies SET person_name = 'Wairimu Kariuki and her mother Esther',
  body = replace(body, 'Njeri', 'Wairimu')
WHERE person_name = 'Njeri Wanjiru and her mother Esther';

UPDATE public.testimonies SET person_name = 'Marta Zielinska'
WHERE person_name = 'Marta Kowalczyk';

UPDATE public.testimonies SET person_name = 'The Adeyinka family',
  body = replace(body, 'Amaka', 'Ngozi'),
  quote = replace(quote, 'Amaka', 'Ngozi')
WHERE person_name = 'The Okafor family';

UPDATE public.testimonies SET person_name = 'Yolanda Escobar'
WHERE person_name = 'Yolanda Reyes';

UPDATE public.testimonies SET person_name = 'The Villanueva family'
WHERE person_name = 'The Santos family';

UPDATE public.testimonies SET person_name = 'Chidinma Nwachukwu'
WHERE person_name = 'Chidinma Okonkwo';

-- Campaigns: 'Ana Sofia' clashes with 'Sofia Ferrari'
UPDATE public.campaigns SET
  beneficiary_name = 'Ana Beatriz Marques',
  title = replace(title, 'Ana Sofia', 'Ana Beatriz'),
  summary = replace(summary, 'Ana Sofia', 'Ana Beatriz'),
  story = replace(replace(story, 'Ana Sofia', 'Ana Beatriz'), 'Sofia', 'Beatriz')
WHERE slug = 'ana-preemie-retinopathy';