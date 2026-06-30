import api from "./api";

export const getComments = async (postId) => {
  const res = await api.get(`/comments/${postId}`);
  return res.data;
};

export const addComment = async (postId, text) => {
  const res = await api.post(`/comments/${postId}`, { text });
  return res.data;
};

export const deleteComment = async (commentId) => {
  const res = await api.delete(`/comments/${commentId}`);
  return res.data;
};
