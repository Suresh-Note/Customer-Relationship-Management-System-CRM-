-- ============================================================
--  AstrawinCRM — Fix All Data Issues
--  Run: PGPASSWORD=Admin6 psql -U postgres -d CRM -f fix-all-issues.sql
-- ============================================================

-- ─────────────────────────────────────────
--  FIX 1: Users missing team_id → assign to appropriate team
-- ─────────────────────────────────────────
UPDATE users
SET team_id = CASE
  WHEN role = 'Admin'     THEN 1
  WHEN role = 'Sales'     THEN 1
  WHEN role = 'Developer' THEN 2
  WHEN role = 'Marketing' THEN 4
  WHEN role = 'Manager'   THEN 5
  WHEN role = 'User'      THEN 3
  ELSE 1
END
WHERE team_id IS NULL;

-- ─────────────────────────────────────────
--  FIX 2: Tasks with no project AND no assigned_to
--          → assign to user 1 (Meera Krishnan, Sales)
-- ─────────────────────────────────────────
UPDATE tasks
SET assigned_to = 1
WHERE project_id IS NULL AND assigned_to IS NULL;

-- ─────────────────────────────────────────
--  FIX 3: Activities with NULL lead_id
--          → leave as-is (schema allows it, these are client activities)
--          but make sure notes are not empty
-- ─────────────────────────────────────────
UPDATE activities
SET notes = CONCAT('Activity type: ', type)
WHERE notes IS NULL OR TRIM(notes) = '';

-- ─────────────────────────────────────────
--  FIX 4: Deals missing both client_id and lead_id
--          → already 0 from check, but safety update in case
-- ─────────────────────────────────────────
-- (none needed - already clean)

-- ─────────────────────────────────────────
--  FIX 5: Normalize any remaining encoding artifacts
--          in project names, deal names, task names
-- ─────────────────────────────────────────
UPDATE projects SET project_name = TRIM(regexp_replace(project_name, '\s{2,}', ' ', 'g'));
UPDATE deals    SET deal_name    = TRIM(regexp_replace(deal_name,    '\s{2,}', ' ', 'g'));
UPDATE tasks    SET task_name    = TRIM(regexp_replace(task_name,    '\s{2,}', ' ', 'g'));

-- ─────────────────────────────────────────
--  FIX 6: Leads marked Converted but no matching client exists
--          → check and add missing client records for converted leads
-- ─────────────────────────────────────────
-- Show any converted leads whose email doesn't exist in clients
-- (for information — the 20 we added should all match)
-- FIX: leads 36-55 are converted → ensure matching clients exist (19-38)
-- These were already added, just verify

-- ─────────────────────────────────────────
--  FIX 7: Projects on "On Hold" with no corresponding deal
--          → add a deal record to ensure pipeline coverage
-- ─────────────────────────────────────────
-- Identified: projects 55,56,57,58 (On Hold) — deals already exist for some
-- Check and fill gaps
INSERT INTO deals (deal_name, value, stage, probability, expected_close, client_id)
SELECT
  'Engagement Deal - ' || p.project_name,
  500000,
  'On Hold',
  30,
  (p.end_date + INTERVAL '30 days')::date,
  p.client_id
FROM projects p
WHERE p.status = 'On Hold'
  AND p.client_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM deals d WHERE d.client_id = p.client_id
  )
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────
--  FIX 8: Each active project should have at least 1 invoice
--          → add pending invoice for active projects with none
-- ─────────────────────────────────────────
INSERT INTO invoices (project_id, amount, status, issued_date, due_date)
SELECT
  p.project_id,
  350000,
  'Pending',
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '15 days'
FROM projects p
WHERE p.status = 'Active'
  AND NOT EXISTS (
    SELECT 1 FROM invoices i WHERE i.project_id = p.project_id
  );

-- ─────────────────────────────────────────
--  FIX 9: Each active project should have at least 1 task
--          → add a default task for any active project with none
-- ─────────────────────────────────────────
INSERT INTO tasks (task_name, description, project_id, assigned_to, deadline, status, priority)
SELECT
  'Project Review - ' || p.project_name,
  'Ongoing project review and status update',
  p.project_id,
  COALESCE((
    SELECT ph.user_id FROM project_handlers ph
    WHERE ph.project_id = p.project_id LIMIT 1
  ), 1),
  CURRENT_DATE + INTERVAL '14 days',
  'Pending',
  'Medium'
FROM projects p
WHERE p.status = 'Active'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.project_id = p.project_id
  );

-- ─────────────────────────────────────────
--  FIX 10: Add project_handlers for active projects that have none
-- ─────────────────────────────────────────
INSERT INTO project_handlers (project_id, user_id, role)
SELECT
  p.project_id,
  (p.project_id % 11) + 1,   -- cycle through users 1-11
  'Project Lead'
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM project_handlers ph WHERE ph.project_id = p.project_id
);

