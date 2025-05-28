// src/services/dashboardService.js
import { apiFetch } from '@/lib/api';

export async function fetchDashboardOverview() {
  return await apiFetch('/dashboard/overview');
}

