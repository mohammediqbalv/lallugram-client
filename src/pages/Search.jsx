import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { followUser, searchUsers } from "../services/userService";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/search.css";

export default function Search() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [users, setUsers] = useState([]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setText(value);

    if (value.trim() === "") {
      setUsers([]);
      return;
    }

    try {
      const data = await searchUsers(value);
      setUsers(data);
    } catch (err) {
      alert(err.response?.data?.message || "Search failed");
      setUsers([]);
    }
  };

  const getAvatar = (user) => {
    return getImageUrl(
      user.profileImage && user.profileImage !== "/uploads/default-avatar.png"
        ? user.profileImage
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.username || "User"
          )}`
    );
  };

  const handleFollow = async (id) => {
    try {
      const res = await followUser(id);

      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user._id === id) {
            return {
              ...user,
              following: res.following,
            };
          }

          return user;
        })
      );
    } catch (err) {
      alert(err.response?.data?.message || "Follow action failed");
    }
  };

  return (
    <MainLayout>
      <div className="search-page">
        <h2>Search Users</h2>

        <input
          type="text"
          placeholder="Search username..."
          value={text}
          onChange={handleSearch}
        />

        <div className="search-results">
          {users.map((user) => (
            <div
              key={user._id}
              className="user-card clickable"
              onClick={() => navigate(`/users/${user._id}`)}
            >
              <img
                src={getAvatar(user)}
                alt={user.username}
                className="user-avatar"
              />

              <div>
                <h3>{user.username}</h3>
                <p>{user.email}</p>
              </div>

              <button
                type="button"
                className="follow-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollow(user._id);
                }}
              >
                {user.following ? "Following" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
