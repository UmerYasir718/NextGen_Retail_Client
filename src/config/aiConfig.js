// AI Service Configuration
export const AI_CONFIG = {
  // AI Base URL - Update this with your actual AI service URL
  BASE_URL:
    process.env.REACT_APP_AI_BASE_URL ||
    "https://nextgenretail.site/aiserver/api",

  // API Endpoints
  ENDPOINTS: {
    FORECAST_TEXT: "/forecast/text",
    CHAT: "/chat",
    STATUS: "/status",
  },

  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
  },

  // Forecasting keywords to detect forecasting requests
  FORECASTING_KEYWORDS: [
    "forecast",
    "predict",
    "sales",
    "trend",
    "units",
    "per day",
    "per week",
    "per month",
    "selling",
    "demand",
    "inventory",
    "revenue",
    "growth",
    "decline",
    "seasonal",
    "pattern",
  ],
};

export default AI_CONFIG;
