// Format helpers for display purposes

// Format date to a readable string
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format currency with proper symbol and decimal places
export const formatCurrency = (amount, currency = "USD") => {
  if (amount === undefined || amount === null) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Format file size to human-readable format
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

// Get color class based on status
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "approved":
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
    case "in progress":
      return "bg-yellow-100 text-yellow-800";
    case "inactive":
    case "rejected":
    case "failed":
      return "bg-red-100 text-red-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
