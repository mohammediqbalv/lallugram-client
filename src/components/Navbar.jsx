import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiBookmark,
  FiHome,
  FiLogOut,
  FiMessageCircle,
} from "react-icons/fi";
import { getNotifications } from "../services/notificationService";
import { searchUsers } from "../services/userService";
import logoImage from "../assets/logo.png";
import "../styles/navbar.css";
import { getImageUrl } from "../utils/imageUrl";

const API_URL = import.meta.env.VITE_API_URL;

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    };

    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);
    window.addEventListener("user-updated", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
      window.removeEventListener("user-updated", syncUser);
    };
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        setUnreadCount(data.filter((n) => !n.isRead).length);
      } catch {
        setUnreadCount(0);
      }
    };

    loadNotifications();

    const refreshNotifications = () => {
      loadNotifications();
    };

    window.addEventListener("notifications-updated", refreshNotifications);

    const intervalId = setInterval(loadNotifications, 15000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("notifications-updated", refreshNotifications);
    };
  }, []);

  const navbarAvatar = getImageUrl(
    user?.profileImage && user.profileImage !== "/uploads/default-avatar.png"
      ? user.profileImage
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user?.username || "Guest"
        )}`
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("user-updated"));
    navigate("/login");
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const text = searchText.trim();

      if (!text) {
        setSearchResults([]);
        return;
      }

      try {
        const results = await searchUsers(text);
        setSearchResults(results);
        setIsSearchOpen(true);
      } catch {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchText]);

  const getSearchAvatar = (searchUser) => {
    return getImageUrl(
      searchUser?.profileImage &&
        searchUser.profileImage !== "/uploads/default-avatar.png"
        ? searchUser.profileImage
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            searchUser?.username || "User"
          )}`
    );
  };

  const handleOpenUser = (id) => {
    setSearchText("");
    setSearchResults([]);
    setIsSearchOpen(false);
    navigate(`/users/${id}`);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logoImage} alt="LalluGram Logo" className="logo-image" />
        <span className="logo-text">LalluGram</span>
      </div>

      <div className="navbar-search-wrap">
        <input
          type="text"
          placeholder="Search users..."
          className="search"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          onBlur={() => {
            setTimeout(() => setIsSearchOpen(false), 150);
          }}
        />

        {isSearchOpen && searchText.trim() && (
          <div className="navbar-search-results">
            {searchResults.length > 0 ? (
              searchResults.map((searchUser) => (
                <button
                  key={searchUser._id}
                  type="button"
                  className="navbar-search-user"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleOpenUser(searchUser._id)}
                >
                  <img
                    src={getSearchAvatar(searchUser)}
                    alt={searchUser.username}
                  />
                  <span>
                    <strong>{searchUser.username}</strong>
                    <small>{searchUser.email}</small>
                  </span>
                </button>
              ))
            ) : (
              <p className="navbar-search-empty">No users found</p>
            )}
          </div>
        )}
      </div>

      <div className="menu">
        <span className="menu-item" onClick={() => navigate("/")}>
          <FiHome />
        </span>

        <span
          className="menu-item"
          onClick={() => navigate("/chat")}
        >
          <FiMessageCircle />
        </span>

        <span
          className="menu-item saved"
          onClick={() => navigate("/saved")}
        >
          <span className="saved-icon">
            <FiBookmark />
          </span>
          <span className="saved-text">Saved</span>
        </span>

        <span
          className="menu-item bell"
          onClick={() => navigate("/notifications")}
        >
          <FiBell />
          {unreadCount > 0 && (
            <span className="badge">{unreadCount}</span>
          )}
        </span>

        <span className="menu-item navbar-user">
          <img src={navbarAvatar} alt="" className="navbar-avatar" />
          <span className="navbar-username">
            {user?.username || "Guest"}
          </span>
        </span>

        <span className="menu-item logout" onClick={handleLogout}>
          <FiLogOut />
          <span className="logout-text">Logout</span>
        </span>
      </div>
    </nav>
  );
}