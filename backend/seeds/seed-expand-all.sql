-- ============================================================
--  AstrawinCRM — Expand ALL tables based on 100 clients
--  Run: PGPASSWORD=Admin6 psql -U postgres -d CRM -f seed-expand-all.sql
--
--  Adds:
--    • 3 new teams      (6-8)     → total 8
--    • 12 new users     (14-25)   → total 25
--    • 40 new projects  (19-58)   → total 58
--    • 40 new deals     (31-70)   → total 70
--    • 50 new tasks     (36-85)   → total 85
--    • 40 new invoices  (25-64)   → total 64
--    • 50 new activities(40-89)   → total 89
--    • project_handlers for new projects
-- ============================================================

-- ─────────────────────────────────────────
--  NEW TEAMS (3) — IDs 6-8
-- ─────────────────────────────────────────
INSERT INTO teams (team_name, description) VALUES
  ('Finance Team',     'Invoicing, billing, revenue tracking and financial reporting'),
  ('QA & Testing',     'Quality assurance, test automation and performance testing'),
  ('Data & Analytics', 'Data engineering, BI dashboards and advanced analytics');

-- ─────────────────────────────────────────
--  NEW USERS / EMPLOYEES (12) — IDs 14-25
-- ─────────────────────────────────────────
INSERT INTO users (name, email, password, role, team_id) VALUES
  ('Arjun Nambiar',   'arjun.n@astrawincrm.in',   'hashed_pw', 'Sales',     1),
  ('Kavitha Sundaram', 'kavitha@astrawincrm.in',   'hashed_pw', 'Sales',     1),
  ('Rohan Desai',      'rohan.d@astrawincrm.in',   'hashed_pw', 'Developer', 2),
  ('Neelam Gupta',     'neelam@astrawincrm.in',    'hashed_pw', 'Developer', 2),
  ('Farhan Sheikh',    'farhan@astrawincrm.in',    'hashed_pw', 'Marketing', 4),
  ('Pooja Kapoor',     'pooja.k@astrawincrm.in',   'hashed_pw', 'User',      3),
  ('Siddharth Rao',    'sid.rao@astrawincrm.in',   'hashed_pw', 'Manager',   5),
  ('Aarti Joshi',      'aarti@astrawincrm.in',     'hashed_pw', 'User',      6),
  ('Manoj Pillai',     'manoj@astrawincrm.in',     'hashed_pw', 'Developer', 7),
  ('Swati Verma',      'swati@astrawincrm.in',     'hashed_pw', 'User',      8),
  ('Gaurav Tandon',    'gaurav.t@astrawincrm.in',  'hashed_pw', 'Developer', 2),
  ('Riya Malhotra',    'riya@astrawincrm.in',      'hashed_pw', 'Manager',   5);

