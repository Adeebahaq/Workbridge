import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../hooks/useAuth";
import { useJobManagement } from "../../hooks/useJobManagement";
import {
  Send, Mic, MicOff, Play, Trash2, ArrowLeft,
  MessageSquare, CheckCheck, Check,
} from "lucide-react";

function fmtTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
}

export default function WorkerChat() {
  const { jobId }             = useParams();
  const navigate              = useNavigate();
  const { user }              = useAuth();
  const { jobs, fetchJobs }   = useJobManagement();

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL]   = useState(null);
  const mediaRecorderRef          = useRef(null);
  const chunksRef                 = useRef([]);

  const [text, setText]           = useState("");
  const [activeJob, setActiveJob] = useState(jobId || null);
  const bottomRef                 = useRef(null);

  useEffect(() => { fetchJobs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chatJobs = jobs.filter((j) =>
    ["Accepted", "In Progress", "Awaiting Confirmation", "Completed"].includes(j.status)
  );

  const seenEmployers  = new Set();
  const uniqueChatJobs = chatJobs.filter((j) => {
    const eid = String(j.employerId?._id || j.employerId);
    if (seenEmployers.has(eid)) return false;
    seenEmployers.add(eid);
    return true;
  });

  const currentJob    = chatJobs.find((j) => j._id === activeJob);
  const employerId    = currentJob?.employerId?._id || currentJob?.employerId;
  const currentUserId = String(user?.userId || user?.id || user?._id || "");

  const { messages, send, markRead, sendVoice } = useChat(
    employerId ? String(employerId) : "",
    currentUserId
  );

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    messages
      .filter((m) => !m.isRead && String(m.receiverId) === currentUserId)
      .forEach((m) => markRead(m._id));
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = () => {
    if (!text.trim() || !activeJob) return;
    send(String(employerId), text.trim());
    setText("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus" : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus" : "audio/mp4";
        const blob = new Blob(chunksRef.current, { type: mime });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (err) { console.error("Microphone access denied:", err); }
  };

  const stopRecording    = () => { mediaRecorderRef.current?.stop(); setRecording(false); };
  const discardRecording = () => { setAudioBlob(null); setAudioURL(null); };

  const getAudioDuration = (blob) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const ctx    = new AudioContext();
          const buffer = await ctx.decodeAudioData(e.target.result);
          resolve(Math.round(buffer.duration));
          ctx.close();
        } catch { resolve(0); }
      };
      reader.readAsArrayBuffer(blob);
    });

  const sendVoiceMessage = async () => {
    if (!audioBlob || !employerId) return;
    const duration = await getAudioDuration(audioBlob);
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload/audio`, {
        method: "POST",
        body: formData,
      });
      const { url } = await res.json();
      const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
      const fullUrl = url.startsWith("http") ? url : `${apiBase}${url}`;
      sendVoice(String(employerId), fullUrl, duration);
      setAudioBlob(null);
      setAudioURL(null);
    } catch (err) { console.error("Voice upload failed:", err); }
  };

  const getEmployerName = (job) => {
    const name = job.employerId?.fullName || job.employerId?.name || job.employerId;
    return typeof name === "string" ? name : "Employer";
  };

  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "E";

  const employerName = currentJob ? getEmployerName(currentJob) : "Employer";

  return (
    <div className="flex overflow-hidden" style={{ height: '100svh', paddingTop: '72px' }}>

      {/* Contacts Sidebar */}
      <div className={`${activeJob ? "hidden md:flex" : "flex"} w-full md:w-64 shrink-0 bg-white border-r border-slate-100 flex-col`}>
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-black text-slate-800 text-sm flex items-center gap-2">
            <MessageSquare size={14} className="text-teal-500" />
            <span className="hidden sm:inline">Messages</span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {uniqueChatJobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-slate-400 text-center">
              <MessageSquare size={32} className="mb-2 opacity-40" />
              <p className="text-xs font-semibold">No active chats</p>
              <p className="text-xs mt-1">Accept a job to start chatting</p>
            </div>
          )}
          {uniqueChatJobs.map((j) => {
            const ename    = getEmployerName(j);
            const einit    = getInitials(ename);
            const isActive = j._id === activeJob;
            const lastMsg  = messages.length > 0 && j._id === activeJob
              ? messages[messages.length - 1] : null;
            return (
              <button
                key={j._id}
                onClick={() => { setActiveJob(j._id); navigate(`/worker/chat/${j._id}`); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all text-left border-b border-slate-50
                  ${isActive ? "bg-teal-50 border-l-2 border-l-teal-500" : ""}`}
              >
                <div className="relative">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0
                    ${isActive ? "bg-teal-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {einit}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className={`text-xs font-bold truncate ${isActive ? "text-teal-700" : "text-slate-700"}`}>{ename}</p>
                  <p className="text-[10px] text-slate-400 truncate">{j.hiringType} · {j.serviceId?.name || "Service"}</p>
                  {lastMsg && <span className="text-[10px] text-slate-400">{fmtTime(lastMsg.sentAt)}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Panel */}
      {!activeJob || !currentJob ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
          <MessageSquare size={48} className="mb-4 opacity-30" />
          <p className="font-semibold text-slate-500">Select a conversation</p>
          <p className="text-sm mt-1">Choose a chat from the left to get started</p>
        </div>
      ) : (
        <div className="w-full md:flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-50">

          {/* Header */}
          <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-black text-xs">
              {getInitials(employerName)}
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm">{employerName}</p>
              <p className="text-[10px] text-emerald-500 font-bold">● ONLINE</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setActiveJob(null)}
                className="md:hidden text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all"
              >
                <ArrowLeft size={12} /> CHATS
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <MessageSquare size={32} className="mb-2 opacity-30" />
                <p className="text-sm font-semibold">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation!</p>
              </div>
            )}
            {messages.map((m, i) => {
              const isMine =
                String(m.senderId) === currentUserId ||
                String(m.senderId?._id) === currentUserId;
              return (
                <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  {!isMine && (
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-black text-[10px] mr-2 mt-1 shrink-0">
                      {getInitials(employerName)}
                    </div>
                  )}
                  <div className={`max-w-[65vw] sm:max-w-xs lg:max-w-sm px-3 py-2 rounded-2xl text-sm leading-relaxed break-words
                    ${isMine ? "bg-[#0F172A] text-white rounded-br-sm" : "bg-white shadow-sm text-slate-800 border border-slate-100 rounded-bl-sm"}`}>
                    {m.audioUrl
                      ? <audio controls src={m.audioUrl} className="max-w-[200px] h-8" />
                      : m.text}
                    <p className="text-[10px] mt-1 opacity-60 flex items-center gap-1 whitespace-nowrap">
                      {fmtTime(m.sentAt)}
                      {isMine && (m.isRead ? <CheckCheck size={11} /> : <Check size={11} />)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div className="bg-white border-t border-slate-100 px-3 py-3 flex flex-col gap-2 shrink-0 w-full">
            {audioURL && !recording && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-wrap">
                <Play size={14} className="text-teal-500 shrink-0" />
                <audio controls src={audioURL} className="flex-1 h-7" />
                <button onClick={discardRecording} className="text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
                <button onClick={sendVoiceMessage} className="bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold px-3 py-1 rounded-lg transition-all">
                  Send
                </button>
              </div>
            )}
            <div className="flex gap-2 items-center md:ml-0 ml-16">
              <input
                className="flex-1 w-0 min-w-0 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50"
                placeholder={recording ? "Recording…" : "Type your message here..."}
                maxLength={500}
                value={text}
                disabled={recording}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              />
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={!!audioURL}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0
                  ${recording ? "bg-red-500 hover:bg-red-400 text-white animate-pulse" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}
                  disabled:opacity-40`}
              >
                {recording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                onClick={handleSend}
                disabled={!text.trim() || recording}
                className="w-10 h-10 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 rounded-xl flex items-center justify-center text-white font-bold transition-all shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}