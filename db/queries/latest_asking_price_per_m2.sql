-- Latest asking price per m² per property, with its source — "where did this price come from?"
-- Unpriced listings stay NULL (not 0) and are counted, not averaged.
SELECT DISTINCT ON (p.id)
       p.id,
       l.listing_date,
       l.asking_price_idr,
       l.asking_price_idr / NULLIF(p.floor_area_m2, 0) AS asking_price_per_m2,
       src.name AS source,
       src.retrieved_at
FROM properties p
JOIN listings l   ON l.property_id = p.id
JOIN sources  src ON src.id = l.source_id
ORDER BY p.id, l.listing_date DESC NULLS LAST;