-- ─────────────────────────────────────────
--  NEW PROJECTS (40) — IDs 19-58
--  Linked to new clients (IDs 19-100)
-- ─────────────────────────────────────────
INSERT INTO projects (project_name, service_type, client_id, start_date, end_date, status) VALUES
  -- Active projects (16)
  ('Fleet Analytics Suite — Tata Motors',       'Analytics',           19, '2026-01-10', '2026-07-31', 'Active'),
  ('ERP Modernization — Mahindra',              'Enterprise Software', 20, '2026-02-01', '2026-08-15', 'Active'),
  ('Banking Analytics Portal — Kotak',          'Analytics',           22, '2026-03-01', '2026-09-30', 'Active'),
  ('Retail Tech Platform — Lenskart',           'Web Development',     23, '2026-01-15', '2026-06-30', 'Active'),
  ('Inventory Management — BigBasket',          'Enterprise Software', 24, '2026-02-15', '2026-07-31', 'Active'),
  ('Fantasy Sports Analytics — Dream11',        'Analytics',           25, '2026-03-15', '2026-08-31', 'Active'),
  ('Beauty Tech Platform — Nykaa',              'Web Development',     26, '2026-04-01', '2026-09-30', 'Active'),
  ('Pharma Analytics — Biocon',                 'Analytics',           29, '2026-02-01', '2026-08-31', 'Active'),
  ('D2C Analytics — boAt',                      'Analytics',           31, '2026-03-01', '2026-07-31', 'Active'),
  ('UPI Analytics Dashboard — PhonePe',         'Analytics',           33, '2026-01-15', '2026-06-30', 'Active'),
  ('Trading Dashboard — Zerodha',               'Web Development',     34, '2026-02-15', '2026-07-15', 'Active'),
  ('EdTech Analytics — Unacademy',              'Analytics',           36, '2026-03-01', '2026-08-31', 'Active'),
  ('Auto Marketplace — Cars24',                 'Web Development',     37, '2026-04-01', '2026-10-31', 'Active'),
  ('Enterprise Dashboard — Reliance Jio',       'Web Development',     40, '2026-01-01', '2026-06-30', 'Active'),
  ('Banking Platform — SBI',                    'Enterprise Software', 44, '2026-02-01', '2026-09-30', 'Active'),
  ('Retail Intelligence — Asian Paints',        'Analytics',           51, '2026-03-15', '2026-08-15', 'Active'),

  -- Planning projects (10)
  ('Fitness Platform — Cult.fit',               'Mobile App',          38, '2026-05-01', '2026-11-30', 'Planning'),
  ('Seller Platform — Meesho',                  'Web Development',     32, '2026-05-15', '2026-10-31', 'Planning'),
  ('Investment Analytics — Groww',              'Analytics',           35, '2026-05-01', '2026-10-31', 'Planning'),
  ('FMCG Dashboard — HUL',                     'Analytics',           45, '2026-06-01', '2026-11-30', 'Planning'),
  ('IoT Dashboard — Havells',                   'Integration',         69, '2026-06-01', '2026-12-31', 'Planning'),
  ('Logistics AI Platform — Adani',             'Enterprise Software', 39, '2026-06-15', '2026-12-31', 'Planning'),
  ('Consumer Insights — Colgate',               'Analytics',           75, '2026-07-01', '2027-01-31', 'Planning'),
  ('HealthTech Platform — Apollo',              'Web Development',     73, '2026-06-01', '2026-11-30', 'Planning'),
  ('Supply Chain — L&T',                        'Integration',         43, '2026-07-01', '2027-01-31', 'Planning'),
  ('Aviation Analytics — IndiGo',               'Analytics',           77, '2026-07-01', '2027-01-15', 'Planning'),

  -- Completed projects (10)
  ('Supply Chain Dashboard — Godrej',           'Analytics',           21, '2025-08-01', '2026-02-28', 'Completed'),
  ('E-commerce Platform — FirstCry',            'Web Development',     27, '2025-09-15', '2026-03-15', 'Completed'),
  ('Delivery Optimization — Dunzo',             'Mobile App',          28, '2025-10-01', '2026-03-31', 'Completed'),
  ('Social Media Analytics — ShareChat',        'Analytics',           30, '2025-11-01', '2026-04-01', 'Completed'),
  ('ERP Suite — Sun Pharma',                    'Enterprise Software', 42, '2025-07-01', '2026-01-31', 'Completed'),
  ('Payment Platform — IndusInd Bank',          'Integration',         63, '2025-09-01', '2026-02-28', 'Completed'),
  ('Digital Marketing Suite — Marico',          'Web Development',     76, '2025-10-15', '2026-03-15', 'Completed'),
  ('Cement Analytics — Ambuja',                 'Analytics',           70, '2025-11-01', '2026-03-31', 'Completed'),
  ('FMCG Analytics — Dabur',                    'Analytics',           72, '2025-08-15', '2026-02-15', 'Completed'),
  ('QA Platform — Coforge',                     'Enterprise Software', 86, '2025-09-01', '2026-03-01', 'Completed'),

  -- On Hold projects (4)
  ('Manufacturing IoT — Tata Steel',            'Integration',         64, '2026-03-01', '2026-09-30', 'On Hold'),
  ('Energy Analytics — BPCL',                   'Analytics',           53, '2026-02-01', '2026-08-31', 'On Hold'),
  ('Insurance Analytics — SBI Life',            'Analytics',           67, '2026-04-01', '2026-10-31', 'On Hold'),
  ('Distribution Analytics — Pidilite',         'Analytics',           68, '2026-03-15', '2026-09-15', 'On Hold');

-- ─────────────────────────────────────────
--  PROJECT HANDLERS for new projects
-- ─────────────────────────────────────────
INSERT INTO project_handlers (project_id, user_id, role) VALUES
  -- Project 19 (Tata Motors)
  (19, 4,  'Lead Developer'),
  (19, 14, 'Account Manager'),
  (19, 16, 'Backend Developer'),
  -- Project 20 (Mahindra)
  (20, 5,  'Lead Developer'),
  (20, 15, 'Account Manager'),
  -- Project 21 (Kotak)
  (21, 11, 'Lead Developer'),
  (21, 1,  'Account Manager'),
  -- Project 22 (Lenskart)
  (22, 4,  'Lead Developer'),
  (22, 6,  'UI/UX Designer'),
  (22, 9,  'Account Manager'),
  -- Project 23 (BigBasket)
  (23, 16, 'Lead Developer'),
  (23, 17, 'Backend Developer'),
  -- Project 24 (Dream11)
  (24, 24, 'Data Engineer'),
  (24, 11, 'Lead Developer'),
  -- Project 25 (Nykaa)
  (25, 6,  'UI/UX Designer'),
  (25, 5,  'Lead Developer'),
  -- Project 30 (PhonePe)
  (30, 4,  'Lead Developer'),
  (30, 24, 'Data Engineer'),
  -- Project 31 (Zerodha)
  (31, 5,  'Lead Developer'),
  (31, 19, 'UI/UX Designer'),
  -- Project 34 (Reliance Jio)
  (34, 4,  'Lead Developer'),
  (34, 16, 'Backend Developer'),
  (34, 6,  'UI/UX Designer'),
  (34, 14, 'Account Manager'),
  -- Project 35 (SBI)
  (35, 11, 'Lead Developer'),
  (35, 17, 'Backend Developer'),
  (35, 20, 'Account Manager');

