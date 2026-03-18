import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ============ Module 7: Smart Department Recommendation ============
export const recommendDepartment = (query) =>
  API.post("/recommend/department", { query });

export const getAllDepartments = () =>
  API.get("/recommend/departments");

// ============ Module 8: RTI Template Generator ============
export const getTemplates = (category, search) =>
  API.get("/templates", { params: { category, search } });

export const getTemplateById = (id) =>
  API.get(`/templates/${id}`);

export const generateFromTemplate = (id, values) =>
  API.post(`/templates/${id}/generate`, { values });

export const getTemplateCategories = () =>
  API.get("/templates/categories");

// ============ Module 10: Analytics Dashboard ============
export const getOverviewStats = () =>
  API.get("/analytics/overview");

export const getMonthlyTrend = () =>
  API.get("/analytics/monthly-trend");

export const getDepartmentPerformance = () =>
  API.get("/analytics/department-performance");

export const getStatusDistribution = () =>
  API.get("/analytics/status-distribution");

export const getPublicStats = () =>
  API.get("/analytics/public");
