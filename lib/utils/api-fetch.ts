export async function apiFetch<T = Record<string, unknown>>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<{ ok: boolean; error?: string; data: T }> {
  const res = await fetch(url, {
    method,
    ...(body !== undefined && {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  })
  const data = (await res.json()) as T & { error?: string }
  return { ok: res.ok, error: data.error, data }
}