-- ─────────────────────────────────────────
--  NEW DEALS (40) — IDs 31-70
--  Spread across all 5 Kanban stages, linked to new clients
-- ─────────────────────────────────────────
INSERT INTO deals (deal_name, value, stage, probability, expected_close, lead_id, client_id) VALUES
  -- Prospecting (8)
  ('Fitness Tech Suite',               480000,  'Prospecting', 15, '2026-09-30', 55, 38),
  ('Investment Platform v2',           720000,  'Prospecting', 20, '2026-10-15', 52, 35),
  ('FMCG Analytics Bundle',            550000,  'Prospecting', 25, '2026-09-15', NULL, 45),
  ('IoT Dashboard License',            390000,  'Prospecting', 15, '2026-10-31', 60, 69),
  ('Consumer Insights Platform',       620000,  'Prospecting', 20, '2026-11-15', 72, 75),
  ('Aviation Analytics Suite',         880000,  'Prospecting', 10, '2026-11-30', NULL, 77),
  ('Supply Chain AI — L&T',            950000,  'Prospecting', 18, '2026-10-31', NULL, 43),
  ('Logistics Platform — Adani',      1100000,  'Prospecting', 12, '2026-12-15', NULL, 39),

  -- Qualified (8)
  ('Fleet Analytics License',          780000,  'Qualified',   50, '2026-07-15', 36, 19),
  ('ERP Modernization Pack',           920000,  'Qualified',   55, '2026-08-01', 37, 20),
  ('Retail Tech Bundle',               650000,  'Qualified',   45, '2026-06-30', 40, 23),
  ('Inventory Mgmt License',           480000,  'Qualified',   60, '2026-07-15', 41, 24),
  ('Fantasy Analytics Suite',          540000,  'Qualified',   50, '2026-08-15', 42, 25),
  ('Pharma Analytics Pack',            720000,  'Qualified',   55, '2026-08-31', 46, 29),
  ('D2C Analytics License',            380000,  'Qualified',   45, '2026-07-31', 48, 31),
  ('EdTech Platform v2',               590000,  'Qualified',   50, '2026-08-30', 53, 36),

  -- Proposal (8)
  ('Beauty Tech Bundle',               690000,  'Proposal',    60, '2026-06-30', 43, 26),
  ('Banking Analytics Suite',          1050000, 'Proposal',    55, '2026-06-15', 39, 22),
  ('UPI Analytics Pack',               820000,  'Proposal',    65, '2026-06-30', 50, 33),
  ('Auto Marketplace License',         560000,  'Proposal',    50, '2026-07-15', 54, 37),
  ('Enterprise Dashboard — Jio',      1280000, 'Proposal',    60, '2026-06-30', NULL, 40),
  ('Banking Platform — SBI',          1450000, 'Proposal',    55, '2026-07-31', NULL, 44),
  ('Retail Intelligence Platform',     680000,  'Proposal',    50, '2026-08-15', NULL, 51),
  ('Seller Platform Pack',             520000,  'Proposal',    45, '2026-07-31', 49, 32),

  -- Negotiation (8)
  ('Trading Dashboard License',        940000,  'Negotiation', 80, '2026-05-15', 51, 34),
  ('Biocon Analytics Enterprise',      870000,  'Negotiation', 85, '2026-05-20', 46, 29),
  ('PhonePe UPI Suite',                980000,  'Negotiation', 82, '2026-05-10', 50, 33),
  ('Lenskart Retail Pack',             720000,  'Negotiation', 78, '2026-05-25', 40, 23),
  ('BigBasket Inventory Pro',          560000,  'Negotiation', 88, '2026-05-15', 41, 24),
  ('Dream11 Enterprise License',       840000,  'Negotiation', 75, '2026-05-30', 42, 25),
  ('Reliance Jio Mega Deal',          1850000, 'Negotiation', 90, '2026-05-05', NULL, 40),
  ('SBI Digital Transformation',      2100000, 'Negotiation', 85, '2026-05-20', NULL, 44),

  -- Closed Won (8)
  ('Supply Chain Dashboard — Godrej',  640000,  'Closed Won',  100, '2026-02-28', 38, 21),
  ('E-commerce Platform — FirstCry',   520000,  'Closed Won',  100, '2026-03-15', 44, 27),
  ('Delivery Optimization — Dunzo',    480000,  'Closed Won',  100, '2026-03-31', 45, 28),
  ('Social Media Suite — ShareChat',   580000,  'Closed Won',  100, '2026-04-01', 47, 30),
  ('ERP Suite — Sun Pharma',           920000,  'Closed Won',  100, '2026-01-31', NULL, 42),
  ('Payment Platform — IndusInd',      760000,  'Closed Won',  100, '2026-02-28', NULL, 63),
  ('Cement Analytics — Ambuja',        450000,  'Closed Won',  100, '2026-03-31', NULL, 70),
  ('QA Platform — Coforge',            680000,  'Closed Won',  100, '2026-03-01', NULL, 86);

