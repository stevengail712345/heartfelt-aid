-- Roles ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Campaigns -----------------------------------------------------------
CREATE TYPE public.campaign_category AS ENUM ('medical','education','housing','emergency','livelihood','water');
CREATE TYPE public.campaign_status AS ENUM ('draft','published','completed');

CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  beneficiary_name TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  category public.campaign_category NOT NULL DEFAULT 'medical',
  summary TEXT NOT NULL,
  story TEXT NOT NULL,
  image_url TEXT NOT NULL,
  total_need_cents BIGINT NOT NULL CHECK (total_need_cents > 0),
  pre_secured_cents BIGINT NOT NULL DEFAULT 0 CHECK (pre_secured_cents >= 0),
  donated_cents BIGINT NOT NULL DEFAULT 0 CHECK (donated_cents >= 0),
  donor_count INTEGER NOT NULL DEFAULT 0,
  status public.campaign_status NOT NULL DEFAULT 'published',
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view live campaigns"
  ON public.campaigns FOR SELECT TO anon, authenticated
  USING (status <> 'draft');
CREATE POLICY "Admins can view all campaigns"
  ON public.campaigns FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert campaigns"
  ON public.campaigns FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update campaigns"
  ON public.campaigns FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete campaigns"
  ON public.campaigns FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER campaigns_touch BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.campaign_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campaign_updates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_updates TO authenticated;
GRANT ALL ON public.campaign_updates TO service_role;
ALTER TABLE public.campaign_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view updates of live campaigns"
  ON public.campaign_updates FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.status <> 'draft'));
CREATE POLICY "Admins manage updates"
  ON public.campaign_updates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Testimonies ---------------------------------------------------------
CREATE TABLE public.testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name TEXT NOT NULL,
  location TEXT NOT NULL,
  quote TEXT NOT NULL,
  body TEXT,
  image_url TEXT NOT NULL,
  campaign_slug TEXT,
  helped_year INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonies TO authenticated;
GRANT ALL ON public.testimonies TO service_role;
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published testimonies"
  ON public.testimonies FOR SELECT TO anon, authenticated
  USING (is_published = true);
CREATE POLICY "Admins can view all testimonies"
  ON public.testimonies FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage testimonies"
  ON public.testimonies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER testimonies_touch BEFORE UPDATE ON public.testimonies
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Donations -----------------------------------------------------------
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  donor_name TEXT,
  donor_email TEXT,
  message TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  provider_session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view donations"
  ON public.donations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX donations_campaign_idx ON public.donations(campaign_id);
CREATE INDEX campaigns_status_idx ON public.campaigns(status);

-- Seed data -----------------------------------------------------------
INSERT INTO public.campaigns (slug, title, beneficiary_name, location, country, category, summary, story, image_url, total_need_cents, pre_secured_cents, donated_cents, donor_count, status, is_urgent, deadline) VALUES
('amara-heart-surgery', 'Amara needs heart surgery before her ninth birthday', 'Amara Njeri', 'Nairobi', 'Kenya', 'medical',
 'Born with a hole in her heart, Amara has been waiting two years for the operation that will let her run again.',
 E'Amara was six when a school nurse noticed she could not finish a lap of the playground without stopping to breathe. A cardiologist at Kenyatta National Hospital confirmed a large ventricular septal defect — a hole between the chambers of her heart.\n\nThe surgery is routine for surgeons who perform it. It is not routine for Amara''s family. Her mother, Grace, sells vegetables at the Gikomba market and earns roughly $4 on a good day. Her father died in 2021. Grace has kept Amara in school, kept the rent paid, and kept a small tin of savings under the bed that has never grown past a few thousand shillings.\n\nAmara has been on the surgical waiting list for two years. The hospital will schedule her within weeks of the full amount being cleared. Every month she waits, the strain on her heart grows and the risk of the operation rises.\n\nThe $14,500 covers the operation, eight days of post-operative intensive care, medication for the first year, and transport for Grace so she can stay beside her daughter.',
 '/__l5e/assets-v1/205c46dc-d14a-4dd0-a726-9af83c9502ac/amara.jpg', 1450000, 0, 982000, 214, 'published', true, '2026-09-30'),

