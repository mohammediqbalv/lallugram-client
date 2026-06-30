import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  getNotifications,
  markAllNotificationsAsRead,
} from "../services/notificationService";
import "../styles/notifications.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
        await markAllNotificationsAsRead();
        window.dispatchEvent(new Event("notifications-updated"));
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load notifications");
      }
    };

    loadNotifications();
  }, []);

  const getSenderAvatar = (sender) => {
    if (sender?.profileImage && sender.profileImage !== "/uploads/default-avatar.png") {
      return `http://localhost:5000${sender.profileImage}`;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      sender?.username || "User"
    )}`;
  };

  const getText = (notification) => {
    const username = notification.sender?.username || "Someone";

    if (notification.type === "like") {
      return `${username} liked your post`;
    }

    if (notification.type === "comment") {
      return `${username} commented on your post`;
    }

    if (notification.type === "follow") {
      return `${username} started following you`;
    }

    return `${username} sent you a notification`;
  };

  return (
    <MainLayout>
      <div className="notifications-page">
        <h2>Notifications</h2>

        {notifications.length === 0 ? (
          <p className="empty-note">No notifications yet.</p>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <div key={notification._id} className="notification-item">
                <img
                  src={getSenderAvatar(notification.sender)}
                  alt={notification.sender?.username || "User"}
                  className="notification-avatar"
                />
                <div>
                  <p>{getText(notification)}</p>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
