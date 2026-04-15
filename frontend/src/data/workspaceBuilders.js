import {
  buildLeadRows,
  buildLeadTimeline,
  buildRows,
  buildTimelineItem,
  computeLeadScore,
  findLeadForClient,
  formatCountLabel,
  formatCurrency,
  formatDate,
  formatPhone,
  getClientProfile,
  getInitials,
  getInvoiceDates,
  getLeadProfile,
  getProjectTasks,
  getTaskPriority,
  getTaskProject,
  padInvoiceId,
  buildTeamMembers,
  priorityTone,
  shiftDate,
  stageTone,
  statusTone,
  typeTone,
} from "./workspaceUtils";

function buildDashboardWorkspace(data, apiStatus, usingFallback) {
  const pipelineValue = data.deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
  const openTasks = data.tasks.filter((task) => task.status !== "Done");
  const teamMembers = buildTeamMembers(data);
  const topDeals = data.deals
    .slice()
    .sort((left, right) => Number(right.value || 0) - Number(left.value || 0))
    .slice(0, 3);

  return {
    eyebrow: "Dashboard Workspace",
    title: "CRM overview",
    description:
      "A shared workspace view of pipeline, accounts, delivery, and team health in the same UI style.",
    meta: [
      formatCountLabel(data.leads.length, "lead"),
      usingFallback ? "Sample data" : "Live data",
      apiStatus === "online" ? "API online" : "Syncing locally",
    ],
    items: [
      {
        id: "pipeline",
        directory: {
          avatar: "PL",
          title: "Pipeline",
          meta: `${data.leads.length} leads · ${data.deals.length} deals`,
        },
        profile: {
          avatar: "PL",
          title: "Pipeline overview",
          subtitle: "Leads, deals, and revenue motion",
          pills: [
            { label: "Revenue", tone: "warm" },
            { label: "Active pipeline", tone: "violet" },
            { label: "Today", tone: "mint" },
          ],
          details: [
            { label: "Leads", value: String(data.leads.length) },
            { label: "Deals", value: String(data.deals.length) },
            { label: "Value", value: formatCurrency(pipelineValue) },
            {
              label: "Qualified",
              value: String(data.leads.filter((lead) => lead.status === "Qualified").length),
            },
            { label: "Source", value: data.leads[0]?.source || "Inbound" },
            { label: "Owner", value: "Revenue team" },
            { label: "Focus", value: "Lead conversion" },
          ],
          scoreLabel: "Pipeline health",
          score: 84,
          tags: ["Forecasting", "Pipeline", "New business", "Daily review"],
        },
        tabs: [
          {
            key: "activity",
            label: "Activity",
            kind: "timeline",
            items: data.activities.slice(0, 4).map((activity) => {
              const lead = data.leads.find(
                (item) => String(item.lead_id) === String(activity.lead_id)
              );

              return buildTimelineItem({
                id: `dashboard-activity-${activity.activity_id}`,
                type: activity.type,
                title: `${activity.type} logged`,
                summary: activity.notes,
                createdAt: activity.created_at,
                owner: lead ? getLeadProfile(lead).owner : "Revenue team",
              });
            }),
          },
          {
            key: "notes",
            label: "Notes",
            kind: "cards",
            items: [
              {
                id: "dashboard-note-1",
                title: "Conversion summary",
                body: `${data.leads.filter((lead) => lead.status === "Qualified").length} lead(s) are already qualified and ${data.deals.length} deal(s) are active in pipeline.`,
              },
              {
                id: "dashboard-note-2",
                title: "Revenue signal",
                body: `Current weighted pipeline is anchored by ${topDeals[0]?.deal_name || "your largest opportunity"}.`,
              },
              {
                id: "dashboard-note-3",
                title: "Recommended next step",
                body: "Use the next review to focus on qualified leads and keep negotiation-stage deals moving.",
              },
            ],
          },
          {
            key: "deals",
            label: "Deals",
            kind: "rows",
            items: buildRows(topDeals, (deal) => ({
              title: deal.deal_name,
              subtitle: `${deal.stage} · Revenue opportunity`,
              pill: { label: deal.stage, tone: stageTone(deal.stage) },
              value: formatCurrency(deal.value),
            })),
          },
        ],
        bottomSection: {
          title: `Open deals (${topDeals.length})`,
          buttonLabel: "+ New deal",
          items: buildRows(topDeals, (deal) => ({
            title: deal.deal_name,
            subtitle: `${deal.stage} · Top pipeline item`,
            pill: { label: deal.stage, tone: stageTone(deal.stage) },
            value: formatCurrency(deal.value),
          })),
        },
      },
      {
        id: "accounts",
        directory: {
          avatar: "AC",
          title: "Accounts",
          meta: `${data.clients.length} clients · ${data.projects.length} projects`,
        },
        profile: {
          avatar: "AC",
          title: "Accounts overview",
          subtitle: "Clients, projects, and billing status",
          pills: [
            { label: "Clients", tone: "warm" },
            { label: "Delivery", tone: "violet" },
            { label: "Billing", tone: "mint" },
          ],
          details: [
            { label: "Clients", value: String(data.clients.length) },
            { label: "Projects", value: String(data.projects.length) },
            { label: "Invoices", value: String(data.invoices.length) },
            {
              label: "Paid",
              value: String(data.invoices.filter((invoice) => invoice.status === "Paid").length),
            },
            { label: "Top account", value: data.clients[0]?.company_name || "Client" },
            { label: "Owner", value: "Customer success" },
            { label: "Focus", value: "Retention + delivery" },
          ],
          scoreLabel: "Account health",
          score: 79,
          tags: ["Retention", "Milestones", "Billing", "Quarterly review"],
        },
        tabs: [
          {
            key: "activity",
            label: "Activity",
            kind: "timeline",
            items: data.projects.slice(0, 3).map((project, index) =>
              buildTimelineItem({
                id: `dashboard-project-${project.project_id}`,
                type: "Meeting",
                title: "Project checkpoint",
                summary: `${project.project_name} is in ${String(project.status).toLowerCase()}.`,
                createdAt: shiftDate("2026-04-01T09:00:00.000Z", index),
                owner: "Delivery team",
              })
            ),
          },
          {
            key: "notes",
            label: "Notes",
            kind: "cards",
            items: [
              {
                id: "dashboard-account-note-1",
                title: "Delivery summary",
                body: `${data.projects.filter((project) => project.status === "In Delivery").length} project(s) are in active delivery.`,
              },
              {
                id: "dashboard-account-note-2",
                title: "Billing signal",
                body: `${data.invoices.filter((invoice) => invoice.status !== "Paid").length} invoice(s) still need follow-up.`,
              },
              {
                id: "dashboard-account-note-3",
                title: "Recommended next step",
                body: "Use client review calls to align billing, delivery scope, and expansion planning together.",
              },
            ],
          },
          {
            key: "projects",
            label: "Projects",
            kind: "rows",
            items: buildRows(data.projects.slice(0, 3), (project) => ({
              title: project.project_name,
              subtitle: `${project.service_type} · ${project.status}`,
              pill: { label: project.status, tone: statusTone(project.status) },
              value: project.service_type,
            })),
          },
        ],
        bottomSection: {
          title: `Invoices (${data.invoices.length})`,
          buttonLabel: "+ New invoice",
          items: buildRows(data.invoices.slice(0, 3), (invoice, index) => ({
            title: padInvoiceId(invoice.invoice_id),
            subtitle: `${invoice.status} · ${formatDate(getInvoiceDates(invoice, index).issuedAt)}`,
            pill: { label: invoice.status, tone: statusTone(invoice.status) },
            value: formatCurrency(invoice.amount),
          })),
        },
      },
      {
        id: "delivery",
        directory: {
          avatar: "DL",
          title: "Delivery",
          meta: `${openTasks.length} open tasks · ${teamMembers.length} members`,
        },
        profile: {
          avatar: "DL",
          title: "Delivery overview",
          subtitle: "Execution readiness and team workload",
          pills: [
            { label: "Tasks", tone: "warm" },
            { label: "Team", tone: "violet" },
            { label: "Delivery", tone: "mint" },
          ],
          details: [
            { label: "Open tasks", value: String(openTasks.length) },
            { label: "Done tasks", value: String(data.tasks.filter((task) => task.status === "Done").length) },
            { label: "Projects", value: String(data.projects.length) },
            { label: "Members", value: String(teamMembers.length) },
            { label: "Top owner", value: teamMembers[0]?.name || "CRM team" },
            { label: "Owner", value: "Delivery lead" },
            { label: "Focus", value: "Execution" },
          ],
          scoreLabel: "Delivery readiness",
          score: 76,
          tags: ["Execution", "Checkpoints", "Owners", "Handoffs"],
        },
        tabs: [
          {
            key: "activity",
            label: "Activity",
            kind: "timeline",
            items: data.tasks.slice(0, 4).map((task, index) =>
              buildTimelineItem({
                id: `dashboard-task-${task.task_id}`,
                type: task.status === "Done" ? "Meeting" : "Call",
                title: "Task update",
                summary: `${task.task_name} is ${String(task.status).toLowerCase()}.`,
                createdAt: shiftDate("2026-04-02T09:00:00.000Z", index),
                owner: task.assigned_to || "CRM",
              })
            ),
          },
          {
            key: "notes",
            label: "Notes",
            kind: "cards",
            items: [
              {
                id: "dashboard-delivery-note-1",
                title: "Execution summary",
                body: `${openTasks.length} open task(s) currently support delivery and operational follow-up.`,
              },
              {
                id: "dashboard-delivery-note-2",
                title: "Team signal",
                body: `${teamMembers.filter((member) => member.capacityScore < 50).length} teammate(s) are near capacity and may need load balancing.`,
              },
              {
                id: "dashboard-delivery-note-3",
                title: "Recommended next step",
                body: "Rebalance overdue follow-ups first, then use project checkpoints to keep delivery predictable.",
              },
            ],
          },
          {
            key: "tasks",
            label: "Tasks",
            kind: "rows",
            items: buildRows(openTasks.slice(0, 3), (task) => ({
              title: task.task_name,
              subtitle: `${task.assigned_to || "Owner"} · ${task.status}`,
              pill: { label: task.status, tone: statusTone(task.status) },
              value: task.assigned_to || "CRM",
            })),
          },
        ],
        bottomSection: {
          title: `Team queue (${teamMembers.length})`,
          buttonLabel: "+ Assign task",
          items: buildRows(teamMembers.slice(0, 3), (member) => ({
            title: member.name,
            subtitle: `${member.role} · ${member.assignedTasks.length} tasks`,
            pill: {
              label: `${member.capacityScore}%`,
              tone: member.capacityScore < 50 ? "rose" : "mint",
            },
            value: member.focus,
          })),
        },
      },
    ],
  };
}