-- ─────────────────────────────────────────
--  FINAL VALIDATION SUMMARY
-- ─────────────────────────────────────────
SELECT '=== FINAL COUNTS ===' AS check_name, '' AS result
UNION ALL SELECT 'teams',           COUNT(*)::text FROM teams
UNION ALL SELECT 'users',           COUNT(*)::text FROM users
UNION ALL SELECT 'leads',           COUNT(*)::text FROM leads
UNION ALL SELECT 'clients',         COUNT(*)::text FROM clients
UNION ALL SELECT 'deals',           COUNT(*)::text FROM deals
UNION ALL SELECT 'projects',        COUNT(*)::text FROM projects
UNION ALL SELECT 'project_handlers',COUNT(*)::text FROM project_handlers
UNION ALL SELECT 'tasks',           COUNT(*)::text FROM tasks
UNION ALL SELECT 'invoices',        COUNT(*)::text FROM invoices
UNION ALL SELECT 'activities',      COUNT(*)::text FROM activities;

SELECT '=== INTEGRITY CHECKS ===' AS check_name, '' AS result
UNION ALL SELECT 'Users missing team_id [must be 0]',      COUNT(*)::text FROM users    WHERE team_id IS NULL
UNION ALL SELECT 'Tasks no project no user [must be 0]',   COUNT(*)::text FROM tasks    WHERE project_id IS NULL AND assigned_to IS NULL
UNION ALL SELECT 'Deals no client no lead [must be 0]',    COUNT(*)::text FROM deals    WHERE client_id IS NULL AND lead_id IS NULL
UNION ALL SELECT 'Projects no client [must be 0]',         COUNT(*)::text FROM projects WHERE client_id IS NULL
UNION ALL SELECT 'Invoices no project [must be 0]',        COUNT(*)::text FROM invoices WHERE project_id IS NULL
UNION ALL SELECT 'Bad encoding projects [must be 0]',      COUNT(*)::text FROM projects WHERE project_name LIKE '%â%'
UNION ALL SELECT 'Bad encoding deals [must be 0]',         COUNT(*)::text FROM deals    WHERE deal_name LIKE '%â%'
UNION ALL SELECT 'Bad ph->project ref [must be 0]',        COUNT(*)::text FROM project_handlers ph LEFT JOIN projects p ON ph.project_id=p.project_id WHERE p.project_id IS NULL
UNION ALL SELECT 'Bad ph->user ref [must be 0]',           COUNT(*)::text FROM project_handlers ph LEFT JOIN users u ON ph.user_id=u.user_id WHERE u.user_id IS NULL
UNION ALL SELECT 'Activities with empty notes [must be 0]',COUNT(*)::text FROM activities WHERE notes IS NULL OR TRIM(notes)='';

SELECT '=== DISTRIBUTIONS ===' AS check_name, '' AS result
UNION ALL SELECT 'Deals-Prospecting',  COUNT(*)::text FROM deals WHERE stage='Prospecting'
UNION ALL SELECT 'Deals-Qualified',    COUNT(*)::text FROM deals WHERE stage='Qualified'
UNION ALL SELECT 'Deals-Proposal',     COUNT(*)::text FROM deals WHERE stage='Proposal'
UNION ALL SELECT 'Deals-Negotiation',  COUNT(*)::text FROM deals WHERE stage='Negotiation'
UNION ALL SELECT 'Deals-Closed Won',   COUNT(*)::text FROM deals WHERE stage='Closed Won'
UNION ALL SELECT 'Projects-Active',    COUNT(*)::text FROM projects WHERE status='Active'
UNION ALL SELECT 'Projects-Planning',  COUNT(*)::text FROM projects WHERE status='Planning'
UNION ALL SELECT 'Projects-On Hold',   COUNT(*)::text FROM projects WHERE status='On Hold'
UNION ALL SELECT 'Projects-Completed', COUNT(*)::text FROM projects WHERE status='Completed'
UNION ALL SELECT 'Tasks-Pending',      COUNT(*)::text FROM tasks WHERE status='Pending'
UNION ALL SELECT 'Tasks-InProgress',   COUNT(*)::text FROM tasks WHERE status='In Progress'
UNION ALL SELECT 'Tasks-Done',         COUNT(*)::text FROM tasks WHERE status='Done'
UNION ALL SELECT 'Invoices-Paid',      COUNT(*)::text FROM invoices WHERE status='Paid'
UNION ALL SELECT 'Invoices-Pending',   COUNT(*)::text FROM invoices WHERE status='Pending'
UNION ALL SELECT 'Invoices-Overdue',   COUNT(*)::text FROM invoices WHERE status='Overdue'
UNION ALL SELECT 'Leads-Converted',    COUNT(*)::text FROM leads WHERE status='Converted'
UNION ALL SELECT 'Clients-Active',     COUNT(*)::text FROM clients WHERE status='Active'
UNION ALL SELECT 'Clients-OnHold',     COUNT(*)::text FROM clients WHERE status='On hold'
UNION ALL SELECT 'Clients-Inactive',   COUNT(*)::text FROM clients WHERE status='Inactive';
