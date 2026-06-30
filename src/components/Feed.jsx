import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import api from "../services/api";
import { getSavedPosts } from "../services/userService";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsRes, saved] = await Promise.all([
          api.get("/posts"),
          getSavedPosts(),
        ]);

        setPosts(postsRes.data);
        setSavedPostIds(new Set(saved.map((post) => post._id)));
      } catch (err) {
        console.error("Failed to load posts:", err);
        setPosts([]);
        setSavedPostIds(new Set());
      }
    };

    loadData();
  }, []);

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));

    setSavedPostIds((prev) => {
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
  };

  return (
    <div>
      <h2 className="feed-title">Latest Posts</h2>

      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            initiallySaved={savedPostIds.has(post._id)}
            onDelete={handlePostDeleted}
          />
        ))
      )}
    </div>
  );
}