-- ============================================================
--  AstrawinCRM — Add 100 Clients (with some from converted leads)
--  Run: PGPASSWORD=Admin6 psql -U postgres -d CRM -f seed-100-clients.sql
--
--  This script:
--    1. Adds 40 new leads (IDs 36–75), some marked 'Converted'
--    2. Adds 82 new clients (IDs 19–100) for a total of 100 clients
--    3. Some new clients reference converted lead data
-- ============================================================

-- ─────────────────────────────────────────
--  NEW LEADS (40) — IDs 36–75
--  Some are Converted (will appear as clients), rest are various statuses
-- ─────────────────────────────────────────
INSERT INTO leads (name, email, phone, company, source, service_interest, status, assigned_to) VALUES
  -- Converted leads (will become clients 19–38 below)
  ('Amit Saxena',       'amit@tatamotors.com',       '9876502001', 'Tata Motors',         'LinkedIn',   'Fleet Analytics',         'Converted', 1),
  ('Snehal Deshmukh',   'snehal@mahindra.com',       '9876502002', 'Mahindra Tech',       'Referral',   'ERP Modernization',       'Converted', 2),
  ('Rohan Joshi',       'rohan@godrejind.com',       '9876502003', 'Godrej Industries',   'Website',    'Supply Chain Dashboard',  'Converted', 3),
  ('Anjali Menon',      'anjali@kotak.com',          '9876502004', 'Kotak Mahindra Bank', 'Event',      'Banking Analytics',       'Converted', 1),
  ('Pranav Kulkarni',   'pranav@lenskart.com',       '9876502005', 'Lenskart',            'LinkedIn',   'Retail Tech Platform',    'Converted', 9),
  ('Shruti Reddy',      'shruti@bigbasket.com',      '9876502006', 'BigBasket',           'Webinar',    'Inventory Management',    'Converted', 2),
  ('Varun Kapoor',      'varun@dream11.com',         '9876502007', 'Dream11',             'LinkedIn',   'Fantasy Sports Analytics', 'Converted', 1),
  ('Prerna Sharma',     'prerna@nykaa.com',          '9876502008', 'Nykaa',               'Referral',   'Beauty Tech Platform',    'Converted', 3),
  ('Gaurav Singh',      'gaurav@firstcry.com',       '9876502009', 'FirstCry',            'Website',    'E-commerce Platform',     'Converted', 2),
  ('Tanya Gupta',       'tanya@dunzo.com',           '9876502010', 'Dunzo',               'Event',      'Delivery Optimization',   'Converted', 9),
  ('Mohan Krishnamurthy','mohan@biocon.com',         '9876502011', 'Biocon Ltd',          'LinkedIn',   'Pharma Analytics',        'Converted', 1),
  ('Ritika Bhandari',   'ritika@sharechat.com',      '9876502012', 'ShareChat',           'Cold email', 'Social Media Analytics',  'Converted', 2),
  ('Sunil Agarwal',     'sunil@boatlifestyle.com',   '9876502013', 'boAt Lifestyle',      'Website',    'D2C Analytics',           'Converted', 3),
  ('Kavya Nair',        'kavya@meesho.com',          '9876502014', 'Meesho',              'LinkedIn',   'Seller Platform',         'Converted', 1),
  ('Raj Malhotra',      'raj@phonepe.com',           '9876502015', 'PhonePe',             'Event',      'UPI Analytics Dashboard', 'Converted', 9),
  ('Ishita Patel',      'ishita@zerodha.com',        '9876502016', 'Zerodha',             'Referral',   'Trading Dashboard',       'Converted', 2),
  ('Dhruv Mehta',       'dhruv@groww.com',           '9876502017', 'Groww',               'LinkedIn',   'Investment Analytics',    'Converted', 1),
  ('Nandini Srinivasan','nandini@unacademy.com',     '9876502018', 'Unacademy',           'Webinar',    'EdTech Analytics',        'Converted', 3),
  ('Kartik Arora',      'kartik@cars24.com',         '9876502019', 'Cars24',              'Website',    'Auto Marketplace',        'Converted', 2),
  ('Poornima Rao',      'poornima@cure.fit',         '9876502020', 'Cult.fit',            'LinkedIn',   'Fitness Tech Platform',   'Converted', 9),

  -- Non-converted leads (various statuses)
  ('Sameer Desai',      'sameer@adityabirla.com',    '9876502021', 'Aditya Birla Group',  'Event',      'Conglomerate Dashboard',  'Hot',  1),
  ('Bhavna Malhotra',   'bhavna@marico.com',         '9876502022', 'Marico Ltd',          'LinkedIn',   'FMCG Analytics',          'Warm', 2),
  ('Akash Tiwari',      'akash@delhivery.com',       '9876502023', 'Delhivery',           'Website',    'Logistics AI',            'New',  3),
  ('Divya Chopra',      'divya@titan.com',           '9876502024', 'Titan Company',       'Referral',   'Retail Intelligence',     'Hot',  1),
  ('Vimal Kumar',       'vimal@havells.com',         '9876502025', 'Havells India',       'Cold email', 'IoT Dashboard',           'Cold', 9),
  ('Rashmi Pandey',     'rashmi@policybazaar.com',   '9876502026', 'PB Fintech',          'LinkedIn',   'InsurTech Platform',      'Warm', 2),
  ('Saurabh Khanna',    'saurabh@pepsi.in',          '9876502027', 'PepsiCo India',       'Event',      'Supply Chain Analytics',  'Hot',  3),
  ('Megha Srivastava',  'megha@tatasteel.com',       '9876502028', 'Tata Steel',          'LinkedIn',   'Manufacturing Analytics', 'New',  1),
  ('Pankaj Sharma',     'pankaj@jsw.com',            '9876502029', 'JSW Group',           'Referral',   'Industrial Dashboard',    'Warm', 2),
  ('Alka Dixit',        'alka@dmart.com',            '9876502030', 'DMart',               'Website',    'Retail Analytics',        'Hot',  9),
  ('Raghav Mittal',     'raghav@vedanta.com',        '9876502031', 'Vedanta Ltd',         'Event',      'Mining Analytics',        'New',  3),
  ('Sonal Agarwal',     'sonal@cipla.com',           '9876502032', 'Cipla Ltd',           'LinkedIn',   'Pharma Supply Chain',     'Warm', 1),
  ('Hemant Bhatt',      'hemant@bajajfin.com',       '9876502033', 'Bajaj Finance',       'Cold email', 'Lending Analytics',       'Hot',  2),
  ('Nirmala Reddy',     'nirmala@ultratech.com',     '9876502034', 'UltraTech Cement',    'Referral',   'Manufacturing IoT',       'Cold', 3),
  ('Tarun Chadha',      'tarun@bpcl.com',            '9876502035', 'BPCL',                'LinkedIn',   'Energy Analytics',        'Warm', 1),
  ('Gauri Mathur',      'gauri@pidilite.com',        '9876502036', 'Pidilite Industries', 'Event',      'Distribution Analytics',  'New',  9),
  ('Siddharth Jain',    'sidj@colgate.in',           '9876502037', 'Colgate India',       'Website',    'Consumer Insights',       'Hot',  2),
  ('Lata Krishnan',     'lata@apollohosp.com',       '9876502038', 'Apollo Hospitals',    'Webinar',    'HealthTech Platform',     'Warm', 3),
  ('Ajay Pandey',       'ajay@dabur.com',            '9876502039', 'Dabur India',         'LinkedIn',   'FMCG Dashboard',          'New',  1),
  ('Rekha Bansal',      'rekha@torrent.com',         '9876502040', 'Torrent Pharma',      'Referral',   'Drug Analytics',          'Hot',  2);

