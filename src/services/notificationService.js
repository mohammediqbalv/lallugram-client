import api from "./api";

export const getNotifications = async () => {
  const token = localStorage.getItem("token");

  const res = await api.get("/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const markAllNotificationsAsRead = async () => {
  const token = localStorage.getItem("token");

  const res = await api.put(
    "/notifications/read-all",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
