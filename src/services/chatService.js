import api from "./api";

export const getConversations = async () => {
  const res = await api.get("/chats/conversations");
  return res.data;
};

export const getMessagesWithUser = async (userId) => {
  const res = await api.get(`/chats/${userId}`);
  return res.data;
};

export const sendMessageToUser = async (userId, text) => {
  const res = await api.post(`/chats/${userId}`, { text });
  return res.data;
};
