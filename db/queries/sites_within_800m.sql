-- Properties within 800 m (straight line) of each station, with distance in metres.
-- '::geography' makes ST_Distance / ST_DWithin work in metres on the WGS 84 ellipsoid.
-- Saved as a file so the analysis re-runs on next month's data.
SELECT p.id,
       s.name                                         AS station,
       ST_Distance(p.geom::geography, s.geom::geography) AS d_m
FROM properties p
JOIN stations s
  ON ST_DWithin(p.geom::geography, s.geom::geography, 800)
ORDER BY d_m;