function buildLeadWorkspace(data, apiStatus, usingFallback) {
  const items = data.leads.map((lead) => {
    const profile = getLeadProfile(lead);
    const deals = data.deals.filter((deal) => String(deal.lead_id) === String(lead.lead_id));
    const activities = data.activities.filter(
      (activity) => String(activity.lead_id) === String(lead.lead_id)
    );
    const dealRows = buildLeadRows(deals, lead);

    return {
      id: lead.lead_id,
      directory: {
        avatar: getInitials(lead.name),
        title: lead.name,
        meta: `${lead.company} · ${profile.zone}`,
      },
      profile: {
        avatar: getInitials(lead.name),
        title: lead.name,
        subtitle: `${profile.role} · ${lead.company}, ${profile.zone}`,
        pills: [
          { label: profile.relationship, tone: "warm" },
          { label: profile.segment, tone: "violet" },
          { label: profile.zone, tone: "mint" },
        ],
        details: [
          { label: "Email", value: lead.email },
          { label: "Phone", value: formatPhone(lead.phone) },
          { label: "LinkedIn", value: profile.linkedIn },
          { label: "Location", value: profile.location },
          { label: "Source", value: lead.source || "Inbound" },
          { label: "Owner", value: profile.owner },
          { label: "Added", value: formatDate(lead.created_at) },
        ],
        scoreLabel: "Lead score",
        score: profile.score,
        tags: profile.tags,
      },
      tabs: [
        {
          key: "activity",
          label: "Activity",
          kind: "timeline",
          items: buildLeadTimeline(lead, profile, activities, deals),
        },
        {
          key: "notes",
          label: "Notes",
          kind: "cards",
          items: profile.notes.map((note, index) => ({
            id: `${lead.lead_id}-note-${index}`,
            ...note,
          })),
        },
        {
          key: "deals",
          label: "Deals",
          kind: "rows",
          items: dealRows,
          emptyTitle: "No open deals yet",
          emptyBody: "Use this section to add proposals and track stage movement.",
        },
      ],
      bottomSection: {
        title: `Open deals (${deals.length})`,
        buttonLabel: "+ Add deal",
        items: dealRows,
        emptyTitle: "No deals linked",
        emptyBody: "Once a proposal is created, it will appear here with stage and value.",
      },
    };
  });

  return {
    eyebrow: "Lead Workspace",
    title: "Lead profile",
    description:
      "View contact details, notes, and deal activity in the same clean profile layout.",
    meta: [
      formatCountLabel(data.leads.length, "lead"),
      usingFallback ? "Sample data" : "Live data",
      apiStatus === "online" ? "API online" : "Syncing locally",
    ],
    items,
  };
}

