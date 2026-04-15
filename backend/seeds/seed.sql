-- ============================================================
--  AstrawinCRM â€” Professional Seed Data (Expanded)
--  Run: PGPASSWORD=Admin6 psql -U postgres -d CRM -f seed.sql
-- ============================================================

-- Clear all tables in dependency order and reset IDs
TRUNCATE activities, invoices, tasks, deals, projects, leads, clients, users, teams
  RESTART IDENTITY CASCADE;

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
--  TEAMS (5)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO teams (team_name, description) VALUES
  ('Sales Team',        'Lead generation, demos, deal closures and pipeline management'),
  ('Development Team',  'Full-stack engineers building scalable client projects'),
  ('Design Team',       'UI/UX designers creating intuitive digital experiences'),
  ('Marketing Team',    'Content strategy, SEO, paid ads and brand growth'),
  ('Customer Success',  'Onboarding, retention and long-term client relationship management');

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
--  USERS (12)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO users (name, email, password, role, team_id) VALUES
  ('Meera Krishnan', 'meera@astrawincrm.in',    'hashed_pw', 'Sales',     1),
  ('Ravi Shankar',   'ravi@astrawincrm.in',     'hashed_pw', 'Sales',     1),
  ('Kiran Patil',    'kiran@astrawincrm.in',    'hashed_pw', 'Sales',     1),
  ('Aditya Kumar',   'aditya@astrawincrm.in',   'hashed_pw', 'Developer', 2),
  ('Preethi Nair',   'preethi@astrawincrm.in',  'hashed_pw', 'Developer', 2),
  ('Sneha Desai',    'sneha@astrawincrm.in',    'hashed_pw', 'User',      3),
  ('Rahul Mehta',    'rahul@astrawincrm.in',    'hashed_pw', 'Marketing', 4),
  ('Ananya Roy',     'ananya@astrawincrm.in',   'hashed_pw', 'Manager',   5),
  ('Vijay Menon',    'vijay@astrawincrm.in',    'hashed_pw', 'Sales',     1),
  ('Lakshmi Iyer',   'lakshmi@astrawincrm.in',  'hashed_pw', 'Marketing', 4),
  ('Dev Sharma',     'dev@astrawincrm.in',      'hashed_pw', 'Developer', 2),
  ('Nisha Patel',    'nisha@astrawincrm.in',    'hashed_pw', 'Manager',   5);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