-- ─────────────────────────────────────────
--  NEW TASKS (50) — IDs 36-85
--  Spread across new projects and general tasks
-- ─────────────────────────────────────────
INSERT INTO tasks (task_name, description, project_id, assigned_to, deadline, status, priority) VALUES
  -- Pending (18)
  ('Setup dev environment — Tata Motors',    'Configure Docker, CI/CD, staging env for Fleet Analytics',        19, 4,    '2026-04-20', 'Pending', 'High'),
  ('Client onboarding — Mahindra',           'Prepare welcome kit and project kickoff document',                20, 15,   '2026-04-15', 'Pending', 'Medium'),
  ('Database design — Kotak Banking',        'Design normalized schema for banking analytics portal',           21, 11,   '2026-04-18', 'Pending', 'High'),
  ('UI mockups — Lenskart',                  'Create Figma wireframes for retail tech dashboard',               22, 6,    '2026-04-25', 'Pending', 'High'),
  ('API spec — BigBasket Inventory',         'Write OpenAPI 3.0 spec for inventory management APIs',            23, 16,   '2026-04-22', 'Pending', 'Medium'),
  ('Data pipeline setup — Dream11',          'Configure Apache Kafka for real-time sports data ingestion',      24, 24,   '2026-04-28', 'Pending', 'High'),
  ('UX research — Nykaa Beauty',             'Conduct user interviews and create user journey maps',            25, 19,   '2026-04-30', 'Pending', 'Medium'),
  ('Compliance review — Biocon',             'Review pharma data compliance and HIPAA requirements',            26, 20,   '2026-05-05', 'Pending', 'High'),
  ('Payment integration — PhonePe',          'Integrate UPI payment SDK with analytics dashboard',             30, 4,    '2026-05-01', 'Pending', 'High'),
  ('Chart library setup — Zerodha',          'Evaluate and integrate TradingView charting library',             31, 5,    '2026-04-20', 'Pending', 'Medium'),
  ('Content strategy — Unacademy',           'Plan learning analytics dashboard content hierarchy',             32, 18,   '2026-05-10', 'Pending', 'Low'),
  ('Vehicle listing API — Cars24',           'Build REST API for vehicle listing and search',                   33, 16,   '2026-05-15', 'Pending', 'High'),
  ('Infrastructure planning — Jio',          'Plan AWS multi-region deployment for enterprise dashboard',       34, 4,    '2026-04-25', 'Pending', 'High'),
  ('Security audit — SBI',                   'Conduct VAPT and penetration testing for banking platform',       35, 22,   '2026-05-10', 'Pending', 'High'),
  ('Follow up — Cult.fit proposal',          'Send revised proposal with updated pricing for fitness platform', NULL, 14, '2026-04-15', 'Pending', 'Medium'),
  ('Review Meesho platform requirements',    'Compile feature list from Meesho stakeholder interviews',         NULL, 15, '2026-04-18', 'Pending', 'Medium'),
  ('Prepare Groww investment demo',          'Build prototype for investment analytics dashboard demo',         NULL, 24, '2026-04-22', 'Pending', 'High'),
  ('Draft SOW — HUL Analytics',             'Write statement of work for FMCG analytics engagement',           NULL, 20, '2026-04-28', 'Pending', 'Medium'),

  -- In Progress (18)
  ('Backend API — Tata Motors Fleet',        'Building REST endpoints for fleet tracking and analytics',        19, 16,   '2026-04-18', 'In Progress', 'High'),
  ('Frontend dashboard — Mahindra ERP',      'React dashboard with real-time ERP data visualization',           20, 5,    '2026-04-20', 'In Progress', 'High'),
  ('Data modeling — Kotak Banking',          'Implementing dimensional model for banking transactions',          21, 24,   '2026-04-22', 'In Progress', 'Medium'),
  ('Component library — Lenskart',           'Building reusable React component library for retail UI',          22, 6,    '2026-04-15', 'In Progress', 'High'),
  ('Warehouse schema — BigBasket',           'Setting up PostgreSQL schema for inventory warehouse',             23, 17,   '2026-04-20', 'In Progress', 'Medium'),
  ('Analytics engine — Dream11',             'Building real-time analytics engine for match predictions',        24, 11,   '2026-04-25', 'In Progress', 'High'),
  ('Product catalog — Nykaa',               'Implementing beauty product catalog with search and filters',       25, 5,    '2026-04-22', 'In Progress', 'Medium'),
  ('Drug compliance module — Biocon',        'Building pharma regulatory compliance tracking module',            26, 16,   '2026-05-01', 'In Progress', 'High'),
  ('D2C dashboard — boAt',                   'Developing direct-to-consumer analytics dashboard',                27, 11,   '2026-04-18', 'In Progress', 'Medium'),
  ('UPI flow testing — PhonePe',             'End-to-end testing of UPI transaction analytics flow',             30, 22,   '2026-04-20', 'In Progress', 'High'),
  ('Candlestick charts — Zerodha',           'Implementing real-time candlestick chart components',              31, 5,    '2026-04-15', 'In Progress', 'High'),
  ('Course analytics — Unacademy',           'Building course completion and engagement analytics module',       32, 24,   '2026-04-28', 'In Progress', 'Medium'),
  ('Vehicle valuation — Cars24',             'Machine learning model for used car price prediction',             33, 17,   '2026-05-05', 'In Progress', 'High'),
  ('Microservice architecture — Jio',        'Building microservice architecture for enterprise dashboard',      34, 4,    '2026-04-20', 'In Progress', 'High'),
  ('Core banking APIs — SBI',               'Developing core banking integration APIs with CBS system',          35, 11,   '2026-05-01', 'In Progress', 'High'),
  ('Asian Paints ML model',                  'Training retail demand forecasting model for paint products',      36, 24,   '2026-04-30', 'In Progress', 'Medium'),
  ('Marketing automation Q2',               'Setting up HubSpot campaigns for Q2 lead generation',              NULL, 18,  '2026-04-25', 'In Progress', 'Low'),
  ('Blog series — SaaS analytics',          'Writing 5-part blog series on SaaS analytics best practices',      NULL, 7,   '2026-04-30', 'In Progress', 'Low'),

  -- Done (14)
  ('Project kickoff — Tata Motors',          'Completed kickoff meeting and project charter sign-off',           19, 14,   '2026-01-15', 'Done', 'High'),
  ('Requirements doc — Mahindra',            'Finalized ERP modernization requirements with stakeholders',       20, 15,   '2026-02-10', 'Done', 'High'),
  ('Supply Chain Dashboard — Godrej',        'Delivered and deployed supply chain analytics dashboard',          39, 4,    '2026-02-28', 'Done', 'High'),
  ('E-commerce Launch — FirstCry',           'Successfully launched e-commerce platform with 99.9% uptime',      40, 5,    '2026-03-15', 'Done', 'High'),
  ('Delivery Optimization — Dunzo',          'Completed delivery route optimization algorithm deployment',       41, 16,   '2026-03-31', 'Done', 'High'),
  ('Social Media Analytics — ShareChat',     'Deployed real-time social media sentiment analysis dashboard',     42, 11,   '2026-04-01', 'Done', 'Medium'),
  ('Sun Pharma ERP Go-live',                 'ERP system went live with zero critical issues',                   43, 4,    '2026-01-31', 'Done', 'High'),
  ('IndusInd Payment Integration',           'Completed payment gateway integration and UAT sign-off',           44, 5,    '2026-02-28', 'Done', 'High'),
  ('Ambuja Cement Analytics',                'Delivered cement production analytics dashboard',                   46, 24,   '2026-03-31', 'Done', 'Medium'),
  ('Coforge QA Handover',                    'Completed QA platform handover documentation and training',        48, 22,   '2026-03-01', 'Done', 'Medium'),
  ('Marico Digital Marketing',               'Delivered digital marketing analytics suite to Marico team',       45, 7,    '2026-03-15', 'Done', 'Medium'),
  ('Dabur FMCG Analytics',                   'Deployed FMCG analytics dashboard with real-time sales tracking',  47, 11,   '2026-02-15', 'Done', 'High'),
  ('Lenskart POC approved',                  'Proof of concept for retail tech platform approved by CTO',        22, 9,    '2026-01-20', 'Done', 'High'),
  ('Dream11 data architecture',              'Completed data architecture design for fantasy sports analytics',   24, 24,   '2026-03-20', 'Done', 'High');

