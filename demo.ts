/**
 * Demo controls (advance an order, approve a prescription) stand in for the
 * warehouse and pharmacist back-office. They are off in production unless
 * ENABLE_DEMO_TRACKING=true.
 */
export function demoEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEMO_TRACKING === "true";
}