--  LEADS (35)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO leads (name, email, phone, company, source, service_interest, status, assigned_to) VALUES
  -- Original 20
  ('Arjun Rao',       'arjun@infosys.com',        '9876501001', 'Infosys Ltd',        'LinkedIn',   'CRM Integration',        'Hot',  1),
  ('Priya Kumar',     'priya@tcs.com',             '9876501002', 'TCS Digital',        'Referral',   'Analytics Dashboard',    'Hot',  2),
  ('Suresh Mehta',    'suresh@wipro.com',          '9876501003', 'Wipro Cloud',        'Website',    'Cloud Migration',        'Warm', 1),
  ('Divya Venkat',    'divya@hcltech.com',         '9876501004', 'HCL Tech',           'Cold email', 'Security Audit',         'Warm', 3),
  ('Neel Bose',       'neel@zoho.com',             '9876501005', 'Zoho Corp',          'LinkedIn',   'SaaS Platform',          'Hot',  2),
  ('Rohit Nair',      'rohit@mphasis.com',         '9876501006', 'Mphasis',            'Webinar',    'Data Warehouse',         'Warm', 1),
  ('Ananya Singh',    'ananya@bajajfinserv.com',   '9876501007', 'Bajaj Finserv',      'Website',    'HR Platform',            'New',  3),
  ('Vikram Rao',      'vikram@airtel.com',         '9876501008', 'Airtel Business',    'LinkedIn',   'Chatbot SaaS',           'Warm', 2),
  ('Kavita Sharma',   'kavita@relianceretail.com', '9876501009', 'Reliance Retail',    'Referral',   'Retail Analytics',       'Hot',  1),
  ('Deepak Jain',     'deepak@icicibank.com',      '9876501010', 'ICICI Bank',         'Cold email', 'Data Analytics',         'Cold', 3),
  ('Neha Gupta',      'neha@hdfc.com',             '9876501011', 'HDFC Securities',    'LinkedIn',   'Portfolio Dashboard',    'New',  2),
  ('Sanjay Patel',    'sanjay@ltinfotech.com',     '9876501012', 'L&T Infotech',       'Event',      'ERP Integration',        'Warm', 1),
  ('Pooja Iyer',      'pooja@mindtree.com',        '9876501013', 'Mindtree Ltd',       'Referral',   'DevOps Automation',      'Hot',  2),
  ('Rahul Agarwal',   'rahul@hexaware.com',        '9876501014', 'Hexaware Tech',      'Website',    'AI/ML Platform',         'Warm', 3),
  ('Sunita Rao',      'sunita@persistent.com',     '9876501015', 'Persistent Systems', 'LinkedIn',   'API Gateway',            'New',  1),
  ('Manish Sharma',   'manish@tech9.com',          '9876501016', 'Tech9 India',        'Cold email', 'Mobile App',             'Cold', 2),
  ('Ritu Verma',      'ritu@bluedart.com',         '9876501017', 'BlueDart Express',   'Webinar',    'Fleet Management',       'Hot',  1),
  ('Arun Pillai',     'arun@paytmlabs.com',        '9876501018', 'Paytm Labs',         'LinkedIn',   'Payment Gateway SDK',    'Warm', 3),
  ('Geeta Nambiar',   'geeta@byju.com',            '9876501019', 'BYJU''s',            'Website',    'LMS Integration',        'New',  2),
  ('Karthik Reddy',   'karthik@swiggy.com',        '9876501020', 'Swiggy Tech',        'Event',      'Real-time Analytics',    'Hot',  1),
  -- New leads 21-35
  ('Tarun Khanna',    'tarun@ola.com',             '9876501021', 'Ola Cabs',           'Event',      'Mobility Platform',      'Hot',  9),
  ('Meghna Sood',     'meghna@paytm.com',          '9876501022', 'Paytm Payments',     'LinkedIn',   'Payment Analytics',      'Warm', 2),
  ('Harish Kumar',    'harish@amazon.in',          '9876501023', 'Amazon India',       'Website',    'Supply Chain Platform',  'New',  3),
  ('Smita Pillai',    'smita@flipkart.com',        '9876501024', 'Flipkart',           'Referral',   'Seller Analytics',       'Hot',  1),
  ('Lokesh Rao',      'lokesh@myntra.com',         '9876501025', 'Myntra',             'LinkedIn',   'Fashion Analytics',      'Warm', 9),
  ('Arpit Verma',     'arpit@naukri.com',          '9876501026', 'Naukri.com',         'Cold email', 'HR Tech Platform',       'Cold', 2),
  ('Deepika Menon',   'deepika@zomato.com',        '9876501027', 'Zomato',             'Event',      'Restaurant Analytics',   'Hot',  3),
  ('Siddharth Gupta', 'sidg@makemytrip.com',       '9876501028', 'MakeMyTrip',         'LinkedIn',   'Travel Analytics',       'Warm', 1),
  ('Pallavi Reddy',   'pallavi@cred.club',         '9876501029', 'CRED',               'Webinar',    'FinTech Platform',       'New',  9),
  ('Rajesh Tiwari',   'rajesh@policybazaar.com',   '9876501030', 'PolicyBazaar',       'Website',    'Insurance Analytics',    'Warm', 2),
  ('Vidya Krishnan',  'vidya@freshworks.com',      '9876501031', 'Freshworks',         'LinkedIn',   'CRM Analytics',          'Hot',  1),
  ('Anil Sharma',     'anil@juspay.com',           '9876501032', 'Juspay',             'Referral',   'Payment Gateway',        'Warm', 3),
  ('Chitra Sundaram', 'chitra@browserstack.com',   '9876501033', 'BrowserStack',       'Event',      'QA Automation',          'New',  9),
  ('Nikhil Batra',    'nikhil@razorpay.com',       '9876501034', 'Razorpay',           'LinkedIn',   'Payment Infrastructure', 'Hot',  1),
  ('Shilpa Goel',     'shilpa@urbancompany.com',   '9876501035', 'Urban Company',      'Cold email', 'Service Analytics',      'Cold', 2);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
