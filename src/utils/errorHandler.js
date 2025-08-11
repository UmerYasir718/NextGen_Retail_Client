export const handleNotificationError = (error) => {
  if (error.message?.includes("Authentication") || error.message?.includes("401")) {
    // Redirect to login
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return "Authentication failed. Please login again.";
  } else if (error.message?.includes("Connection") || error.message?.includes("Network")) {
    // Show reconnection message
    console.error("Connection error:", error);
    return "Connection lost. Trying to reconnect...";
  } else if (error.message?.includes("403")) {
    return "Access denied. You don't have permission to view notifications.";
  } else if (error.message?.includes("404")) {
    return "Notifications not found.";
  } else if (error.message?.includes("500")) {
    return "Server error. Please try again later.";
  } else {
    // Show generic error
    console.error("Notification error:", error);
    return error.message || "An unexpected error occurred.";
  }
};

export const handleWebSocketError = (error) => {
  console.error("WebSocket error:", error);
  
  if (error.message?.includes("Authentication")) {
    return "WebSocket authentication failed. Please refresh the page.";
  } else if (error.message?.includes("Connection")) {
    return "WebSocket connection lost. Attempting to reconnect...";
  } else {
    return "WebSocket error. Please refresh the page.";
  }
};

export const handleAPIError = (error) => {
  console.error("API error:", error);
  
  if (error.response?.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return "Session expired. Please login again.";
  } else if (error.response?.status === 403) {
    return "Access denied. You don't have permission to perform this action.";
  } else if (error.response?.status === 404) {
    return "Resource not found.";
  } else if (error.response?.status >= 500) {
    return "Server error. Please try again later.";
  } else {
    return error.message || "An unexpected error occurred.";
  }
}; 