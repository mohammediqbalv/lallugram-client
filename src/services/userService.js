import api from "./api";

export const getProfile = async () => {
  const token = localStorage.getItem("token");

  const res = await api.get("/users/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const updateProfile = async (formData) => {
  const token = localStorage.getItem("token");

  const res = await api.put("/users/profile", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const searchUsers = async (text) => {
  const token = localStorage.getItem("token");

  const res = await api.get(`/users/search?search=${encodeURIComponent(text)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getUserProfileById = async (id) => {
  const token = localStorage.getItem("token");

  const res = await api.get(`/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const followUser = async (id) => {
  const token = localStorage.getItem("token");

  const res = await api.put(
    `/users/follow/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const toggleSavePost = async (postId) => {
  const token = localStorage.getItem("token");

  const res = await api.put(
    `/users/save/${postId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const getSavedPosts = async () => {
  const token = localStorage.getItem("token");

  const res = await api.get("/users/saved", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
