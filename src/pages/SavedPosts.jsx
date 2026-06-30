import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getSavedPosts } from "../services/userService";
import "../styles/saved.css";

export default function SavedPosts() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const loadSavedPosts = async () => {
      try {
        const data = await getSavedPosts();
        setPosts(data);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load saved posts");
      }
    };

    loadSavedPosts();
  }, []);

  const getImageSrc = (image) => {
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

  return (
    <MainLayout>
      <div className="saved-page">
        <h1>Saved Posts</h1>

        {posts.length === 0 ? (
          <p className="saved-empty">No saved posts yet.</p>
        ) : (
          <div className="saved-grid">
            {posts.map((post) => (
              isVideoPost(post) ? (
                <video
                  key={post._id}
                  src={getImageSrc(post.image)}
                  className="saved-image"
                  onClick={() => setSelectedPost(post)}
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  key={post._id}
                  src={getImageSrc(post.image)}
                  alt=""
                  className="saved-image"
                  onClick={() => setSelectedPost(post)}
                />
              )
            ))}
          </div>
        )}

        {selectedPost ? (
          <div className="saved-overlay" onClick={() => setSelectedPost(null)}>
            <div
              className="saved-modal"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {isVideoPost(selectedPost) ? (
                <video
                  src={getImageSrc(selectedPost.image)}
                  className="saved-full-image"
                  controls
                  autoPlay
                />
              ) : (
                <img src={getImageSrc(selectedPost.image)} alt="" className="saved-full-image" />
              )}
              <div className="saved-meta">
                <strong>{selectedPost.username || selectedPost.user?.username || "User"}</strong>
                <p>{selectedPost.caption}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