function buildActivitiesWorkspace(data, apiStatus, usingFallback) {
  const items = data.activities
    .slice()
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .map((activity) => {
      const lead = data.leads.find((item) => String(item.lead_id) === String(activity.lead_id));
      const leadProfile = lead ? getLeadProfile(lead) : null;
      const deals = lead
        ? data.deals.filter((deal) => String(deal.lead_id) === String(lead.lead_id))
        : [];
      const relatedActivities = lead
        ? data.activities.filter((item) => String(item.lead_id) === String(lead.lead_id))
        : [activity];

      return {
        id: activity.activity_id,
        directory: {
          avatar: getInitials(activity.type),
          title: activity.type,
          meta: `${lead?.company || "CRM"} · ${formatDate(activity.created_at)}`,
        },
        profile: {
          avatar: getInitials(activity.type),
          title: `${activity.type} update`,
          subtitle: lead ? `${lead.name} · ${lead.company}` : "CRM activity record",
          pills: [
            { label: activity.type, tone: typeTone(activity.type) },
            { label: lead?.status || "Open", tone: statusTone(lead?.status || "Open") },
            { label: leadProfile?.zone || "CRM", tone: "mint" },
          ],
          details: [
            { label: "Contact", value: lead?.name || "Unassigned" },
            { label: "Company", value: lead?.company || "CRM workspace" },
            { label: "Logged", value: formatDate(activity.created_at) },
            { label: "Owner", value: leadProfile?.owner || "Revenue team" },
            { label: "Source", value: lead?.source || "Manual update" },
            { label: "Service", value: lead?.service_interest || "General activity" },
            { label: "Next step", value: deals[0]?.stage || "Follow-up review" },
          ],
          scoreLabel: "Engagement",
          score: Math.min(96, Math.max(48, (lead ? computeLeadScore(lead) : 64) + 4)),
          tags: [
            activity.type,
            lead?.source || "Manual log",
            lead?.service_interest || "CRM",
            lead?.status || "Open",
          ],
        },
        tabs: [
          {
            key: "activity",
            label: "Activity",
            kind: "timeline",
            items: relatedActivities
              .slice()
              .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
              .map((item) =>
                buildTimelineItem({
                  id: item.activity_id,
                  type: item.type,
                  title:
                    item.type === "Call"
                      ? "Call update"
                      : item.type === "Meeting"
                        ? "Meeting update"
                        : `${item.type} logged`,
                  summary: item.notes,
                  createdAt: item.created_at,
                  owner: leadProfile?.owner || "CRM",
                })
              ),
          },
          {
            key: "notes",
            label: "Notes",
            kind: "cards",
            items: [
              {
                id: `${activity.activity_id}-note-1`,
                title: "Activity summary",
                body: activity.notes || "Latest activity captured in CRM.",
              },
              {
                id: `${activity.activity_id}-note-2`,
                title: "Context",
                body: lead
                  ? `${lead.name} from ${lead.company} is currently in ${String(lead.status || "New").toLowerCase()} lead status.`
                  : "This activity is not linked to a contact yet.",
              },
              {
                id: `${activity.activity_id}-note-3`,
                title: "Recommended next step",
                body: deals.length
                  ? `Follow up on ${deals[0].deal_name} and confirm the next milestone with ${leadProfile?.owner || "the team"}.`
                  : "Capture a clear follow-up owner and convert the next update into a tracked opportunity.",
              },
            ],
          },
          {
            key: "deals",
            label: "Deals",
            kind: "rows",
            items: buildRows(deals, (deal) => ({
              title: deal.deal_name,
              subtitle: `${lead?.company || "Account"} · ${deal.stage}`,
              pill: { label: deal.stage, tone: stageTone(deal.stage) },
              value: formatCurrency(deal.value),
            })),
            emptyTitle: "No linked deals",
            emptyBody: "This activity can be connected to a deal once the opportunity is qualified.",
          },
        ],
        bottomSection: {
          title: `Related actions (${relatedActivities.length})`,
          buttonLabel: "+ Log activity",
          items: relatedActivities.map((item) => ({
            id: `related-${item.activity_id}`,
            title: item.type,
            subtitle: item.notes,
            pill: { label: formatDate(item.created_at), tone: "blue" },
            value: leadProfile?.owner || "CRM",
          })),
          emptyTitle: "No related actions",
          emptyBody: "Linked follow-up steps will appear here.",
        },
      };
    });

  return {
    eyebrow: "Activity Workspace",
    title: "Recent activity",
    description:
      "Track outreach, meetings, and follow-up history in the same card-based layout.",
    meta: [
      formatCountLabel(data.activities.length, "activity", "activities"),
      usingFallback ? "Sample data" : "Live data",
      apiStatus === "online" ? "API online" : "Syncing locally",
    ],
    items,
  };
}

