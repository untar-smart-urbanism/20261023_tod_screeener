-- 002 — spatial indexes so "within 800 m" queries stay fast.
-- Geography casts in queries need a geography index to use it.
CREATE INDEX properties_geom_geog_idx ON properties USING gist ((geom::geography));
CREATE INDEX stations_geom_geog_idx   ON stations   USING gist ((geom::geography));
CREATE INDEX listings_property_idx    ON listings (property_id);