-- ─────────────────────────────────────────
--  NEW CLIENTS (82) — IDs 19–100
--  First 20 are from converted leads above, rest are direct clients
-- ─────────────────────────────────────────
INSERT INTO clients (company_name, contact_person, email, phone, status) VALUES
  -- From converted leads (20 clients)
  ('Tata Motors',           'Amit Saxena',          'amit@tatamotors.com',       '9876502001', 'Active'),
  ('Mahindra Tech',         'Snehal Deshmukh',      'snehal@mahindra.com',       '9876502002', 'Active'),
  ('Godrej Industries',     'Rohan Joshi',          'rohan@godrejind.com',       '9876502003', 'Active'),
  ('Kotak Mahindra Bank',   'Anjali Menon',         'anjali@kotak.com',          '9876502004', 'Active'),
  ('Lenskart',              'Pranav Kulkarni',      'pranav@lenskart.com',       '9876502005', 'Active'),
  ('BigBasket',             'Shruti Reddy',         'shruti@bigbasket.com',      '9876502006', 'Active'),
  ('Dream11',               'Varun Kapoor',         'varun@dream11.com',         '9876502007', 'Active'),
  ('Nykaa',                 'Prerna Sharma',        'prerna@nykaa.com',          '9876502008', 'Active'),
  ('FirstCry',              'Gaurav Singh',         'gaurav@firstcry.com',       '9876502009', 'On hold'),
  ('Dunzo',                 'Tanya Gupta',          'tanya@dunzo.com',           '9876502010', 'Active'),
  ('Biocon Ltd',            'Mohan Krishnamurthy',  'mohan@biocon.com',          '9876502011', 'Active'),
  ('ShareChat',             'Ritika Bhandari',      'ritika@sharechat.com',      '9876502012', 'Active'),
  ('boAt Lifestyle',        'Sunil Agarwal',        'sunil@boatlifestyle.com',   '9876502013', 'Active'),
  ('Meesho',                'Kavya Nair',           'kavya@meesho.com',          '9876502014', 'Active'),
  ('PhonePe',               'Raj Malhotra',         'raj@phonepe.com',           '9876502015', 'Active'),
  ('Zerodha',               'Ishita Patel',         'ishita@zerodha.com',        '9876502016', 'Active'),
  ('Groww',                 'Dhruv Mehta',          'dhruv@groww.com',           '9876502017', 'On hold'),
  ('Unacademy',             'Nandini Srinivasan',   'nandini@unacademy.com',     '9876502018', 'Active'),
  ('Cars24',                'Kartik Arora',         'kartik@cars24.com',         '9876502019', 'Active'),
  ('Cult.fit',              'Poornima Rao',         'poornima@cure.fit',         '9876502020', 'Active'),

  -- Direct clients — not from leads (62 clients, IDs 39–100)
  ('Adani Enterprises',     'Vikram Adani',         'vikram@adani.com',          '9876503001', 'Active'),
  ('Reliance Jio',          'Akash Ambani',         'akash@jio.com',             '9876503002', 'Active'),
  ('Tata Consultancy',      'Rajesh Gopinathan',    'rajesh@tcs.com',            '9876503003', 'Active'),
  ('Sun Pharma',            'Dilip Shanghvi',       'dilip@sunpharma.com',       '9876503004', 'Active'),
  ('Larsen & Toubro',       'S N Subrahmanyan',     'sn@lnt.com',               '9876503005', 'Active'),
  ('State Bank of India',   'Dinesh Khara',         'dinesh@sbi.co.in',          '9876503006', 'Active'),
  ('Hindustan Unilever',    'Rohit Jawa',           'rohit@hul.com',             '9876503007', 'Active'),
  ('ITC Limited',           'Sanjiv Puri',          'sanjiv@itc.in',             '9876503008', 'On hold'),
  ('Axis Bank',             'Amitabh Chaudhry',     'amitabh@axisbank.com',      '9876503009', 'Active'),
  ('Bajaj Auto',            'Rajiv Bajaj',          'rajiv@bajajauto.com',       '9876503010', 'Active'),
  ('Tech Mahindra',         'C P Gurnani',          'cp@techmahindra.com',       '9876503011', 'Active'),
  ('Maruti Suzuki',         'Hisashi Takeuchi',     'hisashi@maruti.com',        '9876503012', 'Active'),
  ('Asian Paints',          'Amit Syngle',          'amit@asianpaints.com',      '9876503013', 'Active'),
  ('Nestle India',          'Suresh Narayanan',     'suresh@nestle.in',          '9876503014', 'On hold'),
  ('Power Grid Corp',       'K Sreekant',           'sreekant@powergrid.in',     '9876503015', 'Active'),
  ('Coal India',            'P M Prasad',           'prasad@coalindia.in',       '9876503016', 'Inactive'),
  ('JSW Steel',             'Sajjan Jindal',        'sajjan@jsw.com',            '9876503017', 'Active'),
  ('NTPC Ltd',              'Gurdeep Singh',        'gurdeep@ntpc.co.in',        '9876503018', 'Active'),
  ('Divi''s Laboratories',  'Murali Divi',          'murali@divis.com',          '9876503019', 'Active'),
  ('Shree Cement',          'H M Bangur',           'bangur@shreecement.com',    '9876503020', 'On hold'),
  ('Bharti Airtel',         'Gopal Vittal',         'gopal@bhartiairtel.com',    '9876503021', 'Active'),
  ('ONGC',                  'Arun K Singh',         'arun@ongc.co.in',           '9876503022', 'Active'),
  ('Grasim Industries',     'Kumar Birla',          'kumar@grasim.com',          '9876503023', 'Active'),
  ('Cipla Ltd',             'Umang Vohra',          'umang@cipla.com',           '9876503024', 'Active'),
  ('IndusInd Bank',         'Sumant Kathpalia',     'sumant@indusind.com',       '9876503025', 'Active'),
  ('Tata Steel',            'T V Narendran',        'tvn@tatasteel.com',         '9876503026', 'Inactive'),
  ('Eicher Motors',         'Siddhartha Lal',       'siddhartha@eicher.com',     '9876503027', 'Active'),
  ('Hero MotoCorp',         'Pawan Munjal',         'pawan@heromotocorp.com',    '9876503028', 'Active'),
  ('SBI Life Insurance',    'Mahesh Sharma',        'mahesh@sbilife.co.in',      '9876503029', 'Active'),
  ('Pidilite Industries',   'Bharat Puri',          'bharat@pidilite.com',       '9876503030', 'Active'),
  ('Havells India',         'Anil Rai Gupta',       'anilrai@havells.com',       '9876503031', 'On hold'),
  ('Ambuja Cements',        'Neeraj Akhoury',       'neeraj@ambuja.com',         '9876503032', 'Active'),
  ('Godrej Consumer',       'Sudhir Sitapati',      'sudhir@godrej.com',         '9876503033', 'Active'),
  ('Dabur India',           'Mohit Malhotra',       'mohit@dabur.com',           '9876503034', 'Active'),
  ('Apollo Hospitals',      'Prathap Reddy',        'prathap@apollohosp.com',    '9876503035', 'Active'),
  ('Torrent Pharma',        'Sudhir Mehta',         'sudhir@torrent.com',        '9876503036', 'Inactive'),
  ('Colgate Palmolive',     'Prabha Narasimhan',    'prabha@colgate.in',         '9876503037', 'Active'),
  ('Marico Ltd',            'Saugata Gupta',        'saugata@marico.com',        '9876503038', 'Active'),
  ('InterGlobe Aviation',   'Pieter Elbers',        'pieter@indigo.in',          '9876503039', 'Active'),
  ('Berger Paints',         'Abhijit Roy',          'abhijit@berger.com',        '9876503040', 'On hold'),
  ('Voltas Ltd',            'Pradeep Bakshi',       'pradeep@voltas.com',        '9876503041', 'Active'),
  ('Crompton Greaves',      'Shantanu Khosla',      'shantanu@crompton.com',     '9876503042', 'Active'),
  ('Page Industries',       'V S Ganesh',           'ganesh@page.com',           '9876503043', 'Active'),
  ('Jubilant FoodWorks',    'Pratik Pota',          'pratik@jubilant.com',       '9876503044', 'Active'),
  ('Astral Ltd',            'Sandeep Engineer',     'sandeep@astral.com',        '9876503045', 'Inactive'),
  ('Dr Reddy''s Labs',      'Erez Israeli',         'erez@drreddys.com',         '9876503046', 'Active'),
  ('AU Small Finance Bank', 'Sanjay Agarwal',       'sanjay@aubank.in',          '9876503047', 'Active'),
  ('Coforge Ltd',           'Sudhir Singh',         'sudhir@coforge.com',        '9876503048', 'Active'),
  ('Persistent Systems',    'Sandeep Kalra',        'sandeep@persistent.com',    '9876503049', 'Active'),
  ('Muthoot Finance',       'George Alexander',     'george@muthoot.com',        '9876503050', 'On hold'),
  ('Cholamandalam',         'Vellayan Subbiah',     'vellayan@chola.com',        '9876503051', 'Active'),
  ('Trent Ltd',             'P Venkatesalu',        'venkatesalu@trent.com',     '9876503052', 'Active');

-- ─────────────────────────────────────────
--  Mark the 20 converted leads' status
--  (They were inserted as 'Converted' above, so this is already done)
-- ─────────────────────────────────────────

-- ─────────────────────────────────────────
--  Verify final counts
-- ─────────────────────────────────────────
SELECT 'leads'   AS tbl, COUNT(*) FROM leads
UNION ALL SELECT 'clients', COUNT(*) FROM clients;
