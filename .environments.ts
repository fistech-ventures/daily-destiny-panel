export const Env = {
  // Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  webHostUrl: process.env.NEXT_PUBLIC_WEB_HOST_URL,
  webIdentifier: process.env.NEXT_PUBLIC_WEB_IDENTIFIER,
  webMode: process.env.NEXT_PUBLIC_WEB_MODE,

  // Flag
  isDevelopment: process.env.NEXT_PUBLIC_WEB_MODE === 'development',
  isStaging: process.env.NEXT_PUBLIC_WEB_MODE === 'staging',
  isProduction: process.env.NEXT_PUBLIC_WEB_MODE === 'production',
  isEnableRBAC: process.env.NEXT_PUBLIC_ENABLE_RBAC,
};