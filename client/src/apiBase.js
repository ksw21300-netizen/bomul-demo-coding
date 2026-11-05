function resolveApiBase() {
  const fromEnv = import.meta.env.VITE_API_BASE;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:4000';
  }
  return 'https://audience-because-shopzilla-discrimination.trycloudflare.com';
}

export const API_BASE = resolveApiBase();