function buildClientsWorkspace(data, apiStatus, usingFallback) {
  const items = data.clients.map((client, index) => {
    const lead = findLeadForClient(client, data);
    const clientProfile = getClientProfile(client, lead);
    const clientProjects = data.projects.filter(
      (project) => String(project.client_id) === String(client.client_id)
    );
    const invoiceRows = data.invoices
      .filter((invoice) =>
        clientProjects.some((project) => String(project.project_id) === String(invoice.project_id))
      )
      .map((invoice, invoiceIndex) => {
        const dates = getInvoiceDates(invoice, invoiceIndex);

        return {
          id: invoice.invoice_id,
          title: padInvoiceId(invoice.invoice_id),
          subtitle: `${formatDate(dates.issuedAt)} · Due ${formatDate(dates.dueAt)}`,
          pill: { label: invoice.status || "Pending", tone: statusTone(invoice.status || "Pending") },
          value: formatCurrency(invoice.amount),
        };
      });
    const leadActivities = lead
      ? data.activities.filter((activity) => String(activity.lead_id) === String(lead.lead_id))
      : [];
    const healthBase = invoiceRows.length
      ? Math.round(
          72 +
            invoiceRows.filter((invoice) => invoice.pill.label === "Paid").length * 10 -
            invoiceRows.filter((invoice) => invoice.pill.label === "Overdue").length * 18
        )
      : 74;
    const healthScore = Math.max(32, Math.min(98, healthBase));

    return {
      id: client.client_id,
      directory: {
        avatar: getInitials(client.company_name),
        title: client.company_name,
        meta: `${client.contact_person} · ${clientProfile.location.split(",")[0]}`,
      },
      profile: {
        avatar: getInitials(client.company_name),
        title: client.company_name,
        subtitle: `${clientProfile.industry} · ${client.contact_person}, ${clientProfile.location.split(",")[0]}`,
        pills: [
          { label: clientProfile.accountType, tone: "warm" },
          { label: clientProfile.segment, tone: "violet" },
          { label: clientProfile.location.split(",")[0], tone: "mint" },
        ],
        details: [
          { label: "Contact", value: client.contact_person },
          { label: "Email", value: client.email },
          { label: "Phone", value: formatPhone(client.phone) },
          { label: "Industry", value: clientProfile.industry },
          { label: "Location", value: clientProfile.location },
          { label: "Owner", value: clientProfile.owner },
          { label: "Projects", value: String(clientProjects.length) },
        ],
        scoreLabel: "Health score",
        score: healthScore,
        tags: clientProfile.tags,
      },
      tabs: [
        {
          key: "activity",
          label: "Activity",
          kind: "timeline",
          items: (leadActivities.length
            ? leadActivities
            : [
                {
                  created_at: shiftDate("2026-03-18T09:00:00.000Z", index),
                  type: "Meeting",
                  notes: "Account review captured in CRM.",
                },
              ]
          ).map((activity, activityIndex) =>
            buildTimelineItem({
              id: `${client.client_id}-activity-${activity.activity_id || activityIndex}`,
              type: activity.type,
              title: `${activity.type || "Activity"} logged`,
              summary: activity.notes,
              createdAt: activity.created_at,
              owner: clientProfile.owner,
            })
          ),
        },
        {
          key: "notes",
          label: "Notes",
          kind: "cards",
          items: [
            {
              id: `${client.client_id}-note-1`,
              title: "Account context",
              body: `${client.company_name} is being managed by ${clientProfile.owner} with ${clientProjects.length} active project touchpoint(s).`,
            },
            {
              id: `${client.client_id}-note-2`,
              title: "Relationship focus",
              body: `Keep ${client.contact_person} updated on delivery milestones, invoice timing, and stakeholder alignment.`,
            },
            {
              id: `${client.client_id}-note-3`,
              title: "Recommended next step",
              body: invoiceRows.some((invoice) => invoice.pill.label === "Overdue")
                ? "Prioritize the overdue billing conversation before opening the next scope discussion."
                : "Use the next review to position expansion work tied to the current delivery progress.",
            },
          ],
        },
        {
          key: "projects",
          label: "Projects",
          kind: "rows",
          items: buildRows(clientProjects, (project) => ({
            title: project.project_name,
            subtitle: `${project.service_type} · ${project.status}`,
            pill: { label: project.status, tone: statusTone(project.status) },
            value: project.service_type,
          })),
          emptyTitle: "No projects yet",
          emptyBody: "Projects linked to this account will appear here.",
        },
      ],
      bottomSection: {
        title: `Invoices (${invoiceRows.length})`,
        buttonLabel: "+ New invoice",
        items: invoiceRows,
        emptyTitle: "No invoices yet",
        emptyBody: "Billing records for this client will appear here.",
      },
    };
  });

  return {
    eyebrow: "Client Workspace",
    title: "Client profile",
    description:
      "Keep account details, project context, and billing history in a matching profile layout.",
    meta: [
      formatCountLabel(data.clients.length, "client"),
      usingFallback ? "Sample data" : "Live data",
      apiStatus === "online" ? "API online" : "Syncing locally",
    ],
    items,
  };
}