('reyes-family-rebuild', 'The Reyes family is rebuilding after the typhoon took their roof', 'The Reyes Family', 'Guiuan, Eastern Samar', 'Philippines', 'housing',
 'They saved $2,500 themselves. They need $5,700 more to finish walls and a roof before the next storm season.',
 E'When the storm passed over Guiuan it left the Reyes home standing on three walls and nothing above them. Mario, a fisherman, lost his outrigger the same night. Lita, his wife, and her sister Nena have been sleeping under a tarpaulin stretched over the frame for eleven months.\n\nThis family did not wait for help. Mario has been crewing on other boats and Lita sells cooked rice cakes at the roadside. Between them they saved 140,000 pesos — about $2,500 — and bought the timber that is now stacked against the wall in the photograph. A local carpenter has agreed to work at cost.\n\nWhat they cannot cover is the remaining $5,700 for roofing sheets, cement, treated posts and the labour to raise a structure that will hold in the next typhoon rather than fold in it.\n\nStorm season begins again in June. The frame is up. The materials are half bought. This campaign closes the gap.',
 '/__l5e/assets-v1/198770fd-eb8e-42b1-aa7b-7d1bf9ce1c12/reyes.jpg', 820000, 250000, 314000, 96, 'published', true, '2026-06-01'),

('quispe-school-fees', 'Diego walks two hours to school. He may have to stop.', 'Diego Quispe', 'Ollantaytambo, Cusco', 'Peru', 'education',
 'Three years of secondary school fees, books, uniform and boarding for a boy who has never missed a day.',
 E'Diego is fifteen. He leaves his family''s house in the hills above Ollantaytambo at half past four in the morning and walks two hours down to the secondary school in the valley. He has not missed a day in four years. His teachers describe him, without hedging, as the strongest mathematics student they have taught.\n\nHis father''s potato harvest failed for the second year running. There is no money for the fees, the books, the uniform, or the boarding place in town that would end the four-hour daily walk.\n\nNo funds have been raised for Diego yet. This story went live this week.\n\n$3,600 covers three full years: enrolment, materials, uniform, and a bed in the school hostel from Monday to Friday. It carries him to the end of secondary school and to the university entrance exam his teachers are certain he can pass.',
 '/__l5e/assets-v1/bb3da4d5-3224-4a80-81a8-ae9ecf017b0e/quispe.jpg', 360000, 0, 0, 0, 'published', false, '2026-12-15'),

('rahman-sewing-workshop', 'Shirin is 87% of the way to reopening her tailoring workshop', 'Shirin Rahman', 'Sylhet', 'Bangladesh', 'livelihood',
 'Floodwater ruined her machines and stock. She has rebuilt almost everything — one industrial machine remains.',
 E'Shirin ran a four-machine tailoring workshop out of the front room of her house for nine years. It employed three other women from her lane. In August the river came into the house to waist height and stayed for six days.\n\nShe salvaged what she could and sold her gold bangles — the last thing she owned of her mother''s — to raise $400 toward replacing the machines. Donors here have covered most of the rest.\n\nWhat remains is one industrial overlock machine and a month of fabric stock. With them, all four women are back at work by the end of the month and the workshop is earning again.\n\nShirin has asked us to say plainly that she is not asking for charity but for the last piece of a business she has already rebuilt.',
 '/__l5e/assets-v1/3e74b1c6-19ee-40ab-b0fc-bfa0ee2f4d87/rahman.jpg', 185000, 40000, 126000, 71, 'published', false, '2026-08-20'),

('kovalenko-prosthetic', 'Andriy is learning to walk again and needs a prosthetic limb', 'Andriy Kovalenko', 'Lviv', 'Ukraine', 'medical',
 'His family and community raised $4,000. A fitted prosthetic and a year of rehabilitation cost $11,200 in total.',
 E'Andriy was a school caretaker for nineteen years. He lost his right leg below the knee in a shelling incident in his home city and spent four months in hospital.\n\nHe is now in outpatient physiotherapy three mornings a week, working with parallel bars on a temporary walking aid. His clinicians say he is an excellent candidate for a fitted prosthetic — he is fit, he is stubborn, and he intends to go back to work.\n\nHis brother, his former colleagues and his church raised $4,000 between them. That is a substantial amount in Lviv this year and it is genuinely everything they had.\n\nThe remaining $7,200 covers the fitted limb, the socket adjustments over the first year as the residual limb changes shape, and the rehabilitation programme that teaches him to use it properly.',
 '/__l5e/assets-v1/b6203472-82e4-401b-8d9f-975593964ed1/kovalenko.jpg', 1120000, 400000, 238000, 63, 'published', false, '2026-10-31'),

