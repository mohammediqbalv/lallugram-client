import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "./PostCard";
import { getSavedPosts } from "../services/userService";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsRes, saved] = await Promise.all([
          axios.get("http://localhost:5000/api/posts"),
          getSavedPosts(),
        ]);

        setPosts(postsRes.data);
        setSavedPostIds(new Set(saved.map((post) => post._id)));
      } catch {
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
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          initiallySaved={savedPostIds.has(post._id)}
          onDelete={handlePostDeleted}
        />
      ))}
    </div>
  );
}
