import { apiCall } from '../api/client';

export function normalizeEventsPayload(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.['hydra:member'])) return data['hydra:member'];
  return [];
}

export async function fetchAllEvents() {
  const result = await apiCall('/api/event/', { method: 'GET' });
  if (!result.success) {
    return { events: [], error: result.error || 'Impossible de charger les événements' };
  }
  return { events: normalizeEventsPayload(result.data), error: null };
}
