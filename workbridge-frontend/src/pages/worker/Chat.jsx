import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../hooks/useAuth";
import { useJobManagement } from "../../hooks/useJobManagement";

function fmtTime(d){ if(!d)return""; return new Date(d).toLocaleTimeString("en-PK",{hour:"2-digit",minute:"2-digit"}); }

export default function WorkerChat() {
  const { jobId }        = useParams();
  const navigate         = useNavigate();
  const { user }         = useAuth();
  const { jobs, fetchJobs } = useJobManagement();

  const [text, setText]       = useState("");
  const [activeJob, setActiveJob] = useState(jobId || null);
  const bottomRef = useRef(null);

  useEffect(()=>{ fetchJobs(); },[]);

  const chatJobs = jobs.filter(j=>["Accepted","In Progress","Awaiting Confirmation","Completed"].includes(j.status));

  // Deduplicate by employer
  const seenEmployers = new Set();
  const uniqueChatJobs = chatJobs.filter(j => {
    const eid = String(j.employerId?._id || j.employerId);
    if (seenEmployers.has(eid)) return false;
    seenEmployers.add(eid);
    return true;
  });

  const currentJob = chatJobs.find(j => j._id === activeJob);
  const employerId = currentJob?.employerId?._id || currentJob?.employerId;

  const { messages, send } = useChat(employerId ? String(employerId) : "");

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const handleSend = () => {
  if (!text.trim() || !activeJob) return;
  const receiverId = currentJob?.employerId?._id || currentJob?.employerId;
  send(receiverId, text.trim());
  setText("");
};

  const getEmployerName = (job) => {
    const name = job.employerId?.fullName || job.employerId?.name || job.employerId;
    return typeof name === "string" ? name : "Employer";
  };
  const getInitials = (name="") => name.split(" ").slice(0,2).map(p=>p[0]).join("").toUpperCase() || "E";

  const employerName = currentJob ? getEmployerName(currentJob) : "Employer";

  return (
    <div className="flex h-[calc(100vh-56px)] bg-slate-50 overflow-hidden">

      {/* Contacts Sidebar */}
      <div className="w-64 shrink-0 bg-white border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-black text-slate-800 text-sm">💬 Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {uniqueChatJobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-slate-400 text-center">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-xs font-semibold">No active chats</p>
              <p className="text-xs mt-1">Accept a job to start chatting</p>
            </div>
          )}
          {uniqueChatJobs.map(j => {
            const ename = getEmployerName(j);
            const einit = getInitials(ename);
            const isActive = j._id === activeJob;
            const lastMsg = messages.length > 0 && j._id === activeJob ? messages[messages.length-1] : null;
            return (
              <button key={j._id} onClick={()=>{ setActiveJob(j._id); navigate(`/worker/chat/${j._id}`); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all text-left border-b border-slate-50 ${isActive?"bg-teal-50 border-l-2 border-l-teal-500":""}`}>
                <div className="relative">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${isActive?"bg-teal-500 text-white":"bg-slate-200 text-slate-600"}`}>{einit}</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${isActive?"text-teal-700":"text-slate-700"}`}>{ename}</p>
                  <p className="text-[10px] text-slate-400 truncate">{j.hiringType} · {j.serviceId?.name||"Service"}</p>
                </div>
                {lastMsg && <span className="text-[10px] text-slate-400 shrink-0">{fmtTime(lastMsg.sentAt)}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Panel */}
      {!activeJob || !currentJob ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
          <span className="text-5xl mb-4">💬</span>
          <p className="font-semibold text-slate-500">Select a conversation</p>
          <p className="text-sm mt-1">Choose a chat from the left to get started</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-black text-xs">
              {getInitials(employerName)}
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm">{employerName}</p>
              <p className="text-[10px] text-emerald-500 font-bold">● ONLINE</p>
            </div>
            <button onClick={()=>navigate("/worker/dashboard")}
              className="ml-auto text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all">
              ← BACK
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <span className="text-3xl mb-2">👋</span>
                <p className="text-sm font-semibold">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation!</p>
              </div>
            )}
            {messages.map((m,i) => {
              const isMine = m.senderId === user?.userId || m.senderId === user?._id;
              return (
                <div key={i} className={`flex ${isMine?"justify-end":"justify-start"}`}>
                  {!isMine && <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-black text-[10px] mr-2 mt-1 shrink-0">{getInitials(employerName)}</div>}
                  <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine?"bg-[#0F172A] text-white rounded-br-sm":"bg-white shadow-sm text-slate-800 border border-slate-100 rounded-bl-sm"}`}>
                    {m.text}
                    <p className="text-[10px] mt-1 opacity-60">{fmtTime(m.sentAt)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div className="bg-white border-t border-slate-100 px-5 py-3 flex gap-3 shrink-0">
            <input
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50"
              placeholder="Type your message here..."
              maxLength={500}
              value={text}
              onChange={e=>setText(e.target.value)}
              onKeyDown={e=>e.key==="Enter" && !e.shiftKey && handleSend()}
            />
            <button onClick={handleSend} disabled={!text.trim()}
              className="w-10 h-10 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 rounded-xl flex items-center justify-center text-white font-bold text-lg transition-all shrink-0">
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}