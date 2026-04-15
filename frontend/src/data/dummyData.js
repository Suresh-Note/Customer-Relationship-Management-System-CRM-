// ────────────────────────────────────
//  LEADS
// ────────────────────────────────────
export const leads = [
  { id: 1, name: "Arjun Rao", email: "arjun@infosys.com", company: "Infosys Ltd", source: "LinkedIn", status: "Hot", score: 82, owner: "Meera K.", date: "28 Mar" },
  { id: 2, name: "Priya Kumar", email: "priya@tcs.com", company: "TCS Digital", source: "Referral", status: "Warm", score: 71, owner: "Kiran P.", date: "26 Mar" },
  { id: 3, name: "Suresh Mehta", email: "suresh@wipro.com", company: "Wipro Cloud", source: "Website", status: "New", score: 54, owner: "Ravi S.", date: "25 Mar" },
  { id: 4, name: "Divya Venkat", email: "divya@hcl.com", company: "HCL Tech", source: "Cold email", status: "Cold", score: 38, owner: "Meera K.", date: "22 Mar" },
  { id: 5, name: "Neel Bose", email: "neel@zoho.com", company: "Zoho Corp", source: "LinkedIn", status: "Hot", score: 89, owner: "Ravi S.", date: "20 Mar" },
  { id: 6, name: "Rohit Nair", email: "rohit@mphasis.com", company: "Mphasis", source: "Webinar", status: "Warm", score: 63, owner: "Kiran P.", date: "18 Mar" },
  { id: 7, name: "Ananya Singh", email: "ananya@bajaj.com", company: "Bajaj Finserv", source: "Website", status: "New", score: 47, owner: "Ravi S.", date: "15 Mar" },
  { id: 8, name: "Vikram Rao", email: "vikram@airtel.com", company: "Airtel Business", source: "LinkedIn", status: "Warm", score: 68, owner: "Meera K.", date: "12 Mar" },
  { id: 9, name: "Kavita Sharma", email: "kavita@reliance.com", company: "Reliance Retail", source: "Referral", status: "Hot", score: 91, owner: "Kiran P.", date: "10 Mar" },
  { id: 10, name: "Deepak Jain", email: "deepak@icici.com", company: "ICICI Bank", source: "Cold email", status: "Cold", score: 33, owner: "Ravi S.", date: "8 Mar" },
];

export const leadStats = { total: 124, hot: 31, conversionRate: 26 };

// ────────────────────────────────────
//  DEALS
// ────────────────────────────────────
export const deals = [
  // Prospecting
  { id: 1, name: "Retail Analytics Suite", company: "Reliance Retail", value: 650000, probability: 30, stage: "Prospecting", priority: "Low", owner: "KP", ownerColor: "bg-blue-400" },
  { id: 2, name: "HR Platform License", company: "Bajaj Finserv", value: 480000, probability: 20, stage: "Prospecting", priority: "Low", owner: "RS", ownerColor: "bg-emerald-400" },
  // Qualified
  { id: 3, name: "Analytics Platform", company: "TCS Digital", value: 920000, probability: 71, stage: "Qualified", priority: "High", owner: "KP", ownerColor: "bg-blue-400" },
  { id: 4, name: "ERP Integration", company: "L&T Infotech", value: 740000, probability: 55, stage: "Qualified", priority: "Medium", owner: "RS", ownerColor: "bg-emerald-400" },
  // Proposal
  { id: 5, name: "Cloud Migration Suite", company: "Wipro Cloud", value: 780000, probability: 55, stage: "Proposal", priority: "Medium", owner: "RS", ownerColor: "bg-emerald-400" },
  { id: 6, name: "Security Audit Bundle", company: "HCL Tech", value: 410000, probability: 40, stage: "Proposal", priority: "Medium", owner: "MK", ownerColor: "bg-amber-400" },
  { id: 7, name: "Data Warehouse Setup", company: "ICICI Bank", value: 730000, probability: 60, stage: "Proposal", priority: "High", owner: "MK", ownerColor: "bg-amber-400" },
  // Negotiation
  { id: 8, name: "Enterprise SaaS License", company: "Infosys Ltd", value: 1250000, probability: 82, stage: "Negotiation", priority: "High", owner: "MK", ownerColor: "bg-amber-400" },
  { id: 9, name: "CRM Integration Pack", company: "Zoho Corp", value: 540000, probability: 90, stage: "Negotiation", priority: "High", owner: "RS", ownerColor: "bg-emerald-400" },
  { id: 10, name: "Chatbot SaaS Bundle", company: "Airtel Business", value: 290000, probability: 75, stage: "Negotiation", priority: "Medium", owner: "KP", ownerColor: "bg-blue-400" },
  // Closed Won
  { id: 11, name: "Fleet Mgmt Suite", company: "BlueDart Express", value: 860000, probability: 100, stage: "Closed Won", priority: "High", owner: "NJ", ownerColor: "bg-rose-400" },
  { id: 12, name: "Payroll Automation", company: "Mphasis", value: 690000, probability: 100, stage: "Closed Won", priority: "Medium", owner: "KP", ownerColor: "bg-blue-400" },
];

