import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { deleteAdminUser, getAdminUsers } from "../services/adminService";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/admin.css";

const getAvatar = (user) => {
  return getImageUrl(
    user?.profileImage && user.profileImage !== "/uploads/default-avatar.png"
      ? user.profileImage
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user?.username || "User"
        )}`
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin-login");
      return;
    }

    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load users");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin-login");
      }
    }
  };

  const handleDelete = async (userId, username) => {
    const ok = window.confirm(
      `Delete ${username}? This will remove all posts, comments, notifications, and chat data.`
    );
    if (!ok) {
      return;
    }

    setDeletingId(userId);
    try {
      await deleteAdminUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      alert("User and all related data deleted");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingId("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin-login");
  };

  return (
    <div className="admin-page">
      <BackButton />

      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button type="button" className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {users.length === 0 ? (
        <p className="admin-empty">No users found.</p>
      ) : (
        <div className="admin-user-list">
          {users.map((user) => (
            <div key={user._id} className="admin-user-card">
              <div className="admin-user-main">
                <img src={getAvatar(user)} alt={user.username} className="admin-user-avatar" />
                <div className="admin-user-meta">
                  <strong>{user.username}</strong>
                  <p>{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                className="admin-delete-btn"
                disabled={deletingId === user._id}
                onClick={() => handleDelete(user._id, user.username)}
              >
                {deletingId === user._id ? "Deleting..." : "Delete User"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
