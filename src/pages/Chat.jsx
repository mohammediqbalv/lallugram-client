import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiMessageSquare, FiSearch, FiSend } from "react-icons/fi";
import MainLayout from "../layouts/MainLayout";
import { searchUsers } from "../services/userService";
import {
  getConversations,
  getMessagesWithUser,
  sendMessageToUser,
} from "../services/chatService";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/chat.css";

const getAvatar = (user) => {
  return getImageUrl(
    user?.profileImage && user.profileImage !== "/uploads/default-avatar.png"
      ? user.profileImage
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user?.username || "User"
        )}`
  );
};

const parseSharedMessage = (text) => {
  const raw = String(text || "");

  if (raw.startsWith("[LALLUGRAM_SHARE]|")) {
    const [, mediaType, username, caption, mediaUrl] = raw.split("|");
    if (mediaUrl) {
      return {
        type: "shared",
        mediaType: mediaType === "reel" ? "video" : "image",
        username: username || "User",
        caption: caption || "",
        mediaUrl,
      };
    }
  }

  const legacy = raw.match(/^Check this\s+(post|reel)\s+from\s+(.+?):\s*([\s\S]*?)\n(https?:\/\/\S+)$/i);
  if (legacy) {
    return {
      type: "shared",
      mediaType: legacy[1].toLowerCase() === "reel" ? "video" : "image",
      username: legacy[2] || "User",
      caption: legacy[3] || "",
      mediaUrl: legacy[4],
    };
  }

  return null;
};

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobilePanel, setMobilePanel] = useState("list");

  const selfUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      if (!activeUser && data.length > 0) {
        setActiveUser(data[0].user);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load chats");
    }
  };

  const loadMessages = async (userId) => {
    if (!userId) {
      return;
    }

    setLoadingMessages(true);
    try {
      const data = await getMessagesWithUser(userId);
      setMessages(data.messages || []);
      setActiveUser(data.user || null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!activeUser?._id) {
      return;
    }

    loadMessages(activeUser._id);

    const intervalId = setInterval(() => {
      loadMessages(activeUser._id);
      loadConversations();
    }, 7000);

    return () => clearInterval(intervalId);
  }, [activeUser?._id]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const text = query.trim();
      if (!text) {
        setSearchResults([]);
        return;
      }

      try {
        const users = await searchUsers(text);
        const filtered = users.filter(
          (u) => String(u._id) !== String(selfUser?._id || selfUser?.id)
        );
        setSearchResults(filtered);
      } catch {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, selfUser?._id, selfUser?.id]);

  const handleStartChat = async (user) => {
    setActiveUser(user);
    setQuery("");
    setSearchResults([]);

    const exists = conversations.some((c) => String(c.user._id) === String(user._id));
    if (!exists) {
      setConversations((prev) => [
        {
          user,
          lastMessage: { text: "", sender: null, createdAt: null },
          unreadCount: 0,
        },
        ...prev,
      ]);
    }

    await loadMessages(user._id);
    setMobilePanel("chat");
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeUser?._id) {
      return;
    }

    try {
      const sent = await sendMessageToUser(activeUser._id, text);
      setMessages((prev) => [...prev, sent]);
      setDraft("");
      loadConversations();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send message");
    }
  };

  return (
    <MainLayout>
      <div className="chat-page">
        <aside className={`chat-sidebar ${mobilePanel === "chat" ? "mobile-hidden" : ""}`}>
          <div className="chat-sidebar-top">
            <h2>
              <FiMessageSquare /> Chats
            </h2>
            <div className="chat-search-wrap">
              <FiSearch className="chat-search-icon" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
              />
            </div>
            {searchResults.length > 0 ? (
              <div className="chat-search-results">
                {searchResults.map((user) => (
                  <button
                    type="button"
                    key={user._id}
                    className="chat-search-user"
                    onClick={() => handleStartChat(user)}
                  >
                    <img src={getAvatar(user)} alt={user.username} />
                    <span>{user.username}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="chat-conversation-list">
            {conversations.length === 0 ? (
              <p className="chat-empty">No conversations yet.</p>
            ) : (
              conversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.user._id}
                  className={`chat-conversation-item ${
                    String(activeUser?._id) === String(conversation.user._id) ? "active" : ""
                  }`}
                  onClick={() => handleStartChat(conversation.user)}
                >
                  <img
                    src={getAvatar(conversation.user)}
                    alt={conversation.user.username}
                    className="chat-conversation-avatar"
                  />
                  <div className="chat-conversation-meta">
                    <p className="chat-conversation-name">{conversation.user.username}</p>
                    <p className="chat-conversation-last">
                      {conversation.lastMessage?.text || "Start a conversation"}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 ? (
                    <span className="chat-unread-badge">{conversation.unreadCount}</span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </aside>

        <section className={`chat-main ${mobilePanel === "list" ? "mobile-hidden" : ""}`}>
          {!activeUser ? (
            <div className="chat-placeholder">
              <FiMessageSquare />
              <p>Select a user to start chatting</p>
            </div>
          ) : (
            <>
              <header className="chat-main-header">
                <button
                  type="button"
                  className="chat-mobile-back"
                  onClick={() => setMobilePanel("list")}
                  aria-label="Back to chats"
                >
                  <FiChevronLeft />
                </button>
                <img src={getAvatar(activeUser)} alt={activeUser.username} />
                <div>
                  <h3>{activeUser.username}</h3>
                  <small>Online</small>
                </div>
              </header>

              <div className="chat-messages">
                {loadingMessages ? (
                  <p className="chat-loading">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="chat-empty">No messages yet. Say hello.</p>
                ) : (
                  messages.map((message) => {
                    const senderId = message.sender?._id || message.sender;
                    const isMine = String(senderId) === String(selfUser?._id || selfUser?.id);
                    const shared = parseSharedMessage(message.text);

                    return (
                      <div
                        key={message._id}
                        className={`chat-bubble-row ${isMine ? "mine" : "theirs"}`}
                      >
                        <div className="chat-bubble">
                          {shared ? (
                            <div className="chat-shared-card">
                              <p className="chat-shared-label">Shared {shared.mediaType === "video" ? "reel" : "post"}</p>
                              <p className="chat-shared-author">@{shared.username}</p>
                              {shared.mediaType === "video" ? (
                                <video
                                  src={shared.mediaUrl}
                                  className="chat-shared-media"
                                  controls
                                  preload="metadata"
                                />
                              ) : (
                                <img src={shared.mediaUrl} alt={shared.caption} className="chat-shared-media" />
                              )}
                              {shared.caption ? <p className="chat-shared-caption">{shared.caption}</p> : null}
                            </div>
                          ) : (
                            <p>{message.text}</p>
                          )}
                          <small>{new Date(message.createdAt).toLocaleTimeString()}</small>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form className="chat-compose" onSubmit={handleSend}>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit" aria-label="Send message">
                  <FiSend />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
