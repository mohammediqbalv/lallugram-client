import "../styles/sidebar.css";
import { Link } from "react-router-dom";
import {
  FiCompass,
  FiHome,
  FiMessageCircle,
  FiPlusCircle,
  FiSearch,
  FiUser,
} from "react-icons/fi";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <Link to="/" className="item">
        <FiHome /> Home
      </Link>
      <Link to="/create" className="item">
        <FiPlusCircle /> Create Post
      </Link>
      <Link to="/profile" className="item">
        <FiUser /> Profile
      </Link>
      <Link to="/search" className="item">
        <FiSearch /> Search
      </Link>
      <Link to="/chat" className="item">
        <FiMessageCircle /> Chat
      </Link>
      <Link to="/explore" className="item">
        <FiCompass /> Explore
      </Link>
    </div>
  );
}