--  CLIENTS (18)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO clients (company_name, contact_person, email, phone, status) VALUES
  -- Original 10
  ('Infosys Ltd',        'Arjun Rao',       'arjun@infosys.com',         '9876501001', 'Active'),
  ('TCS Digital',        'Priya Kumar',     'priya@tcs.com',             '9876501002', 'Active'),
  ('Wipro Cloud',        'Suresh Mehta',    'suresh@wipro.com',          '9876501003', 'Active'),
  ('Zoho Corp',          'Neel Bose',       'neel@zoho.com',             '9876501005', 'Active'),
  ('HCL Tech',           'Divya Venkat',    'divya@hcltech.com',         '9876501004', 'Active'),
  ('Mphasis',            'Rohit Nair',      'rohit@mphasis.com',         '9876501006', 'Active'),
  ('BlueDart Express',   'Ritu Verma',      'ritu@bluedart.com',         '9876501017', 'Active'),
  ('Airtel Business',    'Vikram Rao',      'vikram@airtel.com',         '9876501008', 'Active'),
  ('Reliance Retail',    'Kavita Sharma',   'kavita@relianceretail.com', '9876501009', 'Active'),
  ('Mindtree Ltd',       'Pooja Iyer',      'pooja@mindtree.com',        '9876501013', 'Active'),
  -- New clients 11-18
  ('Ola Cabs',           'Tarun Khanna',    'tarun@ola.com',             '9876501021', 'Active'),
  ('Flipkart',           'Smita Pillai',    'smita@flipkart.com',        '9876501024', 'Active'),
  ('Zomato',             'Deepika Menon',   'deepika@zomato.com',        '9876501027', 'Active'),
  ('Freshworks',         'Vidya Krishnan',  'vidya@freshworks.com',      '9876501031', 'Active'),
  ('Razorpay',           'Nikhil Batra',    'nikhil@razorpay.com',       '9876501034', 'Active'),
  ('MakeMyTrip',         'Siddharth Gupta', 'sidg@makemytrip.com',       '9876501028', 'On hold'),
  ('Paytm Payments',     'Meghna Sood',     'meghna@paytm.com',          '9876501022', 'Active'),
  ('Naukri.com',         'Arpit Verma',     'arpit@naukri.com',          '9876501026', 'Inactive');

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
--  DEALS (30 â€” spread across all 5 Kanban stages)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO deals (deal_name, value, stage, probability, expected_close, lead_id, client_id) VALUES
  -- Prospecting (5)
  ('Retail Analytics Suite',       650000,  'Prospecting', 20, '2026-07-30', 9,  9),
  ('HR Platform License',          480000,  'Prospecting', 15, '2026-08-15', 7,  NULL),
  ('Portfolio Dashboard',          320000,  'Prospecting', 25, '2026-07-01', 11, NULL),
  ('Mobility Platform Suite',      520000,  'Prospecting', 20, '2026-09-15', 21, 11),
  ('Fashion Analytics Dashboard',  380000,  'Prospecting', 15, '2026-09-30', 25, NULL),

  -- Qualified (6)
  ('Analytics Platform v3',        920000,  'Qualified',   55, '2026-06-30', 2,  2),
  ('ERP Integration Suite',        740000,  'Qualified',   50, '2026-07-15', 12, NULL),
  ('DevOps Automation Bundle',     560000,  'Qualified',   45, '2026-06-20', 13, 10),
  ('API Gateway Setup',            280000,  'Qualified',   60, '2026-06-10', 15, NULL),
  ('Restaurant Analytics Platform',680000,  'Qualified',   55, '2026-07-31', 27, 13),
  ('FinTech Platform v2',          890000,  'Qualified',   50, '2026-07-20', 29, NULL),

  -- Proposal (6)
  ('Cloud Migration Suite',        780000,  'Proposal',    55, '2026-05-31', 3,  3),
  ('Security Audit Bundle',        410000,  'Proposal',    45, '2026-05-20', 4,  5),
  ('Data Warehouse Project',       730000,  'Proposal',    60, '2026-05-25', 6,  6),
  ('LMS Integration Platform',     350000,  'Proposal',    40, '2026-06-05', 19, NULL),
  ('Seller Analytics Suite',       750000,  'Proposal',    60, '2026-06-15', 24, 12),
  ('Insurance Analytics Portal',   560000,  'Proposal',    45, '2026-07-10', 30, NULL),

  -- Negotiation (7)
  ('Enterprise SaaS License',     1250000,  'Negotiation', 82, '2026-04-30', 1,  1),
  ('CRM Integration Pack',         540000,  'Negotiation', 88, '2026-04-20', 1,  1),
  ('Chatbot SaaS Bundle',          290000,  'Negotiation', 75, '2026-04-15', 8,  8),
  ('Real-time Analytics Engine',   870000,  'Negotiation', 80, '2026-04-25', 20, NULL),
  ('CRM Analytics Bundle',         980000,  'Negotiation', 85, '2026-05-10', 31, 14),
  ('Travel Analytics Suite',       640000,  'Negotiation', 78, '2026-05-20', 28, 16),
  ('Payment Infrastructure Deal', 1150000,  'Negotiation', 88, '2026-05-05', 34, 15),

  -- Closed Won (6)
  ('Fleet Management Suite',       860000,  'Closed Won',  100,'2026-03-31', 17, 7),
  ('Zoho CRM Connector Pack',      540000,  'Closed Won',  100,'2026-03-15', 5,  4),
  ('AI/ML Platform License',       680000,  'Closed Won',  100,'2026-02-28', 14, NULL),
  ('QA Automation Platform',       480000,  'Closed Won',  100,'2026-03-20', 33, NULL),
  ('HR Tech Platform License',     720000,  'Closed Won',  100,'2026-04-01', 26, 18),
  ('Payment Gateway SDK',          420000,  'Closed Won',  100,'2026-03-10', 32, NULL);

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
--  PROJECTS (18)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO projects (project_name, service_type, client_id, start_date, end_date, status) VALUES
  -- Original 10
  ('CRM Portal Redesign',           'Web Development',     1,  '2026-01-15', '2026-06-30', 'Active'),
  ('Cloud Migration Phase 2',       'Cloud',               3,  '2026-02-01', '2026-07-15', 'Active'),
  ('Mobile App â€” Phase 2',          'Mobile App',          6,  '2026-01-10', '2026-05-20', 'Active'),
  ('Analytics Dashboard v2',        'Analytics',           2,  '2026-03-01', '2026-04-10', 'Active'),
  ('Fleet Management System',       'Enterprise Software', 7,  '2026-03-15', '2026-08-28', 'Active'),
  ('ERP Integration',               'Integration',         5,  '2026-04-01', '2026-09-01', 'Planning'),
  ('Security Compliance Audit',     'Consulting',          5,  '2026-04-15', '2026-07-15', 'Planning'),
  ('Customer Portal â€” Infosys',     'Web Development',     1,  '2025-10-01', '2026-03-31', 'Completed'),
  ('Zoho CRM Connector',            'Integration',         4,  '2025-11-15', '2026-03-15', 'Completed'),
  ('Data Warehouse Setup',          'Data Engineering',    6,  '2026-05-01', '2026-10-31', 'On Hold'),
  -- New projects 11-18
  ('Mobility Analytics Platform',   'Mobile App',          11, '2026-02-15', '2026-08-15', 'Active'),
  ('Seller Dashboard â€” Flipkart',   'Analytics',           12, '2026-03-01', '2026-07-31', 'Active'),
  ('Restaurant Intelligence Suite', 'Analytics',           13, '2026-04-01', '2026-09-30', 'Planning'),
  ('CRM Analytics â€” Freshworks',    'Analytics',           14, '2026-01-15', '2026-05-31', 'Active'),
  ('Payment Infrastructure â€” Razorpay','Integration',      15, '2026-03-15', '2026-08-31', 'Active'),
  ('Travel Booking Analytics',      'Analytics',           16, '2025-12-01', '2026-03-31', 'Completed'),
  ('Digital Wallet Dashboard',      'Web Development',     17, '2026-05-01', '2026-10-31', 'Planning'),
  ('Job Platform Redesign',         'Web Development',     18, '2025-11-01', '2026-02-28', 'Completed');

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
--  TASKS (35)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO tasks (task_name, description, project_id, assigned_to, deadline, status, priority) VALUES
  -- Original 20
  ('Follow up with Arjun Rao on proposal',     'Send revised proposal with updated pricing',            1,    1,    '2026-04-06', 'Pending',     'High'),
  ('Review Security Audit scope doc',          'Cross-check with HCL Tech requirements',                7,    2,    '2026-04-07', 'Pending',     'High'),
  ('Client meeting â€” TCS sprint demo',         'Prepare demo slides for analytics module',              4,    3,    '2026-04-08', 'Pending',     'High'),
  ('Send invoice to Wipro Cloud',              'Invoice for Phase 2 milestone 1',                       2,    1,    '2026-04-03', 'Pending',     'Medium'),
  ('Update Fleet Mgmt Kanban board',           'Sync status with BlueDart team',                        5,    2,    '2026-04-02', 'Pending',     'Low'),
  ('Prepare Q2 Business Review deck',          'Include pipeline metrics and win rate analysis',        NULL, 3,    '2026-04-01', 'Pending',     'Low'),
  ('Design wireframes for CRM portal',         'Cover dashboard, leads, and deals screens',             1,    6,    '2026-04-20', 'In Progress', 'High'),
  ('Backend API â€” Leads module',               'Build REST endpoints with pagination',                  1,    4,    '2026-04-18', 'In Progress', 'Medium'),
  ('Frontend integration â€” Analytics',         'Wire charts to live API data',                          4,    5,    '2026-04-12', 'In Progress', 'High'),
  ('Code review â€” Cloud Migration APIs',       'Review PR #42, #43, #44',                               2,    4,    '2026-04-10', 'In Progress', 'Medium'),
  ('Draft contract â€” Enterprise SaaS',         'Legal review of SLA and data clauses',                  NULL, 1,    '2026-04-15', 'In Progress', 'High'),
  ('Onboard BlueDart team on portal',          'Conduct walkthrough session',                           5,    8,    '2026-04-22', 'Pending',     'Medium'),
  ('SEO audit â€” CRM Portal',                  'Run Screaming Frog, fix meta tags',                     1,    7,    '2026-04-25', 'Pending',     'Low'),
  ('Database schema finalise',                 'Finalise schema for data warehouse project',            10,   4,    '2026-05-10', 'Pending',     'High'),
  ('UI component library setup',              'Bootstrap design system for Mobile App',                3,    6,    '2026-04-28', 'In Progress', 'Medium'),
  ('UAT sign-off â€” Customer Portal',           'Get written approval from Infosys stakeholder',        8,    8,    '2026-04-05', 'Done',        'High'),
  ('Deploy Zoho CRM Connector to prod',        'Blue-green deployment on AWS',                          9,    4,    '2026-03-15', 'Done',        'High'),
  ('Write project closure report',             'Document lessons learned for Fleet Mgmt',               8,    8,    '2026-04-08', 'Done',        'Medium'),
  ('Conduct user acceptance testing',          'Validate all flows for Mobile App Phase 2',             3,    5,    '2026-04-15', 'Pending',     'High'),
  ('Team sync-up â€” weekly standup',            'Update blockers and progress in Jira',                  NULL, NULL, '2026-04-07', 'Done',        'Low'),
  -- New tasks 21-35
  ('Kickoff meeting â€” Ola Cabs',               'Prepare project plan, timeline and resource allocation',11,   4,    '2026-04-15', 'Pending',     'High'),
  ('Design UI â€” Seller Dashboard',             'Create Figma mockups for Flipkart analytics dashboard', 12,   6,    '2026-04-20', 'In Progress', 'High'),
  ('API integration â€” CRM Analytics',          'Connect Freshworks CRM data to analytics endpoints',   14,   11,   '2026-04-18', 'In Progress', 'Medium'),
  ('Set up CI/CD pipeline â€” Razorpay',         'Configure GitHub Actions workflows and staging env',    15,   4,    '2026-04-25', 'Pending',     'High'),
  ('Write requirements doc â€” Restaurant Suite','Compile functional spec from Zomato stakeholders',     13,   8,    '2026-04-22', 'Pending',     'Medium'),
  ('QA regression â€” Mobility Platform',        'Run regression and performance test suite',             11,   5,    '2026-05-01', 'Pending',     'Medium'),
  ('Data model â€” Digital Wallet Dashboard',    'Design PostgreSQL schema for Paytm Payments project',  17,   4,    '2026-05-10', 'Pending',     'High'),
  ('SEO & keyword strategy â€” Job Platform',    'Finalize keyword strategy and page structure',          18,   7,    '2026-04-10', 'Done',        'Low'),
  ('Client review call â€” Travel Analytics',    'Present prototype to MakeMyTrip stakeholders',         16,   9,    '2026-04-08', 'Done',        'Medium'),
  ('Finalize SLA â€” Payment Infrastructure',    'Review and sign off on Razorpay SLA agreement',        15,   1,    '2026-04-12', 'In Progress', 'High'),
  ('Content creation â€” Marketing Q2',          'Write blog posts for CRM and SaaS use cases',          NULL, 10,   '2026-04-30', 'Pending',     'Low'),
  ('Update project tracker â€” Seller Dashboard','Sync Flipkart milestones in Jira and Confluence',      12,   11,   '2026-04-09', 'Done',        'Low'),
  ('Push notifications â€” Mobility App',        'Implement Firebase Cloud Messaging for Ola Cabs app',  11,   5,    '2026-05-05', 'Pending',     'High'),
  ('Integration testing â€” CRM Analytics',      'End-to-end test with mock Freshworks data',            14,   4,    '2026-05-15', 'Pending',     'Medium'),
  ('Handover documentation â€” Job Platform',    'Write final handover and runbook docs for Naukri.com', 18,   8,    '2026-03-01', 'Done',        'Medium');

