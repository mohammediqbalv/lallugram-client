import api from "./api";

export const getPosts = async () => {
  const res = await api.get("/posts");
  return res.data;
};

export const createPost = async (formData) => {
  const token = localStorage.getItem("token");
  const res = await api.post("/posts/create", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const likePost = async (id) => {
  const token = localStorage.getItem("token");
  const res = await api.put(
    `/posts/like/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const deletePost = async (id) => {
  const token = localStorage.getItem("token");
  const res = await api.delete(`/posts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getExplorePosts = async () => {
  const token = localStorage.getItem("token");
  const res = await api.get("/posts/explore", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
