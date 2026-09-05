const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

export const api = {
  login: (body) => request("/api/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) => request("/api/register", { method: "POST", body: JSON.stringify(body) }),
  centers: () => request("/api/centers"),
  slots: (params = "") => request(`/api/slots${params ? `?${params}` : ""}`),
  bookings: (userId) => request(`/api/bookings?userId=${userId}`),
  book: (body) => request("/api/bookings", { method: "POST", body: JSON.stringify(body) }),
  cancel: (id) => request(`/api/bookings/${id}/cancel`, { method: "PATCH" }),
  stats: () => request("/api/admin/stats")
};
