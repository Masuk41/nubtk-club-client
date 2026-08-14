const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "API request failed" }));
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  },

  auth: {
    register(data) {
      return api.request("/users/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    login(data) {
      return api.request("/users/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    getMe() {
      return api.request("/users/me");
    },
  },

  users: {
    getAll() {
      return api.request("/users");
    },
    getById(id) {
      return api.request(`/users/${id}`);
    },
    getByRole(role) {
      return api.request(`/users/role/${role}`);
    },
    getAllMentors() {
      return api.request("/users/mentors/all");
    },
    getLeaderboard() {
      return api.request("/users/leaderboard");
    },
    update(id, data) {
      return api.request(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  },

  mentors: {
    getAll() {
      return api.request("/mentors");
    },
    getById(id) {
      return api.request(`/mentors/${id}`);
    },
    sendRequest(mentorId, data) {
      return api.request(`/mentors/${mentorId}/request`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    getRequests(mentorId) {
      return api.request(`/mentors/${mentorId}/requests`);
    },
    respondToRequest(requestId, data) {
      return api.request(`/mentors/requests/${requestId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    getMentees(mentorId) {
      return api.request(`/mentors/${mentorId}/mentees`);
    },
    delete(mentorId) {
      return api.request(`/mentors/${mentorId}`, { method: "DELETE" });
    },
  },

  resources: {
    getAll() {
      return api.request("/resources");
    },
    create(data) {
      return api.request("/resources", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    delete(id) {
      return api.request(`/resources/${id}`, { method: "DELETE" });
    },
    getCategories() {
      return api.request("/resources/categories");
    },
    createCategory(name) {
      return api.request("/resources/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
    },
  },

  events: {
    getAll() {
      return api.request("/events");
    },
    getById(id) {
      return api.request(`/events/${id}`);
    },
    create(data) {
      return api.request("/events", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update(id, data) {
      return api.request(`/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete(id) {
      return api.request(`/events/${id}`, { method: "DELETE" });
    },
    rsvp(id) {
      return api.request(`/events/${id}/rsvp`, { method: "POST" });
    },
    getAttendees(id) {
      return api.request(`/events/${id}/attendees`);
    },
  },

  projects: {
    getAll() {
      return api.request("/projects");
    },
    getById(id) {
      return api.request(`/projects/${id}`);
    },
    create(data) {
      return api.request("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update(id, data) {
      return api.request(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete(id) {
      return api.request(`/projects/${id}`, { method: "DELETE" });
    },
    vote(id) {
      return api.request(`/projects/${id}/vote`, { method: "POST" });
    },
    addTeamMember(id, userId) {
      return api.request(`/projects/${id}/team`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
    },
    join(id) {
      return api.request(`/projects/${id}/join`, { method: "POST" });
    },
  },

  forum: {
    getAll(tag = "") {
      return api.request(`/forum${tag ? `?tag=${tag}` : ""}`);
    },
    getById(id) {
      return api.request(`/forum/${id}`);
    },
    create(data) {
      return api.request("/forum", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update(id, data) {
      return api.request(`/forum/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete(id) {
      return api.request(`/forum/${id}`, { method: "DELETE" });
    },
    upvote(id) {
      return api.request(`/forum/${id}/upvote`, { method: "POST" });
    },
    reply(id, data) {
      return api.request(`/forum/${id}/reply`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  announcements: {
    getAll() {
      return api.request("/announcements");
    },
    getById(id) {
      return api.request(`/announcements/${id}`);
    },
    create(data) {
      return api.request("/announcements", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update(id, data) {
      return api.request(`/announcements/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete(id) {
      return api.request(`/announcements/${id}`, { method: "DELETE" });
    },
  },

  notifications: {
    getAll() {
      return api.request("/notifications");
    },
    getUnread() {
      return api.request("/notifications/unread");
    },
    markAsRead(id) {
      return api.request(`/notifications/${id}/read`, { method: "PUT" });
    },
    delete(id) {
      return api.request(`/notifications/${id}`, { method: "DELETE" });
    },
  },

  clubs: {
    getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      return api.request(`/clubs${query ? "?" + query : ""}`);
    },
    getById(id) {
      return api.request(`/clubs/${id}`);
    },
    create(data) {
      return api.request("/clubs", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update(id, data) {
      return api.request(`/clubs/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete(id) {
      return api.request(`/clubs/${id}`, { method: "DELETE" });
    },
    join(id) {
      return api.request(`/clubs/${id}/join`, { method: "POST" });
    },
    leave(id) {
      return api.request(`/clubs/${id}/leave`, { method: "POST" });
    },
  },
};

export default api;
