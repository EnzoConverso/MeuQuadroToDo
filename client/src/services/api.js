const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  // If 204 or empty
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Projects
  getProjects: () => request('/projects'),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  getBoard: (projectId) => request(`/projects/${projectId}/board`),

  // Columns
  createColumn: (projectId, data) => request(`/projects/${projectId}/columns`, { method: 'POST', body: JSON.stringify(data) }),
  updateColumn: (id, data) => request(`/columns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteColumn: (id) => request(`/columns/${id}`, { method: 'DELETE' }),

  // Cards
  createCard: (columnId, data) => request(`/columns/${columnId}/cards`, { method: 'POST', body: JSON.stringify(data) }),
  updateCard: (id, data) => request(`/cards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCard: (id) => request(`/cards/${id}`, { method: 'DELETE' }),
  moveCard: (id, targetColumnId, newPosition) => 
    request(`/cards/${id}/move`, { 
      method: 'PATCH', 
      body: JSON.stringify({ targetColumnId, newPosition }) 
    }),
};
