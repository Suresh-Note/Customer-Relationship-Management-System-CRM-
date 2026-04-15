export const LEAD_PRESETS = {
  101: {
    role: "Growth Director",
    location: "Hyderabad, TS",
    owner: "Meera K.",
    relationship: "Hot lead",
    segment: "Key account",
    zone: "Hyderabad",
    score: 82,
    tags: ["Enterprise", "CRM revamp", "Operations team", "Q2 target"],
    notes: [
      {
        title: "Buying context",
        body:
          "Northstar wants a cleaner lead-to-handover workflow before the next sales hiring cycle starts.",
      },
      {
        title: "Decision path",
        body:
          "Asha is leading evaluation and will bring operations plus finance into the final sign-off discussion.",
      },
      {
        title: "Recommended next step",
        body:
          "Share a phased rollout plan with discovery, migration, and reporting milestones for quick approval.",
      },
    ],
    activityTemplate: [
      {
        type: "Call",
        title: "Call — discovery",
        summary:
          "Walked through existing lead routing pain points and current follow-up gaps across sales and support.",
        offsetDays: 2,
      },
      {
        type: "Proposal",
        title: "Proposal sent",
        summary:
          "Shared implementation outline with scoped CRM revamp options and suggested rollout phases.",
        offsetDays: 1,
      },
      {
        type: "Meeting",
        title: "Meeting — workflow review",
        summary:
          "Reviewed pipeline stages, owner visibility, and dashboard expectations for the management team.",
        offsetDays: 0,
      },
    ],
  },
  102: {
    role: "Operations Head",
    location: "Bengaluru, KA",
    owner: "Ravi S.",
    relationship: "Warm lead",
    segment: "Automation fit",
    zone: "Bengaluru",
    score: 88,
    tags: ["AI workflows", "Fast-moving", "Referral", "Budget approved"],
    notes: [
      {
        title: "Buying context",
        body:
          "Brightworks wants to automate handoffs between inbound requests, onboarding, and reporting teams.",
      },
      {
        title: "Decision path",
        body:
          "Rohan has budget support and is comparing timeline, security review effort, and implementation speed.",
      },
      {
        title: "Recommended next step",
        body:
          "Anchor the proposal around automation coverage, internal ownership, and phased success metrics.",
      },
    ],
    activityTemplate: [
      {
        type: "Email",
        title: "Estimate revised",
        summary:
          "Sent a tighter scope with phased automation rollout and API handoff coverage for Brightworks.",
        offsetDays: 2,
      },
      {
        type: "Meeting",
        title: "Meeting — solution fit",
        summary:
          "Aligned on automation priorities, reporting cadence, and internal team responsibilities.",
        offsetDays: 0,
      },
    ],
  },
  103: {
    role: "CX Manager",
    location: "Mumbai, MH",
    owner: "Meera K.",
    relationship: "Nurture lead",
    segment: "Retail account",
    zone: "Mumbai",
    score: 73,
    tags: ["Service desk", "Retail", "LinkedIn", "Support ops"],
  },
  104: {
    role: "VP Sales",
    location: "Pune, MH",
    owner: "Arun P.",
    relationship: "Priority lead",
    segment: "Field sales",
    zone: "Pune",
    score: 91,
    tags: ["Proposal stage", "Enterprise", "On-site teams", "Regional rollout"],
  },
  105: {
    role: "Strategy Lead",
    location: "Kochi, KL",
    owner: "Neha D.",
    relationship: "Won account",
    segment: "Expansion",
    zone: "Kochi",
    score: 96,
    tags: ["Analytics", "Expansion", "Client handoff", "Healthtech"],
  },
  106: {
    role: "Procurement Lead",
    location: "Ahmedabad, GJ",
    owner: "Ravi S.",
    relationship: "Cold lead",
    segment: "Ops dashboard",
    zone: "Ahmedabad",
    score: 34,
    tags: ["Cold outreach", "Textile", "Long cycle", "Needs follow-up"],
  },
};

