UPDATE projects SET project_name = REPLACE(project_name, ' - ', ' - ');
UPDATE projects SET project_name = regexp_replace(project_name, ' [^a-zA-Z0-9 ]+ ', ' - ', 'g');
UPDATE deals    SET deal_name    = regexp_replace(deal_name,    ' [^a-zA-Z0-9 ]+ ', ' - ', 'g');
SELECT project_name FROM projects ORDER BY project_id LIMIT 10;
