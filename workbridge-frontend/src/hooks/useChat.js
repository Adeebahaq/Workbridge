import { useState, useEffect, useRef } from "react";
import { getSocket } from "../services/socket";

const messageCache = {};

export function useChat(otherUserId, currentUserId) {
  const [messages, setMessages] = useState(
    otherUserId ? (messageCache[otherUserId] || []) : []
  );
  const socket = getSocket();

  const updateMessages = (updater, key) => {
    setMessages(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (key) messageCache[key] = next;
      return next;
    });
  };

  useEffect(() => {
    if (!otherUserId) return;

    // load from cache instantly
    if (messageCache[otherUserId]) {
      setMessages(messageCache[otherUserId]);
    }

    socket.emit("join_chat", { otherUserId });
    socket.emit("get_messages", { otherUserId });

    socket.on("messages", (serverMsgs) => {
      messageCache[otherUserId] = serverMsgs;
      setMessages(serverMsgs);
    });

    socket.on("new_message", (msg) => {
      setMessages(prev => {
        // AFTER
      const filtered = prev.filter(m => {
        if (m._id?.toString().length <= 15 && m.senderId === currentUserId) {
          if (m.messageType === "voice" && msg.messageType === "voice") return false;
          if (m.text && m.text === msg.text) return false;
        }
        return true;
      });
        if (filtered.find(m => m._id === msg._id)) {
          messageCache[otherUserId] = filtered;
          return filtered;
        }
        const next = [...filtered, msg];
        messageCache[otherUserId] = next;
        return next;
      });
    });

    socket.on("message_read", ({ messageId, readAt }) => {
      setMessages(prev => {
        const next = prev.map(m => m._id === messageId ? { ...m, isRead: true, readAt } : m);
        messageCache[otherUserId] = next;
        return next;
      });
    });

    socket.on("error", (e) => console.error("Socket error:", e));

    return () => {
      socket.off("messages");
      socket.off("new_message");
      socket.off("message_read");
      socket.off("error");
    };
  }, [otherUserId]);

  const markRead = (messageId) => socket.emit("mark_read", { messageId });

  const sendVoice = (receiverId, audioUrl, duration) => {
  const optimistic = {
    _id: Date.now().toString(),
    senderId: currentUserId,
    receiverId,
    audioUrl,
    duration,
    messageType: "voice",
    sentAt: new Date(),
    isRead: false,
  };
  setMessages(prev => {
    const next = [...prev, optimistic];
    messageCache[otherUserId] = next;
    return next;
  });
  socket.emit("send_message", { receiverId, audioUrl, duration, messageType: "voice" });
};


  const send = (receiverId, text) => {
    const optimistic = {
      _id: Date.now().toString(),
      senderId: currentUserId,
      receiverId,
      text,
      sentAt: new Date(),
      isRead: false,
    };
    setMessages(prev => {
      const next = [...prev, optimistic];
      messageCache[otherUserId] = next;
      return next;
    });
    socket.emit("send_message", { receiverId, text });
  };

return { messages, send, markRead, sendVoice };
}