function buildDealsWorkspace(data, apiStatus, usingFallback) {
  const items = data.deals
    .slice()
    .sort((left, right) => Number(right.value || 0) - Number(left.value || 0))
    .map((deal, index) => {
      const lead = data.leads.find((item) => String(item.lead_id) === String(deal.lead_id));
      const leadProfile = lead ? getLeadProfile(lead) : null;
      const client = lead
        ? data.clients.find((item) => item.company_name === lead.company || item.email === lead.email)
        : null;
      const activities = lead
        ? data.activities.filter((activity) => String(activity.lead_id) === String(lead.lead_id))
        : [];
      const winProbabilityMap = {
        Discovery: 46,
        Proposal: 64,
        "Proposal Sent": 71,
        Negotiation: 82,
        "Contract Review": 88,
        Won: 100,
        Lost: 12,
      };
      const nextActions = [
        {
          id: `${deal.deal_id}-action-1`,
          title: "Share commercial summary",
          subtitle: "Confirm pricing assumptions and next approval checkpoint.",
          pill: { label: deal.stage, tone: stageTone(deal.stage) },
          value: formatDate(shiftDate(lead?.created_at || "2026-03-21T09:00:00.000Z", index + 6)),
        },
        {
          id: `${deal.deal_id}-action-2`,
          title: "Schedule stakeholder review",
          subtitle: `Align ${leadProfile?.owner || "the owner"} with procurement and operations contacts.`,
          pill: { label: "Open", tone: "blue" },
          value: formatDate(shiftDate(lead?.created_at || "2026-03-21T09:00:00.000Z", index + 8)),
        },
      ];

      return {
        id: deal.deal_id,
        directory: {
          avatar: getInitials(deal.deal_name),
          title: deal.deal_name,
          meta: `${lead?.company || "Account"} · ${deal.stage}`,
        },
        profile: {
          avatar: getInitials(deal.deal_name),
          title: deal.deal_name,
          subtitle: `${lead?.company || "Account"} · ${lead?.name || "Primary contact"}`,
          pills: [
            { label: deal.stage, tone: stageTone(deal.stage) },
            {
              label: Number(deal.value || 0) >= 700000 ? "High priority" : "Priority",
              tone: "warm",
            },
            { label: leadProfile?.zone || "India", tone: "mint" },
          ],
          details: [
            { label: "Contact", value: lead?.name || "Primary contact" },
            { label: "Company", value: lead?.company || "Account" },
            { label: "Value", value: formatCurrency(deal.value) },
            { label: "Stage", value: deal.stage },
            { label: "Source", value: lead?.source || "Direct" },
            { label: "Owner", value: leadProfile?.owner || "Revenue team" },
            { label: "Service", value: lead?.service_interest || "CRM program" },
          ],
          scoreLabel: "Win probability",
          score: winProbabilityMap[deal.stage] || 62,
          tags: [
            lead?.company || "Account",
            lead?.service_interest || "CRM",
            lead?.source || "Inbound",
            client ? "Client matched" : "Lead stage",
          ],
        },
        tabs: [
          {
            key: "activity",
            label: "Activity",
            kind: "timeline",
            items: [
              ...activities.map((activity) =>
                buildTimelineItem({
                  id: `${deal.deal_id}-activity-${activity.activity_id}`,
                  type: activity.type,
                  title: `${activity.type} logged`,
                  summary: activity.notes,
                  createdAt: activity.created_at,
                  owner: leadProfile?.owner || "CRM",
                })
              ),
              buildTimelineItem({
                id: `${deal.deal_id}-stage`,
                type: deal.stage === "Negotiation" ? "Proposal" : "Meeting",
                title: `${deal.stage} stage`,
                summary: `${deal.deal_name} is currently in ${String(deal.stage).toLowerCase()} with ${lead?.company || "the account"}.`,
                createdAt: shiftDate(lead?.created_at || "2026-03-20T09:00:00.000Z", 2),
                owner: leadProfile?.owner || "CRM",
              }),
            ],
          },
          {
            key: "notes",
            label: "Notes",
            kind: "cards",
            items: [
              {
                id: `${deal.deal_id}-note-1`,
                title: "Commercial position",
                body: `${deal.deal_name} is currently valued at ${formatCurrency(deal.value)} with ${deal.stage.toLowerCase()} momentum.`,
              },
              {
                id: `${deal.deal_id}-note-2`,
                title: "Stakeholder map",
                body: `${lead?.name || "The main contact"} is the primary sponsor, while ${leadProfile?.owner || "the deal owner"} is coordinating the next review.`,
              },
              {
                id: `${deal.deal_id}-note-3`,
                title: "Recommended next step",
                body:
                  deal.stage === "Negotiation"
                    ? "Push for legal and procurement alignment so the deal can move into final review quickly."
                    : "Use the next conversation to tighten scope, clarify owners, and move toward a commercial checkpoint.",
              },
            ],
          },
          {
            key: "contacts",
            label: "Contacts",
            kind: "rows",
            items: [
              {
                id: `${deal.deal_id}-contact-1`,
                title: lead?.name || "Primary contact",
                subtitle: `${lead?.company || "Account"} · ${lead?.service_interest || "Opportunity"}`,
                pill: { label: lead?.status || "Lead", tone: statusTone(lead?.status || "New") },
                value: formatPhone(lead?.phone),
              },
              client && {
                id: `${deal.deal_id}-contact-2`,
                title: client.contact_person,
                subtitle: `${client.company_name} · Client record`,
                pill: { label: "Client", tone: "mint" },
                value: client.email,
              },
            ].filter(Boolean),
          },
        ],
        bottomSection: {
          title: `Next actions (${nextActions.length})`,
          buttonLabel: "+ Add task",
          items: nextActions,
          emptyTitle: "No next actions",
          emptyBody: "Track deal follow-ups and stage-specific tasks here.",
        },
      };
    });

  return {
    eyebrow: "Deal Workspace",
    title: "Deal profile",
    description:
      "Review commercial progress, contacts, and next actions inside the same detailed workspace layout.",
    meta: [
      formatCountLabel(data.deals.length, "deal"),
      usingFallback ? "Sample data" : "Live data",
      apiStatus === "online" ? "API online" : "Syncing locally",
    ],
    items,
  };
}