('adeyemi-cancer-treatment', 'Folake has stage two breast cancer and four months to start treatment', 'Folake Adeyemi', 'Lagos', 'Nigeria', 'medical',
 'A widowed mother of two facing a full course of surgery, chemotherapy and radiotherapy she cannot afford.',
 E'Folake is forty-three. She raises her two youngest grandchildren since her daughter died in 2023, and she sells fabric from a stall in Mushin market.\n\nA lump she had ignored for a year turned out to be a stage two invasive carcinoma. Her oncologist at LUTH has given her a treatment plan: mastectomy, six cycles of chemotherapy, twenty-five sessions of radiotherapy, and two years of hormonal therapy. Started promptly, her five-year survival probability is above eighty percent. Delayed a year, it falls sharply.\n\nShe has no savings and no insurance. She has already stopped taking the bus to the market to save the fare.\n\nThis is the largest single request currently on our platform, and the most time-critical. $22,400 covers the entire treatment plan, her transport to every appointment, and a small monthly allowance so the grandchildren stay in school while she is too ill to trade.',
 '/__l5e/assets-v1/ab1cd483-1c5c-4668-abba-6f9d83752bae/adeyemi.jpg', 2240000, 0, 427500, 138, 'published', true, '2026-08-01'),

('mendoza-village-well', 'A borehole for eleven families who walk 5km for water', 'The Mendoza Family and neighbours', 'Sololá', 'Guatemala', 'water',
 'Eleven households have pooled $1,200. A drilled borehole and hand pump costs $6,400 and serves them for decades.',
 E'Eleven households at the end of a dirt road in the Sololá highlands share no water source. Every day, mostly the women and children, they walk five kilometres each way to a stream that runs brown after rain and dries to a trickle in March.\n\nThe families held a meeting last year, agreed a per-household contribution, and have collected $1,200 in cash — a genuinely enormous sum for them and the result of eighteen months of small monthly payments.\n\nA drilling contractor has surveyed the site and confirmed good water at 42 metres. A borehole, casing, hand pump, concrete apron and a two-day community maintenance training costs $6,400 all in.\n\nThe campaign is close. What is left covers the pump head and the apron.',
 '/__l5e/assets-v1/8a9312c4-f4f2-4fc1-b544-8df45568d80e/mendoza.jpg', 640000, 120000, 452000, 187, 'published', false, '2026-07-15'),

('thapa-classroom-roof', 'FUNDED — Sunita''s village classroom has been rebuilt', 'Sunita Thapa and 46 classmates', 'Dhading', 'Nepal', 'education',
 'Fully funded in nine weeks. The roof and floor of the village primary school were replaced before monsoon.',
 E'Sunita is nine. Her village primary school in Dhading had a corrugated roof that leaked over three of its four classrooms and a floor that turned to mud each monsoon. Classes were simply cancelled on heavy days — roughly forty school days a year lost.\n\nThe community asked for $2,950 to replace the roof sheets, lay a concrete floor and install shuttered windows.\n\nThe campaign reached its target in nine weeks with 312 donors. Work finished in April, ahead of the monsoon.\n\nWe are leaving this story published so you can see what a completed campaign looks like. Sunita''s school has not lost a day since.',
 '/__l5e/assets-v1/2051cef3-04d8-4f28-b134-7b896d3f2cd7/thapa.jpg', 295000, 0, 295000, 312, 'completed', false, NULL),

('silva-neonatal-care', 'Baby Théo was born at 27 weeks and needs eight more weeks of neonatal care', 'Camila and baby Théo Silva', 'Recife', 'Brazil', 'emergency',
 'The family has covered $5,300 through savings and relatives. Eight weeks of specialist NICU care remains.',
 E'Théo arrived thirteen weeks early, weighing 940 grams. He is stable, he is feeding, and his neonatologist expects him to go home healthy — but he needs another eight weeks in a specialist neonatal unit with respiratory support and monitoring.\n\nCamila is twenty-four. She and her husband emptied their savings, and her parents and two aunts contributed, raising $5,300 between them. The unit has continued treating Théo on that basis.\n\nThe remaining $12,500 covers eight weeks of NICU bed and nursing, respiratory support, and the follow-up developmental appointments through his first year.\n\nThis campaign opened four days ago.',
 '/__l5e/assets-v1/d07909f5-3fbe-49b1-98b4-6d10b7fcf09f/silva.jpg', 1780000, 530000, 120000, 34, 'published', true, '2026-09-10');

