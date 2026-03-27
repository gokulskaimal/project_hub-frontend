export const getStatusColor = (status: string = "") => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "DONE":
      return "bg-green-50 text-green-700 border-green-200";
    case "COMPLETED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "REVIEW":
    case "PLANNING":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "ON_HOLD":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "TODO":
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

export const getPriorityColor = (priority: string = "") => {
  switch (priority.toUpperCase()) {
    case "CRITICAL":
      return "bg-red-50 text-red-700 border-red-200";
    case "HIGH":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "MEDIUM":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "LOW":
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return "Invalid Date";
  }
};
