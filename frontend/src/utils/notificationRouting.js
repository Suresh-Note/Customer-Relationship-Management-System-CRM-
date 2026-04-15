function takeBeforeSeparator(value = "") {
  const trimmed = value.trim();
  const separatorMatch = trimmed.match(/^(.*?)(?:\s[—–-]\s)/);
  return separatorMatch ? separatorMatch[1].trim() : trimmed;
}

function getLeadSearch(value = "") {
  if (value.includes(" moved to ")) {
    return value.split(" moved to ")[0].trim();
  }

  if (value.includes(" from ")) {
    return value.split(" from ")[0].trim();
  }

  return value.trim();
}

function getInvoiceSearch(value = "") {
  const match = value.match(/INV-\d+/i);
  return match ? match[0].toUpperCase() : value.trim();
}

export function getNotificationDestination(notification) {
  const baseState = { notificationTitle: notification.title };

  switch (notification.type) {
    case "deal":
      return {
        pathname: "/deals",
        state: {
          ...baseState,
          notificationSearch: takeBeforeSeparator(notification.desc),
        },
      };

    case "lead":
      return {
        pathname: "/leads",
        state: {
          ...baseState,
          notificationSearch: getLeadSearch(notification.desc),
        },
      };

    case "invoice":
      return {
        pathname: "/invoices",
        state: {
          ...baseState,
          notificationSearch: getInvoiceSearch(notification.desc),
        },
      };

    case "task":
      return {
        pathname: "/tasks",
        state: {
          ...baseState,
          notificationSearch: notification.desc.trim(),
        },
      };

    case "meeting":
      return {
        pathname: "/activities",
        state: {
          ...baseState,
          notificationTab: "Meeting",
        },
      };

    default:
      return { pathname: "/", state: baseState };
  }
}