export const dealStats = { pipelineValue: 8420000, expectedClose: 5280000, wonThisMonth: 2450000, avgDealSize: 180000 };

export const stages = ["Prospecting", "Qualified", "Proposal", "Negotiation", "Closed Won"];
export const stageColors = {
  "Prospecting": "border-blue-300",
  "Qualified": "border-teal-400",
  "Proposal": "border-violet-400",
  "Negotiation": "border-amber-400",
  "Closed Won": "border-green-400",
};

// ────────────────────────────────────
//  CLIENTS
// ────────────────────────────────────
export const clients = [
  { id: 1, company: "Infosys Ltd", city: "Hyderabad", industry: "IT Services", status: "Active", revenue: 2450000, sharePercent: 100, deals: 4, since: "Jan 2025", manager: "Meera K." },
  { id: 2, company: "TCS Digital", city: "Chennai", industry: "IT Services", status: "Active", revenue: 1820000, sharePercent: 74, deals: 3, since: "Mar 2025", manager: "Kiran P." },
  { id: 3, company: "Wipro Cloud", city: "Bengaluru", industry: "Cloud", status: "Active", revenue: 1210000, sharePercent: 49, deals: 2, since: "Jun 2025", manager: "Ravi S." },
  { id: 4, company: "Zoho Corp", city: "Chennai", industry: "SaaS", status: "Active", revenue: 940000, sharePercent: 38, deals: 2, since: "Aug 2025", manager: "Ravi S." },
  { id: 5, company: "HCL Tech", city: "Noida", industry: "IT Services", status: "On hold", revenue: 680000, sharePercent: 28, deals: 1, since: "Nov 2025", manager: "Meera K." },
  { id: 6, company: "Mphasis", city: "Bengaluru", industry: "Fintech", status: "Active", revenue: 720000, sharePercent: 29, deals: 1, since: "Dec 2025", manager: "Kiran P." },
  { id: 7, company: "BlueDart Express", city: "Mumbai", industry: "Logistics", status: "Active", revenue: 860000, sharePercent: 35, deals: 1, since: "Oct 2025", manager: "Ravi S." },
  { id: 8, company: "Airtel Business", city: "Delhi", industry: "Telecom", status: "Active", revenue: 420000, sharePercent: 17, deals: 1, since: "Feb 2026", manager: "Meera K." },
];

export const clientStats = { total: 38, active: 32, avgDealSize: 220000, churnRate: 4 };

// ────────────────────────────────────
//  DASHBOARD
// ────────────────────────────────────
export const dashboardStats = {
  totalRevenue: { value: "₹84.2L", change: "+12.4% this month", positive: true },
  openDeals: { value: "47", change: "+5 this week", positive: true },
  winRate: { value: "64%", change: "-2% vs last month", positive: false },
  activeClients: { value: "38", change: "+3 this month", positive: true },
};

export const pipeline = [
  { label: "Prospecting", count: 18, value: "₹18.2L", width: "38%", color: "bg-blue-400" },
  { label: "Qualified", count: 12, value: "₹21L", width: "44%", color: "bg-teal-400" },
  { label: "Proposal", count: 8, value: "₹19.7L", width: "41%", color: "bg-violet-400" },
  { label: "Negotiation", count: 5, value: "₹20.8L", width: "43%", color: "bg-amber-400" },
  { label: "Closed won", count: 4, value: "₹24.5L", width: "51%", color: "bg-green-500" },
];

export const recentActivity = [
  { id: 1, color: "bg-green-500", title: "Deal CRM Integration Pack moved to Negotiation", time: "2 hours ago", owner: "Ravi S." },
  { id: 2, color: "bg-blue-500", title: "Call logged with Arjun Rao — 24 min", time: "4 hours ago", owner: "Meera K." },
  { id: 3, color: "bg-amber-500", title: "Proposal sent to TCS Digital", time: "6 hours ago", owner: "Kiran P." },
  { id: 4, color: "bg-red-500", title: "Deal Legacy ERP Upgrade marked as Lost", time: "Yesterday", owner: "Ravi S." },
  { id: 5, color: "bg-violet-500", title: "New client Neel Bose added from LinkedIn", time: "Yesterday", owner: "Meera K." },
];

