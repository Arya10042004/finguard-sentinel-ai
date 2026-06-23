import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export async function getDashboardSummary() {
  const response = await api.get("/dashboard/summary");
  return response.data;
}

export async function getCustomers() {
  const response = await api.get("/customers/");
  return response.data;
}

export async function getHighRiskCustomers() {
  const response = await api.get("/risk/high-risk-customers");
  return response.data;
}

export async function getCustomerRiskProfile(customerId: string) {
  const response = await api.get(`/risk/profile/${customerId}`);
  return response.data;
}

export async function getCustomerExplanation(customerId: string) {
  const response = await api.get(`/risk/explain/${customerId}`);
  return response.data;
}

export async function createComplianceAction(actionData: {
  customer_id: string;
  action: string;
  performed_by: string;
  remarks: string;
}) {
  const response = await api.post("/compliance/action", actionData);
  return response.data;
}

export async function getComplianceActions() {
  const response = await api.get("/compliance/actions");
  return response.data;
}
export async function getAuditLogs() {
  const response = await api.get("/audit/logs");
  return response.data;
}
export async function getDataQualitySummary() {
  const response = await api.get("/data-quality/summary");
  return response.data;
}
export async function getEntityResolutionReport() {
  const response = await api.get("/data-quality/entity-resolution");
  return response.data;
}