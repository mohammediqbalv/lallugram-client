import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getUserProfileById } from "../services/userService";
import "../styles/profile.css";

export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [showFollowers, setShowFollowers] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserProfileById(id);
        setProfile(data);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load user profile");
      }
    };

    loadProfile();
  }, [id]);

  if (!profile) {
    return <h2>Loading...</h2>;
  }

  const hasCustomProfileImage =
    profile.user.profileImage &&
    profile.user.profileImage !== "/uploads/default-avatar.png";

  const profileImage = hasCustomProfileImage
    ? `http://localhost:5000${profile.user.profileImage}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        profile.user.username || "User"
      )}`;

  const getPostImageSrc = (image) => {
    if (!image) {
      return "";
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/uploads/")) {
      return `http://localhost:5000${image}`;
    }

    return `http://localhost:5000/uploads/${image}`;
  };

  const isVideoPost = (post) => {
    if (!post) {
      return false;
    }

    return (
      post.mediaType === "video" ||
      /\.(mp4|mov|webm|m4v)(\?.*)?$/i.test(post.image || "")
    );
  };

  const getConnectionAvatar = (user) => {
    if (user?.profileImage && user.profileImage !== "/uploads/default-avatar.png") {
      return `http://localhost:5000${user.profileImage}`;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.username || "User"
    )}`;
  };

  return (
    <MainLayout>
      <div className="profile-container">
        <div className="profile-header">
          <img src={profileImage} className="profile-avatar" alt="" />

          <div>
            <h1>{profile.user.username}</h1>
            <p>{profile.user.email}</p>
            <p>{profile.user.bio || "No bio yet."}</p>
          </div>
        </div>

        <div className="stats">
          <div>
            <h2>{profile.postCount}</h2>
            <p>Posts</p>
          </div>

          <div
            className="stat-clickable"
            role="button"
            tabIndex={0}
            onClick={() => setShowFollowers(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setShowFollowers(true);
              }
            }}
          >
            <h2>{profile.user.followers?.length || 0}</h2>
            <p>Followers</p>
          </div>

          <div>
            <h2>{profile.user.following?.length || 0}</h2>
            <p>Following</p>
          </div>
        </div>

        <h2 className="my-posts">Posts</h2>

        <div className="grid">
          {profile.posts.map((post) => (
            <div key={post._id} className="profile-post-card">
              {isVideoPost(post) ? (
                <video
                  src={getPostImageSrc(post.image)}
                  className="profile-post-image"
                  controls
                  preload="metadata"
                />
              ) : (
                <img src={getPostImageSrc(post.image)} alt="" className="profile-post-image" />
              )}
            </div>
          ))}
        </div>

        {showFollowers ? (
          <div className="profile-modal-overlay" onClick={() => setShowFollowers(false)}>
            <div
              className="profile-modal"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <h3>Followers</h3>

              {profile.user.followers?.length ? (
                <div className="connection-list">
                  {profile.user.followers.map((follower) => (
                    <div key={follower._id} className="connection-item">
                      <img
                        src={getConnectionAvatar(follower)}
                        alt={follower.username}
                        className="connection-avatar"
                      />
                      <div>
                        <strong>{follower.username}</strong>
                        <p>{follower.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No followers yet.</p>
              )}

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowFollowers(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
