CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
CREATE TYPE lead_source AS ENUM ('referral', 'facebook', 'google', 'walk_in', 'cold_outreach', 'website', 'other');
CREATE TYPE service_type AS ENUM ('website', 'website_care', 'social_ads', 'bundle');
CREATE TYPE deal_stage AS ENUM ('discovery', 'proposal', 'negotiation', 'won', 'lost');
CREATE TYPE payment_kind AS ENUM ('one_time', 'recurring');

CREATE TABLE leads (
  id serial PRIMARY KEY,
  contact_name text NOT NULL,
  business_name text NOT NULL,
  email text,
  phone text,
  source lead_source NOT NULL DEFAULT 'other',
  status lead_status NOT NULL DEFAULT 'new',
  notes text,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE deals (
  id serial PRIMARY KEY,
  lead_id integer REFERENCES leads(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  service service_type NOT NULL,
  stage deal_stage NOT NULL DEFAULT 'discovery',
  one_time_value numeric(10,2) NOT NULL DEFAULT 0,
  monthly_value numeric(10,2) NOT NULL DEFAULT 0,
  expected_close date,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id serial PRIMARY KEY,
  deal_id integer REFERENCES deals(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  kind payment_kind NOT NULL,
  paid_on date NOT NULL DEFAULT current_date,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payments_paid_on_idx ON payments (paid_on);
CREATE INDEX leads_created_at_idx ON leads (created_at DESC);
CREATE INDEX deals_stage_idx ON deals (stage);