export const bottomStats = [
  { label: "Tasks due today", value: "8", sub: "3 overdue", subColor: "text-crm-danger" },
  { label: "Invoices outstanding", value: "₹14.6L", sub: "2 overdue", subColor: "text-crm-danger" },
  { label: "Active projects", value: "6", sub: "1 completing soon", subColor: "text-crm-success" },
];

// ────────────────────────────────────
//  PROJECTS
// ────────────────────────────────────
export const projects = [
  { id: 1, name: "CRM Portal Redesign", client: "Infosys Ltd", deadline: "30 Jun 2026", progress: 72, status: "On track", assigned: "Ravi S.", team: 4 },
  { id: 2, name: "Cloud Migration v2", client: "Wipro Cloud", deadline: "15 Jul 2026", progress: 45, status: "On track", assigned: "Meera K.", team: 3 },
  { id: 3, name: "Mobile App - Phase 2", client: "Mphasis", deadline: "20 May 2026", progress: 88, status: "On track", assigned: "Kiran P.", team: 2 },
  { id: 4, name: "Analytics Dashboard", client: "TCS Digital", deadline: "10 Apr 2026", progress: 95, status: "At risk", assigned: "Ravi S.", team: 3 },
  { id: 5, name: "Fleet Management", client: "BlueDart Express", deadline: "28 Aug 2026", progress: 28, status: "On track", assigned: "Kiran P.", team: 5 },
  { id: 6, name: "ERP Integration", client: "HCL Tech", deadline: "01 Sep 2026", progress: 12, status: "Paused", assigned: "Meera K.", team: 2 },
];

// ────────────────────────────────────
//  TASKS
// ────────────────────────────────────
export const tasks = [
  { id: 1, title: "Follow up with Arjun Rao on proposal", priority: "High", status: "Today", done: false, project: "CRM Portal" },
  { id: 2, title: "Send invoice to Wipro Cloud", priority: "Medium", status: "Overdue", done: false, project: "Cloud Migration" },
  { id: 3, title: "Review Security Audit scope", priority: "High", status: "Today", done: false, project: "Analytics Dashboard" },
  { id: 4, title: "Prepare Quarterly Business Review deck", priority: "Low", status: "Overdue", done: false, project: "—" },
  { id: 5, title: "Client meeting — TCS Digital sprint demo", priority: "High", status: "Today", done: false, project: "Analytics Dashboard" },
  { id: 6, title: "Update Kanban board for Fleet Mgmt project", priority: "Low", status: "Overdue", done: false, project: "Fleet Management" },
  { id: 7, title: "Design wireframes for CRM portal", priority: "Medium", status: "Upcoming", done: false, project: "CRM Portal" },
  { id: 8, title: "Code review — API endpoints", priority: "Medium", status: "Upcoming", done: false, project: "Cloud Migration" },
  { id: 9, title: "Draft contract for Enterprise SaaS License", priority: "High", status: "Upcoming", done: false, project: "—" },
  { id: 10, title: "Team sync-up meeting", priority: "Low", status: "Upcoming", done: true, project: "—" },
];

// ────────────────────────────────────
//  ACTIVITIES
// ────────────────────────────────────
export const activities = [
  { id: 1, type: "Call", icon: "📞", title: "Call logged with Arjun Rao — 24 min", desc: "Discussed scope and pricing for CRM integration project.", time: "2 hours ago", owner: "Meera K.", date: "today" },
  { id: 2, type: "Email", icon: "📧", title: "Proposal sent to TCS Digital", desc: "Shared v2 of analytics dashboard proposal with revised pricing.", time: "4 hours ago", owner: "Kiran P.", date: "today" },
  { id: 3, type: "Meeting", icon: "🤝", title: "Sprint demo with Wipro Cloud", desc: "Presented cloud migration progress. Client approved Phase 2.", time: "6 hours ago", owner: "Ravi S.", date: "today" },
  { id: 4, type: "Note", icon: "📝", title: "Deal update — CRM Integration Pack", desc: "Moved to Negotiation stage. Expected close by end of April.", time: "Yesterday", owner: "Ravi S.", date: "yesterday" },
  { id: 5, type: "Email", icon: "📧", title: "Invoice reminder sent to HCL Tech", desc: "Sent 2nd follow-up for overdue invoice INV-038.", time: "Yesterday", owner: "Meera K.", date: "yesterday" },
  { id: 6, type: "Call", icon: "📞", title: "Discovery call with ICICI Bank", desc: "Explored data warehouse requirements. Follow-up scheduled.", time: "Yesterday", owner: "Kiran P.", date: "yesterday" },
  { id: 7, type: "Meeting", icon: "🤝", title: "Quarterly review with Infosys Ltd", desc: "Presented Q1 results. Client renewed Enterprise SaaS License.", time: "2 days ago", owner: "Meera K.", date: "earlier" },
  { id: 8, type: "Note", icon: "📝", title: "Lost deal — Legacy ERP Upgrade", desc: "Client went with competitor due to lower pricing. Post-mortem noted.", time: "2 days ago", owner: "Ravi S.", date: "earlier" },
];

