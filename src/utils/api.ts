export const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
export const DATABASE_MODE = Boolean(API_BASE);
let csrf = '';
let sessionRequest: Promise<{ authenticated: boolean; csrf: string }> | undefined;

export async function api<T = any>(route: string, method = 'GET', body?: unknown): Promise<T> {
  if (method !== 'GET' && !csrf && route !== 'session') await session();
  const response = await fetch(`${API_BASE}?route=${encodeURIComponent(route)}`, {
    method, credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(method !== 'GET' ? { 'X-CSRF-Token': csrf } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let result: any;
  try { result = await response.json(); } catch { throw new Error('Server response invalid. Please try again.'); }
  if (!response.ok) throw new Error(result.error || 'Unable to save changes. Please try again.');
  if (result.csrf) csrf = result.csrf;
  return result;
}

export function session(refresh = false) {
  if (refresh || !sessionRequest) sessionRequest = api<{ authenticated: boolean; csrf: string }>('session').catch(error => {
    sessionRequest = undefined;
    throw error;
  });
  return sessionRequest;
}

export function reportApiError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unable to save changes.';
  window.dispatchEvent(new CustomEvent('idogtc-api-error', { detail: message }));
}