-- ─────────────────────────────────────────
--  NEW INVOICES (40) — IDs 25-64
--  Linked to new projects
-- ─────────────────────────────────────────
INSERT INTO invoices (project_id, amount, status, issued_date, due_date) VALUES
  -- Paid (15)
  (19, 390000, 'Paid',    '2026-01-15', '2026-02-15'),
  (20, 460000, 'Paid',    '2026-02-10', '2026-03-10'),
  (39, 640000, 'Paid',    '2025-12-01', '2025-12-31'),
  (40, 520000, 'Paid',    '2026-01-15', '2026-02-15'),
  (41, 480000, 'Paid',    '2026-02-01', '2026-03-01'),
  (42, 580000, 'Paid',    '2026-03-01', '2026-03-31'),
  (43, 460000, 'Paid',    '2025-08-01', '2025-08-31'),
  (43, 460000, 'Paid',    '2025-12-01', '2025-12-31'),
  (44, 380000, 'Paid',    '2025-10-01', '2025-10-31'),
  (44, 380000, 'Paid',    '2026-02-01', '2026-02-28'),
  (45, 350000, 'Paid',    '2025-11-15', '2025-12-15'),
  (46, 450000, 'Paid',    '2026-01-15', '2026-02-15'),
  (47, 420000, 'Paid',    '2025-10-01', '2025-10-31'),
  (48, 680000, 'Paid',    '2025-11-01', '2025-12-01'),
  (22, 325000, 'Paid',    '2026-02-01', '2026-03-01'),

  -- Pending (15)
  (19, 390000, 'Pending', '2026-04-01', '2026-05-01'),
  (20, 460000, 'Pending', '2026-04-05', '2026-05-05'),
  (21, 525000, 'Pending', '2026-04-01', '2026-04-30'),
  (22, 325000, 'Pending', '2026-04-10', '2026-05-10'),
  (23, 240000, 'Pending', '2026-04-15', '2026-05-15'),
  (24, 270000, 'Pending', '2026-04-01', '2026-04-30'),
  (25, 345000, 'Pending', '2026-04-10', '2026-05-10'),
  (26, 360000, 'Pending', '2026-04-15', '2026-05-15'),
  (27, 190000, 'Pending', '2026-04-05', '2026-05-05'),
  (30, 410000, 'Pending', '2026-04-01', '2026-04-30'),
  (31, 470000, 'Pending', '2026-04-10', '2026-05-10'),
  (34, 640000, 'Pending', '2026-04-01', '2026-05-01'),
  (35, 725000, 'Pending', '2026-04-05', '2026-05-05'),
  (32, 295000, 'Pending', '2026-04-10', '2026-05-10'),
  (36, 340000, 'Pending', '2026-04-15', '2026-05-15'),

  -- Overdue (10)
  (19, 390000, 'Overdue', '2026-02-15', '2026-03-15'),
  (21, 525000, 'Overdue', '2026-02-01', '2026-03-01'),
  (22, 325000, 'Overdue', '2026-01-15', '2026-02-15'),
  (24, 270000, 'Overdue', '2026-02-20', '2026-03-20'),
  (34, 640000, 'Overdue', '2026-01-15', '2026-02-15'),
  (35, 725000, 'Overdue', '2026-02-01', '2026-03-01'),
  (30, 410000, 'Overdue', '2026-02-15', '2026-03-15'),
  (26, 360000, 'Overdue', '2026-03-01', '2026-04-01'),
  (27, 190000, 'Overdue', '2026-02-01', '2026-03-01'),
  (33, 280000, 'Overdue', '2026-03-01', '2026-04-01');

