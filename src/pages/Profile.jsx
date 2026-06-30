import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getProfile } from "../services/userService";
import { deletePost } from "../services/postService";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [selectedPostMedia, setSelectedPostMedia] = useState(null);
  const [pendingDeletePostId, setPendingDeletePostId] = useState(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load profile");
    }
  };

  if (!profile) {
    return <h2>Loading...</h2>;
  }

  const profileImage = getImageUrl(
    profile.user.profileImage &&
      profile.user.profileImage !== "/uploads/default-avatar.png"
      ? profile.user.profileImage
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          profile.user.username || "User"
        )}`
  );

  const getPostImageSrc = (image) => {
    return getImageUrl(image);
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
    return getImageUrl(
      user?.profileImage && user.profileImage !== "/uploads/default-avatar.png"
        ? user.profileImage
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user?.username || "User"
          )}`
    );
  };

  const handleDeletePost = async (postId) => {
    setPendingDeletePostId(postId);
  };

  const confirmDeletePost = async () => {
    if (!pendingDeletePostId) {
      return;
    }

    setIsDeletingPost(true);
    try {
      await deletePost(pendingDeletePostId);
      setProfile((prev) => {
        const updatedPosts = prev.posts.filter((post) => post._id !== pendingDeletePostId);
        return {
          ...prev,
          posts: updatedPosts,
          postCount: updatedPosts.length,
        };
      });
      setPendingDeletePostId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete photo");
    } finally {
      setIsDeletingPost(false);
    }
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

            <button className="edit-btn" onClick={() => navigate("/edit-profile")}>
              Edit Profile
            </button>
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

          <div
            className="stat-clickable"
            role="button"
            tabIndex={0}
            onClick={() => setShowFollowing(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setShowFollowing(true);
              }
            }}
          >
            <h2>{profile.user.following?.length || 0}</h2>
            <p>Following</p>
          </div>

          <div
            className="stat-clickable"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/saved")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate("/saved");
              }
            }}
          >
            <h2>{profile.user.savedPosts?.length || 0}</h2>
            <p>Saved</p>
          </div>
        </div>

        <h2 className="my-posts">My Posts</h2>

        <div className="grid">
          {profile.posts.map((post) => {
            const postImageSrc = getPostImageSrc(post.image);
            const isVideo = isVideoPost(post);

            return (
              <div key={post._id} className="profile-post-card">
                <button
                  type="button"
                  className="post-delete-btn"
                  onClick={() => handleDeletePost(post._id)}
                >
                  Delete
                </button>
                {isVideo ? (
                  <video
                    src={postImageSrc}
                    className="profile-post-image"
                    onClick={() =>
                      setSelectedPostMedia({ src: postImageSrc, type: "video" })
                    }
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={postImageSrc}
                    alt=""
                    className="profile-post-image"
                    onClick={() =>
                      setSelectedPostMedia({ src: postImageSrc, type: "image" })
                    }
                  />
                )}
              </div>
            );
          })}
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

        {showFollowing ? (
          <div className="profile-modal-overlay" onClick={() => setShowFollowing(false)}>
            <div
              className="profile-modal"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <h3>Following</h3>

              {profile.user.following?.length ? (
                <div className="connection-list">
                  {profile.user.following.map((followingUser) => (
                    <div key={followingUser._id} className="connection-item">
                      <img
                        src={getConnectionAvatar(followingUser)}
                        alt={followingUser.username}
                        className="connection-avatar"
                      />
                      <div>
                        <strong>{followingUser.username}</strong>
                        <p>{followingUser.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You are not following anyone yet.</p>
              )}

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowFollowing(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {selectedPostMedia ? (
          <div className="profile-modal-overlay" onClick={() => setSelectedPostMedia(null)}>
            <div
              className="image-preview-modal"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {selectedPostMedia.type === "video" ? (
                <video src={selectedPostMedia.src} className="image-preview-full" controls autoPlay />
              ) : (
                <img src={selectedPostMedia.src} alt="" className="image-preview-full" />
              )}
            </div>
          </div>
        ) : null}

        {pendingDeletePostId ? (
          <div className="profile-modal-overlay" onClick={() => setPendingDeletePostId(null)}>
            <div
              className="delete-confirm-modal"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="delete-confirm-icon">!</div>
              <h3>Delete photo?</h3>
              <p>This photo will be removed from your profile.</p>
              <div className="delete-confirm-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setPendingDeletePostId(null)}
                  disabled={isDeletingPost}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="delete-confirm-btn"
                  onClick={confirmDeletePost}
                  disabled={isDeletingPost}
                >
                  {isDeletingPost ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