INSERT INTO public.campaign_updates (campaign_id, title, body, created_at) VALUES
((SELECT id FROM public.campaigns WHERE slug = 'amara-heart-surgery'), 'Pre-operative assessment completed', 'Amara passed her pre-operative cardiac assessment this week. The surgical team confirmed she is fit for the procedure and will schedule her within three weeks of the funds clearing.', now() - INTERVAL '9 days'),
((SELECT id FROM public.campaigns WHERE slug = 'amara-heart-surgery'), 'Two thirds of the way there', 'Thank you to the 214 people who have given so far. Grace asked us to pass on that she reads every message left with a donation.', now() - INTERVAL '25 days'),
((SELECT id FROM public.campaigns WHERE slug = 'reyes-family-rebuild'), 'Timber delivered to site', 'The treated posts and floor timber the family bought with their own savings arrived on Tuesday. The carpenter starts framing next week.', now() - INTERVAL '12 days'),
((SELECT id FROM public.campaigns WHERE slug = 'mendoza-village-well'), 'Drilling contractor confirmed', 'The survey found good water at 42 metres and the contractor has pencilled in a start date. Only the pump head and apron remain unfunded.', now() - INTERVAL '6 days'),
((SELECT id FROM public.campaigns WHERE slug = 'thapa-classroom-roof'), 'Work completed', 'The new roof, concrete floor and shuttered windows were finished in April. Photographs from the reopening are on our testimonies page.', now() - INTERVAL '95 days');

INSERT INTO public.testimonies (person_name, location, quote, body, image_url, campaign_slug, helped_year, sort_order) VALUES
('Njeri Wanjiru and her mother Esther', 'Kisumu, Kenya',
 'They paid for the operation and then they kept calling for a year to ask how she was. That is the part I did not expect.',
 E'Njeri was seven when she was treated for a congenital heart defect funded through this organisation. She is eleven now, in Standard Six, and plays netball.\n\nHer mother Esther says the follow-up mattered as much as the money: a small monthly transport allowance meant she never missed a check-up appointment, which is where most families in her position fall away.',
 '/__l5e/assets-v1/0b9ae5c5-3c22-44d7-b54d-06f42bec1be0/t-wanjiru.jpg', NULL, 2022, 1),
('The Santos family', 'Tacloban, Philippines',
 'We had the walls. Strangers gave us the roof. Four of us slept dry the first night and nobody said anything, we just lay there.',
 E'The Santos family rebuilt after losing their home to flooding. They contributed roughly a third of the cost themselves from savings and salvaged materials; donors covered the remainder.\n\nRoberto now works as part of the local build crew that constructs homes for other families in the same programme.',
 '/__l5e/assets-v1/963f9d91-28d3-423d-a523-07553fd9e257/t-santos.jpg', NULL, 2023, 2),
('Rosa Huamán', 'Arequipa, Peru',
 'My parents cannot read. I am a civil engineer. Three years of school fees is what stood between those two sentences.',
 E'Rosa''s secondary school fees, materials and boarding were funded from 2016. She graduated in civil engineering in 2024 and now works on rural water infrastructure in the Arequipa region.\n\nShe gives a fixed amount every month to the education fund that paid for her.',
 '/__l5e/assets-v1/aa17ea87-e210-4ba2-af73-36a2d21b05d0/t-huaman.jpg', NULL, 2024, 3),
('Chidinma Okonkwo', 'Enugu, Nigeria',
 'I finished chemotherapy in March. I am back at my stall. My grandchildren did not have to leave school for one single term.',
 E'Chidinma''s full course of cancer treatment was funded in 2023, along with a modest monthly allowance so her grandchildren stayed in school through the months she was unable to trade.\n\nShe is now two years clear and back running her market stall six days a week.',
 '/__l5e/assets-v1/c9d69d33-d865-47a5-bd9a-57b76a7ad081/t-okonkwo.jpg', NULL, 2023, 4);