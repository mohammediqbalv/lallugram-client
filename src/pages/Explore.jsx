import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getExplorePosts } from "../services/postService";
import "../styles/explore.css";

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await getExplorePosts();
      setPosts(data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load explore posts");
    }
  };

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
      <div className="explore-page">
        <h1>Explore</h1>

        <div className="explore-grid">
          {posts.map((post) => (
            isVideoPost(post) ? (
              <video
                key={post._id}
                src={getImageSrc(post.image)}
                className="explore-image"
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
                className="explore-image"
                onClick={() => setSelectedPost(post)}
              />
            )
          ))}
        </div>

        {selectedPost ? (
          <div className="explore-overlay" onClick={() => setSelectedPost(null)}>
            <div
              className="explore-modal"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {isVideoPost(selectedPost) ? (
                <video
                  src={getImageSrc(selectedPost.image)}
                  className="explore-full-image"
                  controls
                  autoPlay
                />
              ) : (
                <img src={getImageSrc(selectedPost.image)} alt="" className="explore-full-image" />
              )}
              <div className="explore-meta">
                <strong>{selectedPost.user?.username || selectedPost.username || "User"}</strong>
                <p>{selectedPost.caption}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
