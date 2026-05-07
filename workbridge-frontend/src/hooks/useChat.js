import { useState, useEffect } from "react";
import { getSocket } from "../services/socket";

export function useChat(otherUserId) {
  const [messages, setMessages] = useState([]);
  const socket = getSocket();

  useEffect(() => {
    if (!otherUserId) return;
    socket.emit("join_chat", { otherUserId });
    socket.emit("get_messages", { otherUserId });
    socket.on("messages", setMessages);
    socket.on("new_message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("error", (e) => console.error("Socket error:", e));
    socket.on("message_read", ({ messageId, readAt }) => {
  setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isRead: true, readAt } : m));
   });
    return () => {
      socket.off("messages");
      socket.off("new_message");
      socket.off("error");
      socket.off("message_read");
    };
  }, [otherUserId]);
  const markRead = (messageId) => socket.emit("mark_read", { messageId });

  const send = (receiverId, text) => {
    socket.emit("send_message", { receiverId, text });
  };

  return { messages, send, markRead };
}