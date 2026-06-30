import api from "./api";

const getAdminHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminLogin = async (email, password) => {
  const res = await api.post("/auth/admin-login", { email, password });
  return res.data;
};

export const getAdminUsers = async () => {
  const res = await api.get("/admin/users", {
    headers: getAdminHeaders(),
  });
  return res.data;
};

export const deleteAdminUser = async (userId) => {
  const res = await api.delete(`/admin/users/${userId}`, {
    headers: getAdminHeaders(),
  });
  return res.data;
};
