/**
 * Shared API Helper with fast-fail circuit breaker & fallback
 * Prevents SSR pages from blocking when standalone backend is not running.
 */

const rawBackendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5000';
// Force IPv4 127.0.0.1 to avoid Windows IPv6 [::1] connection timeout stalls
export const BACKEND_URL = rawBackendUrl.replace('://localhost:', '://127.0.0.1:');

const CHECK_COOLDOWN_MS = 60000; // 60 seconds cooldown before retrying an unreachable backend

// Store state on globalThis so it persists across Server Action / SSR module executions
const globalCircuit = (globalThis as any).__backend_circuit || {
  isAvailable: false,
  lastCheck: 0,
  hasEverConnected: false,
};
(globalThis as any).__backend_circuit = globalCircuit;

export async function safeBackendFetch(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 60
): Promise<Response | null> {
  const now = Date.now();

  const isRead = !options.method || options.method === 'GET';
  // If backend was detected offline and request is a read, fail fast immediately (0ms delay)
  if (!globalCircuit.isAvailable && isRead && (now - globalCircuit.lastCheck < CHECK_COOLDOWN_MS)) {
    return null;
  }

  try {
    const url = endpoint.startsWith('http') 
      ? endpoint.replace('://localhost:', '://127.0.0.1:') 
      : `${BACKEND_URL}${endpoint}`;
      
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok || res.status < 500) {
      globalCircuit.isAvailable = true;
      globalCircuit.hasEverConnected = true;
      globalCircuit.lastCheck = now;
      return res;
    }

    return res;
  } catch {
    globalCircuit.isAvailable = false;
    globalCircuit.lastCheck = now;
    return null;
  }
}