-- ─────────────────────────────────────────
--  NEW ACTIVITIES (50) — IDs 40-89
--  Rich activity log spanning new leads and clients
-- ─────────────────────────────────────────
INSERT INTO activities (lead_id, type, notes, activity_date) VALUES
  -- Calls (12)
  (36, 'Call',    'Discovery call with Amit Saxena at Tata Motors — fleet analytics scope confirmed. Budget ₹7.8L approved.',                    NOW() - INTERVAL '2 hours'),
  (37, 'Call',    'Follow-up with Snehal Deshmukh at Mahindra — ERP modernization timeline finalized. Go-live target Aug 2026.',                  NOW() - INTERVAL '6 hours'),
  (39, 'Call',    'Call with Anjali Menon at Kotak — banking analytics portal requirements deep dive. Compliance requirements discussed.',         NOW() - INTERVAL '14 hours'),
  (40, 'Call',    'Intro call with Pranav Kulkarni at Lenskart — retail tech platform MVP scoped. 2-month timeline agreed.',                      NOW() - INTERVAL '1 day'),
  (42, 'Call',    'Discovery call with Varun Kapoor at Dream11 — fantasy sports analytics requirements mapped. Very promising.',                   NOW() - INTERVAL '1 day 4 hours'),
  (46, 'Call',    'Technical deep dive with Mohan Krishnamurthy at Biocon — pharma compliance requirements extensive. Need HIPAA review.',          NOW() - INTERVAL '2 days'),
  (48, 'Call',    'Follow-up with Sunil Agarwal at boAt — D2C analytics dashboard demo scheduled for next week.',                                  NOW() - INTERVAL '2 days 4 hours'),
  (50, 'Call',    'Call with Raj Malhotra at PhonePe — UPI analytics dashboard architecture review completed. Moving to Negotiation.',              NOW() - INTERVAL '3 days'),
  (56, 'Call',    'Cold call with Sameer Desai at Aditya Birla — interested in conglomerate-wide dashboard. RFP expected next month.',              NOW() - INTERVAL '4 days'),
  (59, 'Call',    'Outreach to Divya Chopra at Titan — retail intelligence requirements gathering. Strong interest confirmed.',                     NOW() - INTERVAL '5 days'),
  (62, 'Call',    'Call with Saurabh Khanna at PepsiCo India — supply chain analytics scope expanding. Budget ₹12L discussed.',                     NOW() - INTERVAL '6 days'),
  (68, 'Call',    'Re-engagement call with Hemant Bhatt at Bajaj Finance — lending analytics platform demo requested for next week.',                NOW() - INTERVAL '7 days'),

  -- Emails (12)
  (37, 'Email',   'Sent ERP modernization proposal to Mahindra Tech with detailed architecture diagrams and pricing breakdown.',                    NOW() - INTERVAL '3 hours'),
  (38, 'Email',   'Supply chain dashboard final report sent to Rohan Joshi at Godrej Industries. Project closure documentation attached.',           NOW() - INTERVAL '10 hours'),
  (41, 'Email',   'Inventory management proposal sent to Shruti Reddy at BigBasket. CC production head and CTO on thread.',                         NOW() - INTERVAL '18 hours'),
  (43, 'Email',   'Beauty tech platform wireframes shared with Prerna Sharma at Nykaa. Feedback requested by EOW.',                                  NOW() - INTERVAL '1 day 2 hours'),
  (49, 'Email',   'Seller platform proposal sent to Kavya Nair at Meesho. Includes marketplace analytics and recommendation engine.',                NOW() - INTERVAL '1 day 8 hours'),
  (51, 'Email',   'Trading dashboard prototype link sent to Ishita Patel at Zerodha. Includes real-time candlestick charts.',                        NOW() - INTERVAL '2 days 2 hours'),
  (52, 'Email',   'Investment analytics proposal sent to Dhruv Mehta at Groww. Competitive pricing vs. incumbent vendor.',                            NOW() - INTERVAL '3 days 2 hours'),
  (53, 'Email',   'EdTech analytics platform proposal shared with Nandini Srinivasan at Unacademy. Learning path analytics highlighted.',             NOW() - INTERVAL '3 days 6 hours'),
  (57, 'Email',   'FMCG analytics proposal sent to Bhavna Malhotra at Marico. Includes consumer behavior tracking module.',                          NOW() - INTERVAL '4 days 4 hours'),
  (63, 'Email',   'Manufacturing analytics proposal emailed to Megha Srivastava at Tata Steel. Plant-level monitoring dashboards scoped.',            NOW() - INTERVAL '5 days 4 hours'),
  (66, 'Email',   'InsurTech platform proposal sent to Rashmi Pandey at PB Fintech. Claims analytics and risk scoring modules included.',             NOW() - INTERVAL '6 days 4 hours'),
  (75, 'Email',   'Drug analytics proposal to Rekha Bansal at Torrent Pharma. Regulatory compliance and batch tracking included.',                    NOW() - INTERVAL '8 days'),

  -- Meetings (12)
  (36, 'Meeting', 'Project kickoff meeting with Tata Motors team — presented architecture, agreed on sprint cadence. 2-hour session.',                NOW() - INTERVAL '4 hours'),
  (39, 'Meeting', 'Banking analytics workshop with Kotak team — compliance requirements mapped, data sources identified. 3-hour deep dive.',          NOW() - INTERVAL '12 hours'),
  (42, 'Meeting', 'Fantasy sports analytics brainstorming with Dream11 product team — real-time scoring requirements discussed. 2 hours.',             NOW() - INTERVAL '1 day 6 hours'),
  (44, 'Meeting', 'E-commerce platform review with FirstCry — final UAT signoff. Platform ready for production deployment.',                          NOW() - INTERVAL '2 days 6 hours'),
  (45, 'Meeting', 'Delivery optimization retrospective with Dunzo team — 35% improvement in delivery route efficiency achieved.',                      NOW() - INTERVAL '3 days 4 hours'),
  (46, 'Meeting', 'Pharma analytics scoping with Biocon research team — discussed drug discovery data pipeline requirements.',                         NOW() - INTERVAL '4 days 2 hours'),
  (50, 'Meeting', 'UPI analytics architecture review with PhonePe engineering — transaction volume handling strategy finalized.',                       NOW() - INTERVAL '4 days 6 hours'),
  (47, 'Meeting', 'ShareChat social media analytics demo — sentiment analysis model presented. Client approved real-time dashboard.',                    NOW() - INTERVAL '5 days 6 hours'),
  (51, 'Meeting', 'Zerodha trading dashboard demo — presented candlestick charting and portfolio analytics. CTO very impressed.',                       NOW() - INTERVAL '6 days 2 hours'),
  (54, 'Meeting', 'Auto marketplace requirements workshop with Cars24 — vehicle valuation ML model discussed. 2-hour session.',                         NOW() - INTERVAL '7 days 4 hours'),
  (55, 'Meeting', 'Cult.fit fitness platform discovery meeting — wearable integration and workout analytics requirements mapped.',                       NOW() - INTERVAL '8 days 2 hours'),
  (71, 'Meeting', 'Quarterly review with Pidilite Industries — distribution analytics roadmap presented for FY27.',                                      NOW() - INTERVAL '9 days'),

  -- Notes (8)
  (36, 'Note',    'Tata Motors Fleet Analytics project on track. Sprint 2 completed ahead of schedule. Client satisfaction: 9/10.',                     NOW() - INTERVAL '5 hours'),
  (40, 'Note',    'Lenskart Retail Tech Platform — POC approved by CTO. Full project authorization expected by end of week.',                           NOW() - INTERVAL '1 day 4 hours'),
  (43, 'Note',    'Nykaa Beauty Tech deal close imminent — legal review of contract in progress. Expected revenue ₹6.9L.',                              NOW() - INTERVAL '2 days 4 hours'),
  (48, 'Note',    'boAt D2C Analytics dashboard MVP ready for demo. Automated inventory alerts feature praised by product team.',                        NOW() - INTERVAL '3 days 6 hours'),
  (50, 'Note',    'PhonePe UPI Analytics deal moved to Negotiation — budget approved at ₹9.8L. CTO signed off on architecture.',                        NOW() - INTERVAL '5 days 2 hours'),
  (52, 'Note',    'Groww investment analytics — client evaluating competitors. Price negotiation expected. Keep pipeline warm.',                          NOW() - INTERVAL '6 days 6 hours'),
  (60, 'Note',    'Havells IoT Dashboard — client cited budget constraints. Moved to Cold. Will re-engage in Q3.',                                      NOW() - INTERVAL '8 days 4 hours'),
  (69, 'Note',    'UltraTech Cement manufacturing IoT inquiry — not budgeting this quarter. Re-engage in FY27 Q1.',                                     NOW() - INTERVAL '9 days 4 hours'),

  -- Tasks (6)
  (36, 'Task',    'Follow up on Tata Motors Sprint 3 deliverables — code review pending for fleet tracking module.',                                   NOW() - INTERVAL '8 hours'),
  (39, 'Task',    'Schedule compliance training for Kotak Banking Analytics team — RBI data handling guidelines.',                                     NOW() - INTERVAL '20 hours'),
  (42, 'Task',    'Prepare Dream11 IPL season analytics demo — showcase real-time match prediction capabilities.',                                     NOW() - INTERVAL '1 day 8 hours'),
  (46, 'Task',    'Arrange Biocon pharma data security assessment — need third-party VAPT certification.',                                             NOW() - INTERVAL '3 days 8 hours'),
  (50, 'Task',    'Draft PhonePe UPI Analytics contract — include SLA for 99.99% uptime and data retention policies.',                                 NOW() - INTERVAL '5 days 8 hours'),
  (51, 'Task',    'Set up Zerodha trading dashboard staging environment — configure real-time market data feeds.',                                      NOW() - INTERVAL '7 days 6 hours');

-- ─────────────────────────────────────────
--  Verify final counts
-- ─────────────────────────────────────────
SELECT 'teams'      AS tbl, COUNT(*) FROM teams
UNION ALL SELECT 'users',      COUNT(*) FROM users
UNION ALL SELECT 'leads',      COUNT(*) FROM leads
UNION ALL SELECT 'clients',    COUNT(*) FROM clients
UNION ALL SELECT 'deals',      COUNT(*) FROM deals
UNION ALL SELECT 'projects',   COUNT(*) FROM projects
UNION ALL SELECT 'tasks',      COUNT(*) FROM tasks
UNION ALL SELECT 'invoices',   COUNT(*) FROM invoices
UNION ALL SELECT 'activities', COUNT(*) FROM activities;
