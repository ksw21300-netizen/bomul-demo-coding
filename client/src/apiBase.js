function resolveApiBase() {
  const fromEnv = import.meta.env.VITE_API_BASE;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/$/, '');
  }
  return 'http://localhost:4000';
}

export const API_BASE = resolveApiBase();