INSERT INTO invoices (project_id, amount, status, issued_date, due_date) VALUES
  -- Paid (10)
  (1,  500000, 'Paid',    '2026-01-20', '2026-02-20'),
  (4,  460000, 'Paid',    '2026-03-01', '2026-03-31'),
  (8,  800000, 'Paid',    '2025-10-15', '2025-11-15'),
  (8,  400000, 'Paid',    '2026-01-01', '2026-01-31'),
  (9,  540000, 'Paid',    '2026-02-01', '2026-03-01'),
  (5,  430000, 'Paid',    '2026-03-20', '2026-04-20'),
  (11, 350000, 'Paid',    '2026-02-20', '2026-03-20'),
  (12, 450000, 'Paid',    '2026-03-05', '2026-04-05'),
  (14, 380000, 'Paid',    '2026-01-20', '2026-02-20'),
  (16, 640000, 'Paid',    '2026-01-01', '2026-01-31'),
  -- Pending (8)
  (1,  500000, 'Pending', '2026-04-01', '2026-05-01'),
  (2,  390000, 'Pending', '2026-04-01', '2026-05-01'),
  (3,  280000, 'Pending', '2026-04-05', '2026-05-05'),
  (5,  430000, 'Pending', '2026-04-15', '2026-05-15'),
  (6,  370000, 'Pending', '2026-04-01', '2026-04-30'),
  (11, 350000, 'Pending', '2026-04-10', '2026-05-10'),
  (12, 450000, 'Pending', '2026-04-05', '2026-05-05'),
  (15, 580000, 'Pending', '2026-04-01', '2026-05-01'),
  -- Overdue (6)
  (2,  390000, 'Overdue', '2026-02-15', '2026-03-15'),
  (4,  460000, 'Overdue', '2026-02-01', '2026-03-01'),
  (7,  200000, 'Overdue', '2026-03-01', '2026-04-01'),
  (10, 310000, 'Overdue', '2026-02-10', '2026-03-10'),
  (13, 290000, 'Overdue', '2026-02-28', '2026-03-28'),
  (17, 250000, 'Overdue', '2026-03-15', '2026-04-15');

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
--  ACTIVITIES (40)
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
INSERT INTO activities (lead_id, type, notes, activity_date) VALUES
  -- Original 22
  (1,  'Call',    'Introductory call with Arjun Rao â€” discussed CRM pain points and integration scope. Follow up with proposal next week.',             NOW() - INTERVAL '2 hours'),
  (2,  'Email',   'Sent v2 Analytics Platform proposal to Priya Kumar with revised pricing breakdown.',                                                  NOW() - INTERVAL '4 hours'),
  (3,  'Meeting', 'Sprint demo with Wipro Cloud team â€” presented Cloud Migration Phase 2 architecture. Client approved approach.',                       NOW() - INTERVAL '6 hours'),
  (1,  'Note',    'CRM Integration Pack moved to Negotiation. Client comparing with Salesforce. Expected close by 20 Apr.',                             NOW() - INTERVAL '8 hours'),
  (9,  'Call',    'Discussed Retail Analytics Suite requirements with Kavita Sharma. Strong interest â€” budget confirmed at â‚¹6.5L.',                     NOW() - INTERVAL '1 day'),
  (5,  'Email',   'Zoho Corp signed off on CRM Connector Pack. Contract sent for legal review.',                                                        NOW() - INTERVAL '1 day'),
  (17, 'Meeting', 'Quarterly business review with BlueDart Express â€” Fleet Management system going live next week.',                                    NOW() - INTERVAL '1 day'),
  (4,  'Call',    'HCL Tech requested detailed Security Audit scope document. Shared with Divya Venkat.',                                               NOW() - INTERVAL '2 days'),
  (13, 'Meeting', 'DevOps demo for Mindtree Ltd â€” Pooja Iyer very impressed. Moving to Qualified stage.',                                              NOW() - INTERVAL '2 days'),
  (14, 'Email',   'Sent AI/ML Platform proposal to Hexaware Tech. Waiting for procurement approval.',                                                   NOW() - INTERVAL '2 days'),
  (7,  'Call',    'Discovery call with Bajaj Finserv â€” explored HR Platform requirements. Budget: â‚¹4.8L.',                                              NOW() - INTERVAL '3 days'),
  (20, 'Meeting', 'Real-time Analytics requirements workshop with Swiggy Tech. 3-hour deep dive.',                                                      NOW() - INTERVAL '3 days'),
  (8,  'Email',   'Chatbot SaaS Bundle contract finalised with Airtel Business. Payment terms: 50% upfront.',                                           NOW() - INTERVAL '3 days'),
  (6,  'Note',    'Data Warehouse Project proposal accepted in principle. Waiting for board approval at Mphasis.',                                       NOW() - INTERVAL '4 days'),
  (2,  'Call',    'Follow-up call with TCS Digital on analytics timeline. Confirmed go-live by June end.',                                              NOW() - INTERVAL '4 days'),
  (18, 'Meeting', 'Technical discovery session with Paytm Labs for Payment Gateway SDK.',                                                               NOW() - INTERVAL '5 days'),
  (11, 'Email',   'Sent HDFC Securities portfolio dashboard prototype link for review.',                                                                NOW() - INTERVAL '5 days'),
  (19, 'Call',    'LMS Integration requirements call with BYJU''s tech team â€” 45 min.',                                                               NOW() - INTERVAL '6 days'),
  (12, 'Meeting', 'ERP Integration kickoff meeting with L&T Infotech â€” Sanjay Patel attending.',                                                      NOW() - INTERVAL '7 days'),
  (3,  'Note',    'Wipro Cloud signed Phase 2 SOW. Project kickoff scheduled for 1 May 2026.',                                                         NOW() - INTERVAL '7 days'),
  (15, 'Email',   'API Gateway proposal sent to Persistent Systems â€” awaiting feedback from technical team.',                                           NOW() - INTERVAL '8 days'),
  (10, 'Call',    'Re-engagement call with ICICI Bank â€” new POC is Deepak Jain. Exploring Data Analytics use case.',                                   NOW() - INTERVAL '9 days'),
  -- New activities 23-40
  (21, 'Call',    'Discovery call with Tarun Khanna at Ola Cabs â€” Mobility Analytics Platform scope confirmed. Budget â‚¹8L approved.',                  NOW() - INTERVAL '10 hours'),
  (24, 'Email',   'Sent Seller Analytics Suite proposal to Smita Pillai at Flipkart. Waiting for procurement team review.',                            NOW() - INTERVAL '12 hours'),
  (27, 'Meeting', 'Requirements workshop with Deepika Menon at Zomato â€” real-time restaurant performance dashboard deep dive. 2 hours.',               NOW() - INTERVAL '14 hours'),
  (34, 'Call',    'Call with Nikhil Batra at Razorpay â€” Payment Infrastructure deal moving to Negotiation. Expected close 5 May.',                     NOW() - INTERVAL '1 day 2 hours'),
  (31, 'Meeting', 'CRM Analytics Bundle demo for Freshworks â€” Vidya Krishnan ready to sign. Contract sent for review.',                               NOW() - INTERVAL '1 day 4 hours'),
  (22, 'Email',   'Payment Analytics proposal sent to Meghna Sood at Paytm Payments. CC''d procurement head on thread.',                              NOW() - INTERVAL '1 day 6 hours'),
  (28, 'Note',    'Travel Analytics Suite moved to Negotiation â€” MakeMyTrip board approved â‚¹6.4L budget. Close targeted 20 May.',                     NOW() - INTERVAL '2 days 2 hours'),
  (29, 'Call',    'Intro call with Pallavi Reddy at CRED â€” FinTech Platform v2 requirements documented. Very promising pipeline.',                      NOW() - INTERVAL '2 days 4 hours'),
  (33, 'Email',   'QA Automation Platform win confirmed with BrowserStack â€” deal closed â‚¹4.8L on 20 Mar. Onboarding next.',                           NOW() - INTERVAL '2 days 6 hours'),
  (30, 'Meeting', 'Discovery meeting with Rajesh Tiwari at PolicyBazaar â€” Insurance Analytics use cases mapped. Proposal in progress.',                NOW() - INTERVAL '3 days 2 hours'),
  (32, 'Call',    'Juspay technical call with Anil Sharma â€” Payment Gateway SDK requirements finalised. Moving to Proposal stage.',                    NOW() - INTERVAL '3 days 4 hours'),
  (25, 'Note',    'Fashion Analytics Dashboard stalled at Prospecting â€” Myntra budget decision pending board meeting in May.',                         NOW() - INTERVAL '4 days 2 hours'),
  (23, 'Email',   'Amazon India inbound inquiry for Supply Chain Platform â€” intro call scheduled for next week with Harish Kumar.',                    NOW() - INTERVAL '4 days 6 hours'),
  (26, 'Call',    'Cold outreach to Arpit Verma at Naukri.com â€” not budgeting for new platforms this quarter. Marked Cold.',                           NOW() - INTERVAL '5 days 2 hours'),
  (35, 'Note',    'Urban Company inquiry closed as Cold â€” Shilpa Goel cited budget freeze for Service Analytics platform.',                            NOW() - INTERVAL '5 days 6 hours'),
  (34, 'Meeting', 'Technical scoping session with Razorpay engineering team â€” Payment Infrastructure architecture review completed.',                  NOW() - INTERVAL '6 days 2 hours'),
  (31, 'Call',    'Follow-up call with Freshworks â€” Vidya Krishnan confirmed executive sponsorship for CRM Analytics. Strong signal.',                 NOW() - INTERVAL '7 days 2 hours');

-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
--  Verify counts
-- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
SELECT 'teams'      AS tbl, COUNT(*) FROM teams
UNION ALL SELECT 'users',      COUNT(*) FROM users
UNION ALL SELECT 'leads',      COUNT(*) FROM leads
UNION ALL SELECT 'clients',    COUNT(*) FROM clients
UNION ALL SELECT 'deals',      COUNT(*) FROM deals
UNION ALL SELECT 'projects',   COUNT(*) FROM projects
UNION ALL SELECT 'tasks',      COUNT(*) FROM tasks
UNION ALL SELECT 'invoices',   COUNT(*) FROM invoices
UNION ALL SELECT 'activities', COUNT(*) FROM activities;