function buildInvoicesWorkspace(data, apiStatus, usingFallback) {
  const items = data.invoices
    .slice()
    .sort((left, right) => Number(right.amount || 0) - Number(left.amount || 0))
    .map((invoice, index) => {
      const project = data.projects.find(
        (item) => String(item.project_id) === String(invoice.project_id)
      );
      const client = project
        ? data.clients.find((item) => String(item.client_id) === String(project.client_id))
        : null;
      const dates = getInvoiceDates(invoice, index);
      const lead = client ? findLeadForClient(client, data) : null;
      const owner = lead ? getLeadProfile(lead).owner : "Finance desk";
      const paymentScore = {
        Paid: 100,
        Pending: 68,
        Overdue: 32,
      }[invoice.status] || 60;

      return {
        id: invoice.invoice_id,
        directory: {
          avatar: getInitials(padInvoiceId(invoice.invoice_id)),
          title: padInvoiceId(invoice.invoice_id),
          meta: `${client?.company_name || "Client"} · ${invoice.status || "Pending"}`,
        },
        profile: {
          avatar: getInitials(padInvoiceId(invoice.invoice_id)),
          title: padInvoiceId(invoice.invoice_id),
          subtitle: `${project?.project_name || "Project billing"} · ${client?.company_name || "Client"}`,
          pills: [
            { label: invoice.status || "Pending", tone: statusTone(invoice.status || "Pending") },
            { label: project?.service_type || "Milestone", tone: "violet" },
            { label: client ? "Client linked" : "Unassigned", tone: client ? "mint" : "amber" },
          ],
          details: [
            { label: "Client", value: client?.company_name || "Client record" },
            { label: "Project", value: project?.project_name || "Linked project" },
            { label: "Amount", value: formatCurrency(invoice.amount) },
            { label: "Issued", value: formatDate(dates.issuedAt) },
            { label: "Due", value: formatDate(dates.dueAt) },
            { label: "Status", value: invoice.status || "Pending" },
            { label: "Owner", value: owner },
          ],
          scoreLabel: "Collection confidence",
          score: paymentScore,
          tags: [
            invoice.status || "Pending",
            project?.status || "Billing",
            project?.service_type || "Milestone",
            client?.company_name || "Client",
          ],
        },
        tabs: [
          {
            key: "activity",
            label: "Activity",
            kind: "timeline",
            items: [
              buildTimelineItem({
                id: `${invoice.invoice_id}-1`,
                type: "Invoice",
                title: "Invoice created",
                summary: `${padInvoiceId(invoice.invoice_id)} was raised for ${client?.company_name || "the client"}.`,
                createdAt: dates.issuedAt,
                owner,
              }),
              buildTimelineItem({
                id: `${invoice.invoice_id}-2`,
                type: invoice.status === "Paid" ? "Meeting" : "Email",
                title: invoice.status === "Paid" ? "Payment received" : "Reminder scheduled",
                summary:
                  invoice.status === "Paid"
                    ? `Payment was confirmed against ${padInvoiceId(invoice.invoice_id)}.`
                    : `Finance follow-up is lined up before ${formatDate(dates.dueAt)}.`,
                createdAt: shiftDate(dates.issuedAt, 5),
                owner,
              }),
            ],
          },
          {
            key: "notes",
            label: "Notes",
            kind: "cards",
            items: [
              {
                id: `${invoice.invoice_id}-note-1`,
                title: "Billing context",
                body: `${padInvoiceId(invoice.invoice_id)} covers ${project?.project_name || "the current milestone"} for ${client?.company_name || "the client"}.`,
              },
              {
                id: `${invoice.invoice_id}-note-2`,
                title: "Risk review",
                body:
                  invoice.status === "Overdue"
                    ? "Collection risk is elevated. The owner should speak with the account contact before the next project checkpoint."
                    : "Billing risk is currently manageable and can be tracked alongside delivery milestones.",
              },
              {
                id: `${invoice.invoice_id}-note-3`,
                title: "Recommended next step",
                body:
                  invoice.status === "Paid"
                    ? "Use the paid milestone to advance the next invoice or expansion conversation."
                    : "Confirm approver availability and send a reminder with project context attached.",
              },
            ],
          },
          {
            key: "records",
            label: "Records",
            kind: "rows",
            items: [
              {
                id: `${invoice.invoice_id}-record-1`,
                title: project?.project_name || "Linked project",
                subtitle: `${project?.service_type || "Service"} · ${project?.status || "Active"}`,
                pill: { label: project?.status || "Active", tone: statusTone(project?.status || "Open") },
                value: client?.company_name || "Client",
              },
              {
                id: `${invoice.invoice_id}-record-2`,
                title: client?.contact_person || "Client contact",
                subtitle: client?.email || "Contact details",
                pill: { label: "Owner", tone: "blue" },
                value: owner,
              },
            ],
          },
        ],
        bottomSection: {
          title: "Payment history (2)",
          buttonLabel: "+ Send reminder",
          items: [
            {
              id: `${invoice.invoice_id}-payment-1`,
              title: "Invoice issued",
              subtitle: `Created on ${formatDate(dates.issuedAt)}`,
              pill: { label: invoice.status || "Pending", tone: statusTone(invoice.status || "Pending") },
              value: formatCurrency(invoice.amount),
            },
            {
              id: `${invoice.invoice_id}-payment-2`,
              title: invoice.status === "Paid" ? "Receipt logged" : "Due checkpoint",
              subtitle:
                invoice.status === "Paid"
                  ? `Closed after payment confirmation from ${client?.company_name || "the client"}.`
                  : `Reminder scheduled for ${formatDate(dates.dueAt)}.`,
              pill: { label: invoice.status === "Paid" ? "Closed" : "Open", tone: invoice.status === "Paid" ? "mint" : "amber" },
              value: owner,
            },
          ],
        },
      };
    });

  return {
    eyebrow: "Invoice Workspace",
    title: "Invoice profile",
    description:
      "Keep billing status, linked records, and collection notes in the same workspace pattern.",
    meta: [
      formatCountLabel(data.invoices.length, "invoice"),
      usingFallback ? "Sample data" : "Live data",
      apiStatus === "online" ? "API online" : "Syncing locally",
    ],
    items,
  };
}

function buildProjectsWorkspace(data, apiStatus, usingFallback) {
  const items = data.projects.map((project, index) => {
    const client = data.clients.find((item) => String(item.client_id) === String(project.client_id));
    const lead = client ? findLeadForClient(client, data) : null;
    const owner = lead ? getLeadProfile(lead).owner : "Delivery team";
    const relatedTasks = getProjectTasks(project, index, data.tasks);
    const relatedInvoices = data.invoices.filter(
      (invoice) => String(invoice.project_id) === String(project.project_id)
    );
    const completionMap = {
      Kickoff: 28,
      Scoping: 44,
      "In Delivery": 72,
      Completed: 100,
    };
    const completionScore = completionMap[project.status] || 56;

    return {
      id: project.project_id,
      directory: {
        avatar: getInitials(project.project_name),
        title: project.project_name,
        meta: `${project.service_type} · ${client?.company_name || "Client"}`,
      },
      profile: {
        avatar: getInitials(project.project_name),
        title: project.project_name,
        subtitle: `${project.service_type} · ${client?.company_name || "Delivery"}`,
        pills: [
          { label: project.status, tone: statusTone(project.status) },
          { label: project.service_type, tone: "violet" },
          { label: client?.company_name || "Client", tone: "mint" },
        ],
        details: [
          { label: "Client", value: client?.company_name || "Client" },
          { label: "Contact", value: client?.contact_person || "Primary contact" },
          { label: "Service", value: project.service_type },
          { label: "Status", value: project.status },
          { label: "Owner", value: owner },
          { label: "Kickoff", value: formatDate(shiftDate("2026-03-01T09:00:00.000Z", index * 5)) },
          { label: "Invoices", value: String(relatedInvoices.length) },
        ],
        scoreLabel: "Completion",
        score: completionScore,
        tags: [
          project.service_type,
          project.status,
          client?.company_name || "Client",
          relatedInvoices.length ? "Billing active" : "No billing yet",
        ],
      },
      tabs: [
        {
          key: "activity",
          label: "Activity",
          kind: "timeline",
          items: [
            buildTimelineItem({
              id: `${project.project_id}-activity-1`,
              type: "Meeting",
              title: "Project review",
              summary: `${project.project_name} is currently in ${String(project.status).toLowerCase()} with ${client?.company_name || "the client"}.`,
              createdAt: shiftDate("2026-03-01T09:00:00.000Z", index * 5 + 2),
              owner,
            }),
            ...relatedTasks.slice(0, 2).map((task, taskIndex) =>
              buildTimelineItem({
                id: `${project.project_id}-activity-task-${task.task_id}`,
                type: task.status === "Done" ? "Meeting" : "Call",
                title: "Task update",
                summary: `${task.task_name} is marked ${String(task.status).toLowerCase()}.`,
                createdAt: shiftDate("2026-03-01T09:00:00.000Z", index * 5 + 3 + taskIndex),
                owner: task.assigned_to || owner,
              })
            ),
          ],
        },
        {
          key: "notes",
          label: "Notes",
          kind: "cards",
          items: [
            {
              id: `${project.project_id}-note-1`,
              title: "Delivery context",
              body: `${project.project_name} is being delivered for ${client?.company_name || "the client"} under ${project.service_type}.`,
            },
            {
              id: `${project.project_id}-note-2`,
              title: "Risk review",
              body:
                project.status === "Kickoff"
                  ? "Scope is still settling. Keep close alignment on owners and early milestones."
                  : "Delivery is underway, so the main risk is milestone drift rather than project setup.",
            },
            {
              id: `${project.project_id}-note-3`,
              title: "Recommended next step",
              body:
                relatedInvoices.length
                  ? "Use the next project checkpoint to align billing and delivery progress together."
                  : "Lock the next milestone and create the first billing checkpoint once scope is approved.",
            },
          ],
        },
        {
          key: "tasks",
          label: "Tasks",
          kind: "rows",
          items: buildRows(relatedTasks, (task, taskIndex) => ({
            title: task.task_name,
            subtitle: `${task.assigned_to || "Team"} · ${task.status}`,
            pill: { label: task.status, tone: statusTone(task.status) },
            value: task.priority || `T${taskIndex + 1}`,
          })),
          emptyTitle: "No project tasks yet",
          emptyBody: "Tracked tasks for this project will appear here.",
        },
      ],
      bottomSection: {
        title: `Invoices (${relatedInvoices.length})`,
        buttonLabel: "+ Add invoice",
        items: buildRows(relatedInvoices, (invoice, invoiceIndex) => ({
          title: padInvoiceId(invoice.invoice_id),
          subtitle: `${invoice.status || "Pending"} · ${formatDate(getInvoiceDates(invoice, invoiceIndex).issuedAt)}`,
          pill: { label: invoice.status || "Pending", tone: statusTone(invoice.status || "Pending") },
          value: formatCurrency(invoice.amount),
        })),
        emptyTitle: "No invoices yet",
        emptyBody: "Billing milestones for this project will appear here.",
      },
    };
  });

  return {
    eyebrow: "Project Workspace",
    title: "Project profile",
    description:
      "Project delivery, tasks, and billing stay in the same profile layout as the rest of the CRM.",
    meta: [
      formatCountLabel(data.projects.length, "project"),
      usingFallback ? "Sample data" : "Live data",
      apiStatus === "online" ? "API online" : "Syncing locally",
    ],
    items,
  };
}