export const CLIENT_PRESETS = {
  301: {
    industry: "Logistics tech",
    location: "Hyderabad, TS",
    owner: "Meera K.",
    accountType: "Strategic account",
    segment: "Enterprise",
    tags: ["Renewal watch", "High touch", "Operations", "Quarterly review"],
  },
  302: {
    industry: "Automation",
    location: "Bengaluru, KA",
    owner: "Ravi S.",
    accountType: "Growth account",
    segment: "Automation",
    tags: ["Expansion", "AI workflows", "Fast mover", "Pilot-ready"],
  },
  303: {
    industry: "Healthtech",
    location: "Kochi, KL",
    owner: "Neha D.",
    accountType: "Live client",
    segment: "Analytics",
    tags: ["Milestone billing", "Delivery", "Executive sponsor", "Upsell"],
  },
  304: {
    industry: "Infrastructure",
    location: "Pune, MH",
    owner: "Arun P.",
    accountType: "Enterprise account",
    segment: "Field sales",
    tags: ["Procurement", "Regional rollout", "Field teams", "Priority"],
  },
};

export const TEAM_PRESETS = {
  "Meera K.": {
    role: "Account Executive",
    location: "Hyderabad, TS",
    focus: "Enterprise accounts",
    team: "Revenue",
    tags: ["Discovery", "Commercials", "Forecasting", "Stakeholder mgmt"],
  },
  "Ravi S.": {
    role: "Solutions Engineer",
    location: "Bengaluru, KA",
    focus: "Automation design",
    team: "Solutions",
    tags: ["Solution fit", "Integrations", "Demo support", "Scoping"],
  },
  "Arun P.": {
    role: "Regional Sales Lead",
    location: "Pune, MH",
    focus: "Field sales programs",
    team: "Revenue",
    tags: ["Enterprise", "Pipeline", "Team coaching", "Forecast calls"],
  },
  "Neha D.": {
    role: "Delivery Manager",
    location: "Kochi, KL",
    focus: "Launch readiness",
    team: "Delivery",
    tags: ["Delivery", "Milestones", "Client handoff", "Reporting"],
  },
  Maya: {
    role: "Customer Success Manager",
    location: "Chennai, TN",
    focus: "Procurement follow-ups",
    team: "Success",
    tags: ["Follow-ups", "Renewals", "Adoption", "Escalations"],
  },
  Amit: {
    role: "Implementation Specialist",
    location: "Delhi, DL",
    focus: "Requirements gathering",
    team: "Delivery",
    tags: ["Discovery", "Documentation", "Workshops", "Ops"],
  },
};

const TYPE_TONE = {
  Call: "blue",
  Email: "mint",
  Meeting: "violet",
  Proposal: "amber",
  Invoice: "amber",
  Created: "amber",
  Default: "blue",
};

const STAGE_TONE = {
  Discovery: "blue",
  Proposal: "violet",
  "Proposal Sent": "violet",
  Negotiation: "amber",
  "Contract Review": "mint",
  Won: "mint",
  Closed: "mint",
  Lost: "rose",
};

const STATUS_TONE = {
  New: "blue",
  Contacted: "warm",
  Qualified: "mint",
  Proposal: "violet",
  Closed: "mint",
  Lost: "rose",
  Open: "blue",
  Waiting: "amber",
  Done: "mint",
  "In Progress": "violet",
  Paid: "mint",
  Pending: "amber",
  Overdue: "rose",
  Kickoff: "blue",
  Scoping: "violet",
  "In Delivery": "mint",
};

const PRIORITY_TONE = {
  High: "rose",
  Medium: "amber",
  Low: "blue",
};

