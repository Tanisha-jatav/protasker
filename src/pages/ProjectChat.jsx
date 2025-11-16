import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../api/axios";

function ProjectChat() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const userRef = useRef(null);

  // Initialize socket safely
  const socket = useMemo(
    () =>
      io("http://localhost:5001", {
        autoConnect: false,
      }),
    []
  );

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initial setup (fetch + connect socket)
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate(`/login?redirect=/project/${projectId}`);
        return;
      }

      let user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user._id) {
        try {
          const res = await API.get("/auth/me");
          user = res.data?.user;
          localStorage.setItem("user", JSON.stringify(user));
        } catch {
          navigate(`/login?redirect=/project/${projectId}`);
          return;
        }
      }

      userRef.current = user;

      // Join project in DB
      try {
        await API.post(`/projects/${projectId}/join`);
      } catch (err) {
        console.error("Join error:", err);
      }

      // Socket setup
      socket.connect();
      socket.emit("joinProject", projectId, user.name);

      // Clean old listeners
      socket.removeAllListeners();

      socket.on("receiveMessage", (data) => {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === data._id);
          return exists ? prev : [...prev, data];
        });
      });

      socket.on("userJoined", ({ userName }) => {
        setOnlineUsers((prev) => [...new Set([...prev, userName])]);
        setMessages((prev) => [
          ...prev,
          { type: "system", text: `👋 ${userName} joined the chat.` },
        ]);
      });

      socket.on("userLeft", ({ userName }) => {
        setOnlineUsers((prev) => prev.filter((n) => n !== userName));
        setMessages((prev) => [
          ...prev,
          { type: "system", text: `👋 ${userName} left the chat.` },
        ]);
      });

      socket.on("messageDeleted", (messageId) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, deleted: true, text: "🗑️ This message was deleted" }
              : msg
          )
        );
      });

      await fetchMessages();
    };

    init();

    return () => {
      socket.emit("leaveProject", projectId, userRef.current?.name);
      socket.disconnect();
    };
  }, [projectId]);

  // Fetch previous messages
  const fetchMessages = async () => {
    try {
      const res = await API.get(`/projects/${projectId}/messages`);
      setMessages(res.data.messages || []);
    } catch {
      console.error("Error fetching messages");
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  // Send text message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const payload = {
      projectId,
      sender: userRef.current,
      text: newMessage,
      type: "text",
      createdAt: new Date().toISOString(),
    };

    socket.emit("sendMessage", payload);
    setNewMessage("");

    try {
      await API.post(`/projects/${projectId}/messages`, { text: newMessage });
    } catch (err) {
      console.error("Error saving message:", err);
    }
  };

  // Delete message
  const deleteMessage = async (id) => {
    try {
      await API.delete(`/projects/${projectId}/messages/${id}`);
      socket.emit("deleteMessage", { projectId, messageId: id });
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === id
            ? { ...msg, deleted: true, text: "🗑️ This message was deleted" }
            : msg
        )
      );
    } catch {
      alert("Failed to delete message");
    }
  };

  // Send image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      const payload = {
        projectId,
        sender: userRef.current,
        image: base64,
        type: "image",
        createdAt: new Date().toISOString(),
      };
      socket.emit("sendMessage", payload);
      try {
        await API.post(`/projects/${projectId}/messages`, { image: base64 });
      } catch {
        console.error("Image upload failed");
      }
    };
    reader.readAsDataURL(file);
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Auto scroll whenever new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <Navbar />
      <div className="flex bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen pt-20">
        <Sidebar />

        <div className="flex-1 ml-64 flex flex-col p-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">💬 Project Chat</h1>
            <div className="text-sm text-gray-600">👥 {onlineUsers.length} online</div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 bg-white rounded-2xl shadow-inner p-5 overflow-y-auto">
            {loading ? (
              <p className="text-center text-gray-500">Loading chat…</p>
            ) : (
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg._id || Math.random()}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mb-3 ${
                      msg.sender?._id === userRef.current?._id ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.type === "system" ? (
                      <p className="text-gray-500 text-center italic">{msg.text}</p>
                    ) : (
                      <div
                        className={`inline-block p-3 rounded-xl max-w-md break-words ${
                          msg.sender?._id === userRef.current?._id
                            ? "bg-purple-600 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        <div className="text-xs mb-1 opacity-70">
                          {msg.sender?.name} • {formatTime(msg.createdAt)}
                        </div>
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="sent"
                            className="rounded-md max-w-xs mt-1"
                          />
                        )}
                        <p>{msg.text}</p>
                        {msg.sender?._id === userRef.current?._id && !msg.deleted && (
                          <button
                            onClick={() => deleteMessage(msg._id)}
                            className="ml-2 text-xs text-red-300 hover:text-red-500"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="flex items-center gap-3 mt-4 relative">
            <button
              type="button"
              className="bg-white border border-gray-300 rounded-full p-2 text-xl"
              onClick={() => setShowEmoji((s) => !s)}
            >
              😀
            </button>

            {showEmoji && (
              <div className="absolute bottom-16 left-0 z-50">
                <EmojiPicker onEmojiClick={(e) => setNewMessage((prev) => prev + e.emoji)} />
              </div>
            )}

            <label className="bg-white border border-gray-300 rounded-full p-2 cursor-pointer">
              📎
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>

            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message..."
              className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-purple-400"
            />
            <button className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700">
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ProjectChat;