function buildTasksWorkspace(data, apiStatus, usingFallback) {
  const items = data.tasks.map((task, index) => {
    const priority = getTaskPriority(task, index);
    const project = getTaskProject(task, index, data);
    const client = project
      ? data.clients.find((item) => String(item.client_id) === String(project.client_id))
      : null;
    const readiness = {
      Done: 100,
      Waiting: 54,
      Open: 61,
      "In Progress": 74,
    }[task.status] || 66;
    const dueAt = formatDate(shiftDate("2026-04-01T09:00:00.000Z", index + 3));
    const checklist = [
      {
        id: `${task.task_id}-check-1`,
        title: "Clarify scope",
        subtitle: `Review task intent with ${task.assigned_to || "the owner"}.`,
        pill: {
          label: task.status === "Done" ? "Done" : "Open",
          tone: task.status === "Done" ? "mint" : "blue",
        },
        value: dueAt,
      },
      {
        id: `${task.task_id}-check-2`,
        title: "Confirm dependencies",
        subtitle: project ? `Align with ${project.project_name}.` : "Capture the linked project or account.",
        pill: {
          label: task.status === "In Progress" ? "In progress" : "Planned",
          tone: task.status === "In Progress" ? "violet" : "amber",
        },
        value: task.assigned_to || "Owner",
      },
    ];

    return {
      id: task.task_id,
      directory: {
        avatar: getInitials(task.task_name),
        title: task.task_name,
        meta: `${task.assigned_to || "Owner"} · ${task.status}`,
      },
      profile: {
        avatar: getInitials(task.assigned_to || task.task_name),
        title: task.task_name,
        subtitle: `${project?.project_name || "Operations task"} · ${task.assigned_to || "Unassigned"}`,
        pills: [
          { label: priority, tone: priorityTone(priority) },
          { label: task.status, tone: statusTone(task.status) },
          { label: client?.company_name || "Internal", tone: client ? "mint" : "blue" },
        ],
        details: [
          { label: "Assignee", value: task.assigned_to || "Unassigned" },
          { label: "Project", value: project?.project_name || "Operations queue" },
          { label: "Client", value: client?.company_name || "Internal work" },
          { label: "Status", value: task.status },
          { label: "Priority", value: priority },
          { label: "Due", value: dueAt },
          { label: "Queue", value: project?.service_type || "General ops" },
        ],
        scoreLabel: "Completion readiness",
        score: readiness,
        tags: [
          priority,
          task.status,
          task.assigned_to || "Unassigned",
          project?.service_type || "Ops",
        ],
      },
      tabs: [
        {
          key: "activity",
          label: "Activity",
          kind: "timeline",
          items: [
            buildTimelineItem({
              id: `${task.task_id}-activity-1`,
              type: "Call",
              title: "Task opened",
              summary: `${task.task_name} was captured for ${project?.project_name || "operations work"}.`,
              createdAt: shiftDate("2026-04-01T09:00:00.000Z", index),
              owner: task.assigned_to || "CRM",
            }),
            buildTimelineItem({
              id: `${task.task_id}-activity-2`,
              type: task.status === "Done" ? "Meeting" : "Email",
              title: task.status === "Done" ? "Task completed" : "Status updated",
              summary: `Current status is ${String(task.status).toLowerCase()}.`,
              createdAt: shiftDate("2026-04-01T09:00:00.000Z", index + 1),
              owner: task.assigned_to || "CRM",
            }),
          ],
        },
        {
          key: "notes",
          label: "Notes",
          kind: "cards",
          items: [
            {
              id: `${task.task_id}-note-1`,
              title: "Task brief",
              body: `${task.task_name} supports ${project?.project_name || "the current CRM workflow"} and is owned by ${task.assigned_to || "the team"}.`,
            },
            {
              id: `${task.task_id}-note-2`,
              title: "Risk review",
              body:
                task.status === "Waiting"
                  ? "This task is blocked and should be reviewed before it impacts the wider timeline."
                  : "The task is active enough to track through normal delivery rhythm.",
            },
            {
              id: `${task.task_id}-note-3`,
              title: "Recommended next step",
              body:
                task.status === "Done"
                  ? "Close the loop with the stakeholder and log any follow-on work."
                  : "Confirm dependencies and turn the next update into a visible progress checkpoint.",
            },
          ],
        },
        {
          key: "checklist",
          label: "Checklist",
          kind: "rows",
          items: checklist,
        },
      ],
      bottomSection: {
        title: "Related project",
        buttonLabel: "Open project",
        items: [
          {
            id: `${task.task_id}-project`,
            title: project?.project_name || "Operations queue",
            subtitle: `${project?.service_type || "General ops"} · ${client?.company_name || "Internal"}`,
            pill: { label: project?.status || "Open", tone: statusTone(project?.status || "Open") },
            value: task.assigned_to || "Owner",
          },
        ],
      },
    };
  });

  return {
    eyebrow: "Task Workspace",
    title: "Task profile",
    description:
      "Keep task ownership, progress, and related delivery context inside the same UI pattern.",
    meta: [
      formatCountLabel(data.tasks.length, "task"),
      usingFallback ? "Sample data" : "Live data",
      apiStatus === "online" ? "API online" : "Syncing locally",
    ],
    items,
  };
}