export const activityBreakdown = [
  { type: "Calls", count: 28, percent: 35, color: "bg-blue-400" },
  { type: "Emails", count: 24, percent: 30, color: "bg-amber-400" },
  { type: "Meetings", count: 18, percent: 22, color: "bg-green-400" },
  { type: "Notes", count: 10, percent: 13, color: "bg-violet-400" },
];

export const activityByOwner = [
  { name: "Meera K.", count: 32, color: "bg-amber-400" },
  { name: "Ravi S.", count: 28, color: "bg-emerald-400" },
  { name: "Kiran P.", count: 20, color: "bg-blue-400" },
];

// ────────────────────────────────────
//  INVOICES
// ────────────────────────────────────
export const invoices = [
  { id: "INV-042", client: "Infosys Ltd", amount: 1250000, status: "Paid", date: "01 Apr 2026", dueDate: "15 Apr 2026" },
  { id: "INV-041", client: "BlueDart Express", amount: 860000, status: "Paid", date: "31 Mar 2026", dueDate: "15 Apr 2026" },
  { id: "INV-040", client: "Wipro Cloud", amount: 610000, status: "Pending", date: "28 Mar 2026", dueDate: "12 Apr 2026" },
  { id: "INV-039", client: "TCS Digital", amount: 920000, status: "Pending", date: "25 Mar 2026", dueDate: "10 Apr 2026" },
  { id: "INV-038", client: "HCL Tech", amount: 410000, status: "Overdue", date: "15 Mar 2026", dueDate: "01 Apr 2026" },
  { id: "INV-037", client: "Zoho Corp", amount: 540000, status: "Paid", date: "10 Mar 2026", dueDate: "25 Mar 2026" },
  { id: "INV-036", client: "Mphasis", amount: 690000, status: "Overdue", date: "05 Mar 2026", dueDate: "20 Mar 2026" },
  { id: "INV-035", client: "Airtel Business", amount: 290000, status: "Pending", date: "01 Mar 2026", dueDate: "15 Mar 2026" },
];

export const invoiceStats = { total: 6570000, collected: 3650000, pending: 1820000, overdue: 1100000 };

// ────────────────────────────────────
//  TEAM
// ────────────────────────────────────
export const team = [
  { id: 1, name: "Meera Krishnan", initials: "MK", role: "Senior Account Manager", deals: 14, revenue: "₹24.5L", winRate: 72, color: "bg-amber-400" },
  { id: 2, name: "Ravi Shankar", initials: "RS", role: "Business Development Lead", deals: 11, revenue: "₹19.8L", winRate: 68, color: "bg-emerald-400" },
  { id: 3, name: "Kiran Patil", initials: "KP", role: "Account Executive", deals: 9, revenue: "₹15.2L", winRate: 64, color: "bg-blue-400" },
  { id: 4, name: "Neha Joshi", initials: "NJ", role: "Sales Representative", deals: 6, revenue: "₹8.6L", winRate: 58, color: "bg-rose-400" },
  { id: 5, name: "Suresh Kumar", initials: "SK", role: "Account Manager", deals: 7, revenue: "₹11.1L", winRate: 61, color: "bg-purple-400" },
];

// ────────────────────────────────────
//  NOTIFICATIONS
// ────────────────────────────────────
export const notifications = [
  { id: 1, type: "deal", title: "Deal moved to Negotiation", desc: "CRM Integration Pack — Zoho Corp", time: "2 hours ago", color: "bg-green-500" },
  { id: 2, type: "lead", title: "New lead added", desc: "Kavita Sharma from Reliance Retail", time: "4 hours ago", color: "bg-blue-500" },
  { id: 3, type: "invoice", title: "Invoice overdue", desc: "INV-038 · HCL Tech · ₹4.1L", time: "6 hours ago", color: "bg-red-500" },
  { id: 4, type: "task", title: "Task due today", desc: "Follow up with Arjun Rao on proposal", time: "8 hours ago", color: "bg-amber-500" },
  { id: 5, type: "deal", title: "Deal marked as Lost", desc: "Legacy ERP Upgrade — L&T Infotech", time: "Yesterday", color: "bg-red-500" },
  { id: 6, type: "meeting", title: "Meeting completed", desc: "Sprint demo with Wipro Cloud", time: "Yesterday", color: "bg-violet-500" },
  { id: 7, type: "lead", title: "Lead status changed", desc: "Arjun Rao moved to Hot", time: "Yesterday", color: "bg-amber-500" },
];

// ── Helpers ──
export function formatLakhs(v) {
  const n = Number(v || 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
