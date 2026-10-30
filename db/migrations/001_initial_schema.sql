-- 001 — initial schema (PostGIS). ILLUSTRATIVE: a database is optional in this course;
-- well-structured GeoJSON with the same fields and IDs is enough for the prototype.
-- Schema changes are numbered scripts in Git, never made by hand.

CREATE EXTENSION IF NOT EXISTS postgis;

-- Provenance: every row in every other table points here.
CREATE TABLE sources (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  licence       text NOT NULL,
  url           text,
  retrieved_at  date NOT NULL
);

-- The physical asset. Stable primary key — never the address or name.
CREATE TABLE properties (
  id             text PRIMARY KEY,
  type           text NOT NULL,
  floor_area_m2  numeric CHECK (floor_area_m2 > 0),
  geom           geometry(Point, 4326) NOT NULL,
  source_id      text NOT NULL REFERENCES sources(id)
);

CREATE TABLE stations (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  geom       geometry(Point, 4326) NOT NULL,
  source_id  text NOT NULL REFERENCES sources(id)
);

-- Each time a property was advertised. One property : many listings → price history.
-- asking_price_idr NULL = not disclosed, never 0.
CREATE TABLE listings (
  id                text PRIMARY KEY,
  property_id       text NOT NULL REFERENCES properties(id),
  asking_price_idr  bigint CHECK (asking_price_idr IS NULL OR asking_price_idr > 0),
  listing_date      date,
  source_id         text NOT NULL REFERENCES sources(id)
);
