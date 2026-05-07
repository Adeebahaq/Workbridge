import { useState, useEffect } from "react";
import { getSocket } from "../services/socket";

export function useChat(jobId) {
  const [messages, setMessages] = useState([]);
  const socket = getSocket();

  useEffect(() => {
    if (!jobId) return;
    socket.emit("join_job", jobId);
    socket.emit("get_messages", jobId);
    socket.on("messages", setMessages);
    socket.on("new_message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("error", (e) => console.error("Socket error:", e));

    return () => {
      socket.off("messages");
      socket.off("new_message");
      socket.off("error");
    };
  }, [jobId]);

  const send = (receiverId, text) => {
    socket.emit("send_message", { jobId, receiverId, text });
  };

  return { messages, send };
}