function buildTeamWorkspace(data, apiStatus, usingFallback) {
  const teamMembers = buildTeamMembers(data);

  const items = teamMembers.map((member, index) => ({
    id: member.id,
    directory: {
      avatar: getInitials(member.name),
      title: member.name,
      meta: `${member.role} · ${member.location.split(",")[0]}`,
    },
    profile: {
      avatar: getInitials(member.name),
      title: member.name,
      subtitle: `${member.role} · ${member.location}`,
      pills: [
        { label: member.team, tone: "warm" },
        { label: member.focus, tone: "violet" },
        { label: member.location.split(",")[0], tone: "mint" },
      ],
      details: [
        { label: "Email", value: `${member.name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/(^\.|\.$)/g, "")}@crm.local` },
        { label: "Role", value: member.role },
        { label: "Focus", value: member.focus },
        { label: "Leads", value: String(member.ownedLeads.length) },
        { label: "Deals", value: String(member.ownedDeals.length) },
        { label: "Tasks", value: String(member.assignedTasks.length) },
        { label: "Location", value: member.location },
      ],
      scoreLabel: "Capacity",
      score: member.capacityScore,
      tags: member.tags,
    },
    tabs: [
      {
        key: "activity",
        label: "Activity",
        kind: "timeline",
        items: [
          ...member.ownedDeals.slice(0, 2).map((deal) =>
            buildTimelineItem({
              id: `${member.id}-deal-${deal.deal_id}`,
              type: "Proposal",
              title: "Deal review",
              summary: `${deal.deal_name} is being managed in ${String(deal.stage).toLowerCase()}.`,
              createdAt: shiftDate("2026-04-02T09:00:00.000Z", index),
              owner: member.name,
            })
          ),
          ...member.assignedTasks.slice(0, 2).map((task, taskIndex) =>
            buildTimelineItem({
              id: `${member.id}-task-${task.task_id}`,
              type: task.status === "Done" ? "Meeting" : "Call",
              title: "Task update",
              summary: `${task.task_name} is ${String(task.status).toLowerCase()}.`,
              createdAt: shiftDate("2026-04-01T09:00:00.000Z", index + taskIndex + 1),
              owner: member.name,
            })
          ),
        ],
      },
      {
        key: "notes",
        label: "Notes",
        kind: "cards",
        items: [
          {
            id: `${member.id}-note-1`,
            title: "Role summary",
            body: `${member.name} is focused on ${member.focus.toLowerCase()} within the ${member.team} team.`,
          },
          {
            id: `${member.id}-note-2`,
            title: "Current load",
            body: `They are currently carrying ${member.ownedDeals.length} active deal(s) and ${member.assignedTasks.length} tracked task(s).`,
          },
          {
            id: `${member.id}-note-3`,
            title: "Recommended next step",
            body:
              member.capacityScore < 50
                ? "Capacity is tight, so rebalance follow-up work before assigning new high-priority items."
                : "Capacity is healthy enough to support an additional follow-up or discovery stream.",
          },
        ],
      },
      {
        key: "accounts",
        label: "Accounts",
        kind: "rows",
        items: [
          ...member.ownedLeads.map((lead) => ({
            id: `${member.id}-lead-${lead.lead_id}`,
            title: lead.name,
            subtitle: `${lead.company} · ${lead.service_interest}`,
            pill: { label: lead.status, tone: statusTone(lead.status) },
            value: lead.source,
          })),
          ...member.ownedDeals.slice(0, 2).map((deal) => ({
            id: `${member.id}-owned-deal-${deal.deal_id}`,
            title: deal.deal_name,
            subtitle: `${deal.stage} · ${formatCurrency(deal.value)}`,
            pill: { label: deal.stage, tone: stageTone(deal.stage) },
            value: formatCurrency(deal.value),
          })),
        ],
        emptyTitle: "No assigned accounts",
        emptyBody: "Owned leads and deals will appear here.",
      },
    ],
    bottomSection: {
      title: `Task queue (${member.assignedTasks.length})`,
      buttonLabel: "+ Assign task",
      items: buildRows(member.assignedTasks, (task) => ({
        title: task.task_name,
        subtitle: `${task.status} · Active queue`,
        pill: { label: task.status, tone: statusTone(task.status) },
        value: task.priority || "Standard",
      })),
      emptyTitle: "No assigned tasks",
      emptyBody: "This teammate's task queue will appear here.",
    },
  }));

  return {
    eyebrow: "Team Workspace",
    title: "Team profile",
    description:
      "Review teammate ownership, workload, and account context in the same profile layout.",
    meta: [
      formatCountLabel(teamMembers.length, "member"),
      usingFallback ? "Sample data" : "Live data",
      apiStatus === "online" ? "API online" : "Syncing locally",
    ],
    items,
  };
}

export default function buildWorkspaceConfig(resource, data, apiStatus, usingFallback) {
  switch (resource) {
    case "dashboard":
      return buildDashboardWorkspace(data, apiStatus, usingFallback);
    case "activities":
      return buildActivitiesWorkspace(data, apiStatus, usingFallback);
    case "clients":
      return buildClientsWorkspace(data, apiStatus, usingFallback);
    case "deals":
      return buildDealsWorkspace(data, apiStatus, usingFallback);
    case "invoices":
      return buildInvoicesWorkspace(data, apiStatus, usingFallback);
    case "projects":
      return buildProjectsWorkspace(data, apiStatus, usingFallback);
    case "tasks":
      return buildTasksWorkspace(data, apiStatus, usingFallback);
    case "team":
      return buildTeamWorkspace(data, apiStatus, usingFallback);
    case "leads":
    default:
      return buildLeadWorkspace(data, apiStatus, usingFallback);
  }
}
