import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBookmark,
  FiCheckCircle,
  FiTrash2,
  FiHeart,
  FiMessageCircle,
  FiMoreVertical,
  FiSend,
} from "react-icons/fi";
import { deletePost, likePost } from "../services/postService";
import { addComment, deleteComment, getComments } from "../services/commentService";
import { toggleSavePost } from "../services/userService";
import { getConversations, sendMessageToUser } from "../services/chatService";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/postcard.css";
  

export default function PostCard({ post, initiallySaved = false, onDelete }) {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isSaved, setIsSaved] = useState(initiallySaved);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [sharingTo, setSharingTo] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const imageSrc = getImageUrl(post.image);

  const isVideoPost =
    post.mediaType === "video" ||
    /\.(mp4|mov|webm|m4v)(\?.*)?$/i.test(post.image || "");

  const avatarSrc = getImageUrl(
    post.profileImage ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        post.username || "User"
      )}`
  );

  const postOwnerId = typeof post.user === "string" ? post.user : post.user?._id;
  const selfUserId = user?._id || user?.id;
  const isOwnPost = String(postOwnerId || "") === String(selfUserId || "");
  const userAlreadyLiked = post.likes?.some((id) => String(id) === String(selfUserId));
  const [isLiked, setIsLiked] = useState(Boolean(userAlreadyLiked));

  useEffect(() => {
    getComments(post._id)
      .then((data) => setComments(data))
      .catch(() => setComments([]));
  }, [post._id]);

  const handleLike = async () => {
    const res = await likePost(post._id);
    setLikes(res.likes);
    setIsLiked(res.liked);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      return;
    }

    try {
      const newComment = await addComment(post._id, commentText);
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleSave = async () => {
    try {
      const res = await toggleSavePost(post._id);
      setIsSaved(res.saved);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save post");
    }
  };

  const handleOpenProfile = () => {
    if (!postOwnerId) {
      return;
    }

    navigate(`/users/${postOwnerId}`);
  };

  const handleOpenShare = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      setShowShareModal(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load chats");
    }
  };

  const handleShareToChat = async (peerId) => {
    if (!peerId) {
      return;
    }

    setSharingTo(peerId);
    const mediaLabel = isVideoPost ? "reel" : "post";
    const shareText = [
      "[LALLUGRAM_SHARE]",
      mediaLabel,
      post.username || "User",
      post.caption || "",
      imageSrc,
    ].join("|");

    try {
      await sendMessageToUser(peerId, shareText);
      setShowShareModal(false);
      alert("Shared to chat");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to share to chat");
    } finally {
      setSharingTo("");
    }
  };

  const handleDeletePost = async () => {
    const ok = window.confirm("Delete this post?");
    if (!ok) {
      return;
    }

    try {
      await deletePost(post._id);
      setShowPostMenu(false);
      if (typeof onDelete === "function") {
        onDelete(post._id);
      }
      alert("Post deleted");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post");
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="user-info">
          <img
            src={avatarSrc}
            alt=""
            className="avatar avatar-clickable"
            onClick={handleOpenProfile}
            title="View profile"
          />
          <div>
            <h4>{post.username}</h4>
            <small>{new Date(post.createdAt).toLocaleString()}</small>
          </div>
        </div>
        {isOwnPost ? (
          <div className="post-menu-wrap">
            <button
              className="menu-btn"
              aria-label="Post menu"
              onClick={() => setShowPostMenu((prev) => !prev)}
            >
              <FiMoreVertical />
            </button>

            {showPostMenu ? (
              <div className="post-menu-dropdown">
                <button type="button" className="post-menu-item danger" onClick={handleDeletePost}>
                  <FiTrash2 /> Delete
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {isVideoPost ? (
        <video src={imageSrc} className="post-image" controls preload="metadata" />
      ) : (
        <img src={imageSrc} alt="" className="post-image" />
      )}

      <div className="post-actions">
        <div className="left-actions">
          <span
            className={`like-action${isLiked ? " liked" : ""}`}
            onClick={handleLike}
          >
            <FiHeart /> {likes}
          </span>
          <span onClick={() => setShowComments((prev) => !prev)}>
            <FiMessageCircle />
          </span>
          <span onClick={handleOpenShare}>
            <FiSend />
          </span>
        </div>
        <span className="save-action" onClick={handleSave}>
          {isSaved ? (
            <>
              <FiCheckCircle /> Saved
            </>
          ) : (
            <FiBookmark />
          )}
        </span>
      </div>

      {showShareModal ? (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div
            className="share-modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h4>Share to Chat</h4>

            {conversations.length === 0 ? (
              <p className="share-empty">No conversations yet.</p>
            ) : (
              <div className="share-list">
                {conversations.map((item) => (
                  <button
                    key={item.user._id}
                    type="button"
                    className="share-item"
                    disabled={sharingTo === item.user._id}
                    onClick={() => handleShareToChat(item.user._id)}
                  >
                    <img
                      src={getImageUrl(
                        item.user?.profileImage && item.user.profileImage !== "/uploads/default-avatar.png"
                          ? item.user.profileImage
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              item.user?.username || "User"
                            )}`
                      )}
                      alt={item.user.username}
                      className="share-avatar"
                    />
                    <span>{item.user.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="post-body">
        <p className={`likes${isLiked ? " liked" : ""}`}>
          <FiHeart /> {likes} Likes
        </p>
        <p>
          <strong>{post.username}</strong> {post.caption}
        </p>

        {showComments ? (
          <div className="comment-panel">
            <div className="comments">
              {comments.map((comment) => (
                <div key={comment._id} className="comment-row">
                  <p>
                    <strong>{comment.username}</strong> {comment.text}
                  </p>
                  {user && (comment.user === user._id || comment.user === user.id) ? (
                    <button
                      type="button"
                      className="comment-delete"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <form className="comment-form" onSubmit={handleAddComment}>
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