export function formatDate(value) {
  if (!value) {
    return "Not added";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length !== 10) {
    return phone || "Not available";
  }

  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function formatCurrency(value) {
  const amount = Number(value || 0);

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1).replace(".0", "")}Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1).replace(".0", "")}L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1).replace(".0", "")}K`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatCountLabel(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function getInitials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function slugifyName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function shiftDate(value, offsetDays) {
  const baseDate = value ? new Date(value) : new Date();
  const nextDate = new Date(baseDate.getTime() + offsetDays * 86400000);

  return nextDate.toISOString();
}

export function padInvoiceId(id) {
  return `INV-${String(id).padStart(4, "0")}`;
}

export function stageTone(stage) {
  return STAGE_TONE[stage] || "violet";
}

export function statusTone(status) {
  return STATUS_TONE[status] || "blue";
}

export function priorityTone(priority) {
  return PRIORITY_TONE[priority] || "amber";
}

export function typeTone(type) {
  return TYPE_TONE[type] || TYPE_TONE.Default;
}

export function computeLeadScore(lead) {
  const statusScore = {
    New: 72,
    Contacted: 76,
    Qualified: 85,
    Proposal: 91,
    Closed: 98,
    Lost: 28,
  };
  const sourceBoost = {
    Referral: 6,
    Website: 4,
    LinkedIn: 3,
    Event: 5,
    "Email Campaign": 1,
    "Cold Outreach": -6,
  };

  return Math.max(
    20,
    Math.min(99, (statusScore[lead?.status] ?? 70) + (sourceBoost[lead?.source] ?? 0))
  );
}

export function getLeadProfile(lead) {
  const preset = LEAD_PRESETS[lead?.lead_id] || {};
  const zone = preset.zone || preset.location?.split(",")[0] || "India";

  return {
    role: preset.role || "Business lead",
    location: preset.location || "India",
    owner: preset.owner || "Sales team",
    relationship: preset.relationship || "Active lead",
    segment: preset.segment || (lead?.service_interest || "Growth project"),
    zone,
    score: preset.score || computeLeadScore(lead),
    tags:
      preset.tags || [lead?.service_interest || "CRM", lead?.source || "Inbound", "Follow-up"],
    notes:
      preset.notes || [
        {
          title: "Buying context",
          body: `${lead?.name || "This contact"} is exploring ${lead?.service_interest || "a CRM project"} for ${lead?.company || "their company"}.`,
        },
        {
          title: "Decision path",
          body: `The opportunity came through ${lead?.source || "a direct outreach"} and still needs deeper qualification around scope and timing.`,
        },
        {
          title: "Recommended next step",
          body: "Schedule a focused discovery call, confirm ownership, and turn the next discussion into a proposal checkpoint.",
        },
      ],
    activityTemplate: preset.activityTemplate || [],
    linkedIn: `linkedin.com/in/${slugifyName(lead?.name) || "crm-contact"}`,
  };
}

export function buildTimelineItem(item) {
  return {
    id: item.id,
    tone: item.tone || typeTone(item.type),
    title: item.title,
    summary: item.summary,
    date: formatDate(item.createdAt),
    owner: item.owner || "CRM",
  };
}

export function buildRows(items, mapRow) {
  return items.map((item, index) => ({
    id: item.id || index,
    ...mapRow(item, index),
  }));
}

export function findLeadForClient(client, data) {
  return (
    data.leads.find((lead) => lead.email && lead.email === client.email) ||
    data.leads.find((lead) => lead.company && lead.company === client.company_name) ||
    data.leads.find((lead) => lead.name && lead.name === client.contact_person) ||
    null
  );
}

export function getClientProfile(client, lead) {
  const preset = CLIENT_PRESETS[client.client_id] || {};
  const location = preset.location || (lead ? getLeadProfile(lead).location : "India");

  return {
    industry: preset.industry || "Business account",
    location,
    owner: preset.owner || (lead ? getLeadProfile(lead).owner : "Customer success"),
    accountType: preset.accountType || "Active account",
    segment: preset.segment || "Retention",
    tags:
      preset.tags || [preset.industry || "Business", "Client success", "Quarterly review"],
  };
}

export function getInvoiceDates(invoice, index = 0) {
  const issuedAt = shiftDate(`2026-03-01T09:00:00.000Z`, index * 4);
  const dueAt = shiftDate(issuedAt, 12);

  return {
    issuedAt,
    dueAt,
  };
}

export function buildLeadTimeline(lead, profile, activities, deals) {
  const activityItems = (activities || []).map((activity) => ({
    id: `activity-${activity.activity_id}`,
    type: activity.type || "Default",
    title:
      activity.type === "Call"
        ? "Call — discovery"
        : activity.type === "Meeting"
          ? "Meeting — review"
          : activity.type === "Email"
            ? "Email follow-up"
            : `${activity.type || "Activity"} update`,
    summary: activity.notes,
    createdAt: activity.created_at,
    owner: profile.owner,
  }));

  const templateItems = (profile.activityTemplate || []).map((item, index) => ({
    id: `template-${lead.lead_id}-${index}`,
    type: item.type || "Default",
    title: item.title,
    summary: item.summary,
    createdAt: shiftDate(lead.created_at, item.offsetDays ?? index),
    owner: item.owner || profile.owner,
  }));

  const createdItem = {
    id: `created-${lead.lead_id}`,
    type: "Created",
    title: "Contact created",
    summary: `Added from ${lead.source || "inbound"} for ${lead.company || "the account"} and assigned to ${profile.owner}.`,
    createdAt: lead.created_at,
    owner: profile.owner,
  };

  const dealItem =
    deals[0] &&
    ({
      id: `deal-${deals[0].deal_id}`,
      type: deals[0].stage === "Negotiation" ? "Proposal" : "Meeting",
      title: deals[0].stage === "Negotiation" ? "Proposal sent" : `${deals[0].stage} update`,
      summary: `${deals[0].deal_name} is now in ${String(deals[0].stage).toLowerCase()} for ${lead.company}.`,
      createdAt: shiftDate(lead.created_at, 1),
      owner: profile.owner,
    });

  return [...activityItems, ...templateItems, createdItem, dealItem]
    .filter(Boolean)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 5)
    .map(buildTimelineItem);
}

export function buildLeadRows(deals, lead) {
  return buildRows(deals, (deal) => ({
    title: deal.deal_name,
    subtitle: `${lead.service_interest || "CRM"} · Expected review by ${formatDate(shiftDate(lead.created_at, 14))}`,
    pill: { label: deal.stage, tone: stageTone(deal.stage) },
    value: formatCurrency(deal.value),
  }));
}

export function getProjectTasks(project, index, tasks) {
  const directlyLinked = tasks.filter(
    (task) => task.project_id && String(task.project_id) === String(project.project_id)
  );

  if (directlyLinked.length) {
    return directlyLinked;
  }

  return tasks.filter(
    (_, taskIndex) =>
      taskIndex % Math.max(1, tasks.length > 2 ? 3 : 2) ===
      index % Math.max(1, tasks.length > 2 ? 3 : 2)
  );
}

export function getTaskPriority(task, index) {
  if (task.priority) {
    return task.priority;
  }

  const sequence = ["High", "Medium", "Medium", "Low"];
  return sequence[index % sequence.length];
}

export function getTaskProject(task, index, data) {
  if (task.project_id) {
    return data.projects.find((project) => String(project.project_id) === String(task.project_id));
  }

  return data.projects[index % Math.max(1, data.projects.length)] || null;
}

export function buildTeamMembers(data) {
  const owners = data.leads.map((lead) => getLeadProfile(lead).owner);
  const assignees = data.tasks.map((task) => task.assigned_to).filter(Boolean);
  const uniqueNames = [...new Set([...owners, ...assignees])];

  return uniqueNames.map((name, index) => {
    const preset = TEAM_PRESETS[name] || {
      role: "CRM teammate",
      location: "India",
      focus: "Pipeline support",
      team: "CRM",
      tags: ["Support", "Coordination", "Follow-ups"],
    };
    const ownedLeads = data.leads.filter((lead) => getLeadProfile(lead).owner === name);
    const ownedDeals = data.deals.filter((deal) =>
      ownedLeads.some((lead) => String(lead.lead_id) === String(deal.lead_id))
    );
    const assignedTasks = data.tasks.filter((task) => task.assigned_to === name);
    const capacityScore = Math.max(
      24,
      Math.min(97, 92 - assignedTasks.length * 9 - ownedDeals.length * 4)
    );

    return {
      id: `${name}-${index}`,
      name,
      ...preset,
      ownedLeads,
      ownedDeals,
      assignedTasks,
      capacityScore,
    };
  });
}
