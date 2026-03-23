const BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error('API error'), { status: res.status, data: err });
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  getTickets: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request(`/tickets/${qs ? '?' + qs : ''}`);
  },
  createTicket: (data) => request('/tickets/', { method: 'POST', body: JSON.stringify(data) }),
  updateTicket: (id, data) => request(`/tickets/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  getStats: () => request('/tickets/stats/'),
  classify: (description) => request('/tickets/classify/', { method: 'POST', body: JSON.stringify({ description }) }),
};
